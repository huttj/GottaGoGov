const getStateName = require('./states').getStateName;

module.exports = function groupByCity(cities) {

  return cities.reduce((acc, loc) => {

    loc.abbr  = loc.state;
    loc.state = getStateName(loc.state);

    const destinations = loc.destination.split('/');
    if (destinations.length > 1) {

      destinations.forEach(n => {

        const copy = JSON.parse(JSON.stringify(loc));
        copy.destination = n.trim();

        acc.push(copy);

      });

    } else {
      acc.push(loc);
    }

    return acc;

  }, []);
};