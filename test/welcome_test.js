const TestUtils = require('./utils');

exports['welcome'] = {
  setUp: done => {
    this.teamBot = TestUtils.createTestBot();
    done();
  },
  'welcome message gets sent': test => {
    const guildSpec = this.teamBot.guilds.find(guild => guild.purpose == 'main');
    const registrationChannel = guildSpec.channels.get('registration');
    const registeringMember = guildSpec.instance.createMember();

    this.teamBot.client.trigger('guildMemberAdd', registeringMember)
      .then(() => {
        test.equal(registrationChannel.messages.array().length, 1);
        test.done();
      });
  }
};
