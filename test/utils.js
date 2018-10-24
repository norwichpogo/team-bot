const { TestUtils } = require('discord.js-wrapper');
const TeamBot = require('../lib/team_bot');

const createTestBot = options => {
  const defaultOptions = {
    descriptionFile: 'setup.json',
    team: 'mystic'
  };
  const opts = Object.assign({}, defaultOptions, options);

  const teamBot = new TeamBot(opts);
  teamBot.timeUntilChannelVisible = 0;
  TestUtils.setupTestBot(teamBot);
  teamBot.setup();
  return teamBot;
};

module.exports = {
  createTestBot: createTestBot
};
