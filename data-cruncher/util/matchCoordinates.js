const cities = require('../data/cities.json');

module.exports = function matchCoordinates(byCity) {

  const perDiem = byCity.reduce((acc, n) => {

    acc[n.state + n.destination] = n;
    return acc;

  }, {});

  return cities.map(n => {
    const per = perDiem[n.state + n.city];

    if (per) {
      n.abbr = per.abbr;
      n.seasons = per.seasons;
      n.countyLocationDefined = per.countyLocationDefined;
    } else {
      n.seasons = null;
    }

    return n;
  });

};