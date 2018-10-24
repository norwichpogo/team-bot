const { Discord } = require('discord.js-wrapper');
const Checks = require('./checks');

class VerificationMessage {
  constructor(member, emoji, team) {
    this.member = member;
    this.emoji = emoji;
    this.team = team;
  }

  build() {
    const message = {
      content: '',
      messageOptions: {}
    };

    const member = this.member;
    const team = this.team;

    const embed = new Discord.MessageEmbed();
    embed.setTitle('Verification Request');
    embed.setDescription(`**User:** ${this.member.user.username}`);
    embed.setThumbnail(member.user.displayAvatarURL());
    embed.setColor(team.color);
    embed.setTimestamp(member.joinedAt);

    message.messageOptions.embed = embed;

    const checkBuilder = new CheckBuilder(this.emoji);

    return Promise.resolve()
      .then(() => Checks.accountAge(checkBuilder, member))
      .then(() => Checks.mainServerData(checkBuilder, member, team))
      .then(() => Checks.theSilphRoad(checkBuilder, member, team))
      .then(() => {
        embed.description += '\n' + checkBuilder.toString();
        return message;
      });
  }
}

VerificationMessage.parse = message => {
  const description = message.embeds[0].description + '\n';
  const username = description.match(/\*\*User:\*\* ([^\n]+)/)[1];
  const member = message.channel.guild.members.find(
    member => member.user.username == username);
  return member;
};

class Check {
  constructor(name, value, passed, hard = true) {
    this.name = name;
    this.value = value;
    this.passed = passed;
    this.hard = hard;
  }

  toString() {
    return `**${this.name}:** ${this.value} ${this.getEmoji()}`;
  }

  getEmoji() {
    let emoji = this.emoji.unsure;

    if (this.passed) {
      emoji = this.emoji.verify;
    } else if (this.hard) {
      emoji = this.emoji.reject;
    }

    return `<:${emoji.name}:${emoji.id}>`;
  }
}

class CheckBuilder {
  constructor(emoji) {
    this.emoji = emoji;
    this.checks = [];
  }

  add(...args) {
    const check = new Check(...args);
    check.emoji = this.emoji;
    this.checks.push(check);
  }

  toString() {
    return this.checks.map(check => check.toString()).join('\n');
  }
}

module.exports = VerificationMessage;
