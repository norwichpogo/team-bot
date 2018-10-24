const Mystic = {
  name: 'Mystic',
  color: '#0000FF'
};

const Valor = {
  name: 'Valor',
  color: '#FF0000'
};

const Instinct = {
  name: 'Instinct',
  color: '#00FFFF'
};

const teams = [
  Mystic,
  Valor,
  Instinct
];

const parse =
  str => teams.find(team => team.name.toLowerCase() == str.toLowerCase());

module.exports = {
  parse: parse
};

teams.forEach(team => module.exports[team] = team);
