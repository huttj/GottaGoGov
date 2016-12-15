const cities = require('../data/cities.json');
const states = require('../data/states.json');

const stateByName = Object.keys(states).reduce((acc, n) => {
  acc[states[n].toLowerCase()] = n;
  return acc;
}, {});

function getStateName(abbr) {
  return states[abbr] || abbr;
}

cities.forEach((n, i) => {
  n.abbr = stateByName[n.state.toLowerCase().trim()];
  n.id = i;
  return n;
});

const byCity = cities.reduce((acc, n) => {
  acc[n.state.toLowerCase() + n.city.toLowerCase()] = n;
  return acc;
}, {});

function all() {
  return cities;
}

function getCityId(state, city, country) {
  const stateCity = state.toLowerCase() + city.toLowerCase();
  let loc = byCity[stateCity];

  if (!loc) {
    loc = {
      city,
      state,
      country: state ? 'USA' : titleCase(country),
      abbr: stateByName[state.toLowerCase().trim()],
      id: cities.length
    };
    cities.push(loc);
    byCity[stateCity] = loc;
  }

  return loc.id;
}

function getById(id) {
  return cities[id];
}

function titleCase(str) {
  return str.split(' ').map((n='') => n && n[0].toUpperCase() + n.slice(1).toLowerCase()).join(' ');
}

module.exports = {
  all,
  getCityId,
  getStateName,
  getById
};
