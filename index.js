process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled rejection at: Promise ', p, ' reason: ', reason);
});

require('dotenv').config();

const moment = require('moment-timezone');
moment.tz.setDefault('Europe/London');

const TeamBot = require('./lib/team_bot');

const teamBot = new TeamBot({
  discordToken: process.env.DISCORD_TOKEN,
  descriptionFile: process.env.DESCRIPTION_FILE,
  name: process.env.BOT_NAME,
  team: process.env.TEAM,
  activityType: process.env.ACTIVITY_TYPE,
  activityName: process.env.ACTIVITY_NAME
});

teamBot.login()
  .catch(console.error);
