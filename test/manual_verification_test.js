const TestUtils = require('./utils');

exports['manual verification'] = {
  setUp: done => {
    this.teamBot = TestUtils.createTestBot();
    done();
  },
  'maunal verification fails': test => {
    const guild = this.teamBot.guildSpec.instance;
    const registeringMember = guild.createMember('TestUser');
    const updatedMember = guild.createMember('TestUser');
    const verifiedRole = this.teamBot.guildSpec.roles.get('verified');

    this.teamBot.client.trigger('guildMemberAdd', registeringMember)
      .then(() => {
        updatedMember.roles.add(verifiedRole.id);

        return this.teamBot.client.trigger(
          'guildMemberUpdate', registeringMember, updatedMember);
      })
      .then(() => {
        test.equal(updatedMember.roles.get(verifiedRole.id), undefined);
        test.done();
      });
  }
};
