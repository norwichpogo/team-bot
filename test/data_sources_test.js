const { User } = require('discordjs-tests').Mocks;
const MainServerData = require('../lib/data_sources/main_server_data');
const TheSilphRoad = require('../lib/data_sources/the_silph_road');

const mainServerData = new MainServerData('./test/data/main_server_data.json');
const theSilphRoad = new TheSilphRoad();

exports['data sources'] = {
  'main sever data - no match': test => {
    const user = new User();
    user.id = '99999999999999999';

    const userData = mainServerData.get(user);
    test.equal(userData, undefined);
    test.done();
  },
  'main sever data - team not set': test => {
    const user = new User();
    user.id = '00000000000000001';

    const userData = mainServerData.get(user);
    test.equal(userData.team, undefined);
    test.done();
  },
  'main sever data - team mystic': test => {
    const user = new User();
    user.id = '00000000000000002';

    const userData = mainServerData.get(user);
    test.equal(userData.team, 'mystic');
    test.done();
  },
  'main sever data - team valor': test => {
    const user = new User();
    user.id = '00000000000000003';

    const userData = mainServerData.get(user);
    test.equal(userData.team, 'valor');
    test.done();
  },
  'the silph road - no match': test => {
    const user = new User();
    user.username = 'UnknownTestUser';

    theSilphRoad.get(user)
      .then(userData => {
        test.equal(userData, undefined);
      })
      .finally(test.done);
  },
  'the silph road - team mystic': test => {
    const user = new User();
    user.username = 'MYSTlC7HWD';

    theSilphRoad.get(user)
      .then(userData => {
        test.equal(userData.team, 'mystic');
      })
      .finally(test.done);
  },
  'the silph road - team valor': test => {
    const user = new User();
    user.username = 'marcoceppi';

    theSilphRoad.get(user)
      .then(userData => {
        test.equal(userData.team, 'valor');
      })
      .finally(test.done);
  }
};
