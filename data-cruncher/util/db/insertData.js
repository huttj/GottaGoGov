const co           = require('co');
const createTables = require('./createTables');
const calcDistance = require('../calcDistance');
const np           = require('../node-promise');
const geocode      = require('../geocode');

module.exports = co.wrap(function* insertData({
  flights,
  cities,
  counties,
  airlines
}) {

  const db = require('./db')('GottaFlyFed.sqlite');

  yield createTables(db);

  yield airlines.map(insertAirlines);

  yield cities.map(insertCities);

  yield counties.map(insertCounties);

  yield flights.map(insertFlights);

  function insertCities(city) {
    return co(function* (){

      // if (!city.latitude || !city.longitude || !city.county) {
      //   const term = [];
      //   if (city.city) term.push(city.city);
      //   if (city.state) term.push(city.state);
      //   if (city.country) term.push(city.country);
      //
      //   const { lat, long, county } = yield geocode(term.join(', '));
      //
      //   city.latitude  = lat;
      //   city.longitude = long;
      //   city.county    = county;
      //
      // }

      try {
        return yield db.run(`INSERT INTO cities (
         id
        ,name
        ,latitude
        ,longitude
        ,state
        ,county
        ,country
        ,abbr
        
        ,rate
        
      ) VALUES (?,?,?,?,?,?,?,?,?)`, [
          city.id,
          city.city,
          city.latitude,
          city.longitude,
          city.state,
          city.county,
          city.state ? 'USA' : city.country,
          city.abbr,

          JSON.stringify(city.rate)

        ]);

      } catch (e) {
        console.error('Failed to insert into cities', e);
      }

    });
  }

  function insertCounties(county) {
    // console.log(rate);
    return db.run(`
      INSERT INTO counties (
         id
        ,name
        ,state
        ,rate     
      ) VALUES (?,?,?,?)
    `, [
      county.id,
      county.name,
      county.state,
      JSON.stringify(county.rate)
    ]).catch(err => console.error('Failed to insert into counties', err));
  }

  function insertAirlines(airline) {

    return db.run(`
      INSERT INTO airlines (
         id
        ,code
        ,name
        ,favorite        
      ) VALUES (?,?,?,?)
    `, [
      airline.id,
      airline.code,
      airline.name,
      0
    ]).catch(err => console.error('Failed to insert into airlines', err));
  }

  function insertFlights(flight) {
    debugger;
    return db.run(`
      INSERT INTO flights (
         id
        ,originCityId
        ,destinationCityId
        ,itemNum
        ,originAirportAbbrev
        ,destinationAirportAbbrev
        ,originCity
        ,originState
        ,originCountry
        ,originStateAbbrev
        ,originLatitude
        ,originLongitude
        ,destinationCity
        ,destinationState
        ,destinationCountry
        ,destinationStateAbbrev
        ,destinationLatitude
        ,destinationLongitude
        ,airlineAbbrev
        ,originAirportLocation
        ,destinationAirportLocation
        ,rates
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
       flight.id
      ,flight.originCityId
      ,flight.destinationCityId
      ,flight.itemNum
      ,flight.originAirportAbbrev
      ,flight.destinationAirportAbbrev
      ,flight.originCityName
      ,flight.originState
      ,flight.originCountry
      ,flight.originStateAbbrev
      ,flight.originLatitude
      ,flight.originLongitude
      ,flight.destinationCityName
      ,flight.destinationState
      ,flight.destinationCountry
      ,flight.destinationStateAbbrev
      ,flight.destinationLatitude
      ,flight.destinationLongitude
      ,flight.airlineAbbrev
      ,flight.originAirportLocation
      ,flight.destinationAirportLocation
      ,flight.rates
    ]).catch(err => console.error('Failed to insert into flights', err));
  }

});
