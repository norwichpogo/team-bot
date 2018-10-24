const moment = require('moment');
const Teams = require('./teams');


module.exports.accountAge = (checkBuilder, member) => {
  const accountCreationDate = moment(member.user.createdAt);
  const accountAge = moment.duration(moment().diff(accountCreationDate));
  const accountAgeDays = accountAge.asDays();
  const accountAgeText = `${accountAge.humanize()} ` +
                         `(since ${accountCreationDate.format('DD/MM/YY')})`;
  checkBuilder.add('Account Age',
    accountAgeText, accountAgeDays > 7, accountAgeDays < 1);
};


const MainServerData = require('./data_sources/main_server_data');
const mainServerData = new MainServerData();

module.exports.mainServerData = (checkBuilder, member, botTeam) => {
  const data = mainServerData.get(member.user);
  checkBuilder.add('On Main Server', (data ? 'Yes' : 'No'), data);

  if (!data) return;

  if (data.team) {
    const teamName = Teams.parse(data.team).name;
    checkBuilder.add('Main Server Team', teamName, teamName == botTeam.name);
  }
  
  if (data.joinedAt) {
    const duration = moment.duration(moment().diff(data.joinedAt));
    const durationDays = duration.asDays();
    const durationText = `${duration.humanize()} ` +
                         `(since ${data.joinedAt.format('DD/MM/YY')})`;
    checkBuilder.add('On Main Server For',
      durationText, durationDays > 30, durationDays < 7);
  }
};


const TheSilphRoad = require('./data_sources/the_silph_road');
const theSilphRoad = new TheSilphRoad();

module.exports.theSilphRoad = (checkBuilder, member, botTeam) =>
  theSilphRoad.get(member.user)
    .then(data => {
      checkBuilder.add('TSR Profile', (data ? 'Yes' : 'No'), data, false);

      if (data && data.team) {
        const teamName = Teams.parse(data.team).name;
        checkBuilder.add('TSR Team', teamName, teamName == botTeam.name);
      }
    });
