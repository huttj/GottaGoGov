const states = require('../data/states.json');

const byStateName = Object.keys(states).reduce((acc, abbr) => {
  acc[states[abbr]] = abbr;
  return acc;
}, {});

function getStateName(abbr) {
  return states[abbr];
}

function getAbbr(stateName) {
  return byStateName[stateName];
}

module.exports = {
  getStateName,
  getAbbr
};