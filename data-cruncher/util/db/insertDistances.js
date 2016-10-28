const cities       = require('../../data/cities.json');
const calcDistance = require('./../calcDistance');

module.exports = function insertDistances(db) {
  
  const promises = [];

  for (let i = 0; i < cities.length; i++) {

    const city = cities[i];

    for (let j = i+1; j < cities.length; j++) {

      const other = cities[j];

      total++;

      db.run(`
        INSERT INTO 
      `, []);
      // console.log(city.city, other.city, calcDistance(
      //   city.latitude,
      //   city.longitude,
      //   other.latitude,
      //   other.longitude
      // ));

    }

  }
  
};