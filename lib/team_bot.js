const { Bot, Discord } = require('discord.js-wrapper');
const VerificationMessage = require('./verification_message');
const Teams = require('./teams');

class TeamBot extends Bot {
  constructor(options) {
    super(options);
    this.team = Teams.parse(options.team);
    this.name = options.name;
    this.avatar = options.avatar;

    if (options.activity) {
      if (options.activity.type && options.activity.name) {
        this.activity = options.activity;
      } else {
        throw new Error('You must pass both an activity name and type ' +
                        'to set the bot\'s activity');
      }
    }

    this.timeUntilChannelVisible = 2000;
    this.guildSpec = this.guilds.find(guild => guild.purpose == 'main');
    this.setup();
  }

  setup() {
    this.on('ready', () => this.ready());

    this.on('guildMemberAdd', member =>
      this.sendRegistrationMessage(member)
        .then(() => this.sendVerificationMessage(member)));

    this.on('messageReactionAdd', (reaction, user) => {
      const reactionChannelIds = [
        this.guildSpec.channels.get('verification').id,
        this.guildSpec.channels.get('verified').id,
        this.guildSpec.channels.get('rejected').id
      ];

      if ((!user.bot) &&
          (reaction.message.author.id == this.client.user.id) &&
          (reactionChannelIds.includes(reaction.message.channel.id))) {
        return this.handleVerificationReaction(reaction);
      }
    });

    this.on('guildMemberUpdate', (oldMember, newMember) =>
      this.blockManualVerification(oldMember, newMember));
  }

  ready() {
    return Promise.resolve()
      .then(() => {
        if (this.name && (this.client.user.username != this.name)) {
          return this.client.user.setUsername(this.name);
        }
      })
      .then(() => {
        if (this.avatar) {
          return this.client.user.setAvatar(this.avatar);
        }
      })
      .then(() => {
        if (this.activity) {
          return this.client.user.setActivity(this.activity.name, {
            type: this.activity.type.toUpperCase()
          });
        }
      })
      .then(() => {
        const fetchMessages = this.guildSpec.channels.map(
          channelSpec => channelSpec.instance.messages.fetch({ limit: 100 }));
        return Promise.all(fetchMessages);
      });
  }

  sendRegistrationMessage(member) {
    const registrationChannel = this.guildSpec.channels.get('registration');

    return new Promise(resolve => {
      /* Wait until the user can see the channel. */
      setTimeout(() => {
        registrationChannel.send(
          `Welcome <@${member.id}>.\n\n` +
          `Please wait while we check that you're team ${this.team.name}.\n` +
          'This may take anywhere from a couple of minutes to a couple of ' +
          'hours, depending on how busy the mods are.\n\n' +
          'The mods can be summoned using the `@mod` tag if you have an ' +
          'urgent query or concern.'
        ).then(resolve);
      }, this.timeUntilChannelVisible);
    });
  }

  sendVerificationMessage(member) {
    const emoji = {};
    this.guildSpec.emoji.forEach(em => emoji[em.purpose] = em.instance);

    const verificationChannel = this.guildSpec.channels.get('verification');
    const verificationMessage =
      new VerificationMessage(member, emoji, this.team);

    return verificationMessage.build()
      .then(message =>
        verificationChannel.send(message.content, message.messageOptions))
      .then(message => {
        const verifyEmoji = this.guildSpec.emoji.get('verify');
        const rejectEmoji = this.guildSpec.emoji.get('reject');

        return Promise.resolve()
          .then(Promise.resolve(message.react(verifyEmoji)))
          .then(Promise.resolve(message.react(rejectEmoji)));
      });
  }

  handleVerificationReaction(reaction) {
    const verifyEmoji = this.guildSpec.emoji.get('verify');
    const rejectEmoji = this.guildSpec.emoji.get('reject');
    const verifying = reaction.emoji.id == verifyEmoji.id;
    const rejecting = reaction.emoji.id == rejectEmoji.id;
    const registeringMember = VerificationMessage.parse(reaction.message);

    return Promise.resolve()
      .then(() => {
        if (!registeringMember) return;

        const verifiedRole = this.guildSpec.roles.get('verified');
        const alreadyVerified = registeringMember.roles.get(verifiedRole);

        if (verifying && (!alreadyVerified)) {
          return this.verifyMember(registeringMember);
        } else if (rejecting) {
          return this.rejectMember(registeringMember);
        }
      })
      .then(() => {
        if (verifying) {
          return this.moveVerificationMessageToVerified(reaction.message);
        } else if (rejecting) {
          return this.moveVerificationMessageToRejected(reaction.message);
        }
      });
  }

  verifyMember(member) {
    const verifiedRole = this.guildSpec.roles.get('verified');
    const addRole = member.roles.add(
      verifiedRole.id, 'User has been verified');

    return Promise.resolve(addRole);
  }

  rejectMember(member) {
    const verifiedRole = this.guildSpec.roles.get('verified');
    const removeRole = member.roles.remove(
      verifiedRole.id, 'Verification unsuccessful');

    return Promise.resolve(removeRole);
  }

  moveVerificationMessageToVerified(message) {
    return Promise.resolve(message.delete())
      .then(() => {
        const verifiedChannel = this.guildSpec.channels.get('verified');

        return verifiedChannel.send('', {
          embed: message.embeds[0]
        });
      })
      .then(message => {
        const rejectEmoji = this.guildSpec.emoji.get('reject');
        return message.react(rejectEmoji);
      });
  }

  moveVerificationMessageToRejected(message) {
    return Promise.resolve(message.delete())
      .then(() => {
        const rejectedChannel = this.guildSpec.channels.get('rejected');

        return rejectedChannel.send('', {
          embed: message.embeds[0]
        });
      })
      .then(message => {
        const verifyEmoji = this.guildSpec.emoji.get('verify');
        return message.react(verifyEmoji);
      });
  }

  blockManualVerification(oldMember, newMember) {
    const verifiedRole = this.guildSpec.roles.get('verified');
    const wasVerified = oldMember.roles.get(verifiedRole.id);
    const isVerified = newMember.roles.get(verifiedRole.id);

    if (!wasVerified && isVerified) {
      const fetchAuditLogs = newMember.guild.fetchAuditLogs({
        type: Discord.GuildAuditLogs.Actions.MEMBER_ROLE_UPDATE
      });

      return fetchAuditLogs
        .then(log => {
          const roleChanges = log.entries.array().filter(
            entry => entry.target.id == newMember.id);

          const mostRecentChange = roleChanges.sort(
            (a, b) => b.createdAt - a.createdAt)[0];

          let resetRole = true;
          let updater = mostRecentChange;

          if (mostRecentChange && mostRecentChange.executor) {
            updater = mostRecentChange.executor;
          }

          if (updater &&
              (updater.bot || (updater.id == newMember.guild.owner.id))) {
            resetRole = false;
          }

          if (resetRole) {
            newMember.roles.set(oldMember.roles, 'Automated role reset');

            if (updater) {
              return updater.send(
                'Please leave role management to me.\n' +
                'If I\'m not around then you\'re welcome to take ' +
                'over, but otherwise please verify users using the ' +
                '#verifiction channel.');
            }
          }
        });
    }
  }
}

module.exports = TeamBot;
