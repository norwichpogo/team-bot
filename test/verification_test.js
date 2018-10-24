const TestUtils = require('./utils');
const { Reaction } = require('discordjs-tests').Mocks;

exports['verification'] = {
  setUp: done => {
    this.teamBot = TestUtils.createTestBot();
    done();
  },
  'verification message gets sent': test => {
    const guild = this.teamBot.guildSpec.instance;
    const registeringMember = guild.createMember('TestUser');
    const verificationChannel =
      this.teamBot.guildSpec.channels.get('verification');

    this.teamBot.client.trigger('guildMemberAdd', registeringMember)
      .then(() => {
        const verificationMessage = verificationChannel.messages.array()[0];
        test.ok(verificationMessage);
        test.equal(verificationMessage.reactions.array().length, 2);
        test.done();
      });
  },
  'verify button works': test => {
    const guild = this.teamBot.guildSpec.instance;
    const registeringMember = guild.createMember('TestUser');
    const verificationChannel =
      this.teamBot.guildSpec.channels.get('verification');
    const verifyEmoji = this.teamBot.guildSpec.emoji.get('verify');
    const verifiedRole = this.teamBot.guildSpec.roles.get('verified');
    const verifiedChannel = this.teamBot.guildSpec.channels.get('verified');

    this.teamBot.client.trigger('guildMemberAdd', registeringMember)
      .then(() => {
        const verificationMessage = verificationChannel.messages.array()[0];
        const verifyingMember = guild.createMember();
        const reaction = new Reaction(
          verifyingMember, verifyEmoji, verificationMessage);
        return this.teamBot.client.trigger(
          'messageReactionAdd', reaction, verifyingMember);
      })
      .then(() => {
        test.ok(registeringMember.roles.get(verifiedRole.id));
        test.equal(verifiedChannel.messages.array().length, 1);
        test.done();
      });
  },
  'reject button works': test => {
    const guild = this.teamBot.guildSpec.instance;
    const registeringMember = guild.createMember('TestUser');
    const verificationChannel =
      this.teamBot.guildSpec.channels.get('verification');
    const rejectEmoji = this.teamBot.guildSpec.emoji.get('reject');
    const verifiedRole = this.teamBot.guildSpec.roles.get('verified');
    const rejectedChannel = this.teamBot.guildSpec.channels.get('rejected');

    this.teamBot.client.trigger('guildMemberAdd', registeringMember)
      .then(() => {
        const verificationMessage = verificationChannel.messages.array()[0];
        const verifyingMember = verificationChannel.guild.createMember();
        const reaction = new Reaction(
          verifyingMember, rejectEmoji, verificationMessage);
        return this.teamBot.client.trigger(
          'messageReactionAdd', reaction, verifyingMember);
      })
      .then(() => {
        test.equal(registeringMember.roles.get(verifiedRole.id), undefined);
        test.equal(rejectedChannel.messages.array().length, 1);
        test.done();
      });
  }
};
