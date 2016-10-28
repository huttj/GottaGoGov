const co           = require('co');
const createTables = require('./createTables');
const calcDistance = require('../calcDistance');
const np           = require('../node-promise');
const geocode      = require('../geocode');

module.exports = co.wrap(function* insertData({
  perDiem,
  flights,
  cities,
  airlines
}) {

  const db = require('./db')('GottaFlyFed.sqlite');

  yield createTables(db);

  yield airlines.map(insertAirlines);

  yield cities.map(insertCities);

  yield [
    ...perDiem.map(insertRates),
    ...flights.map(insertFlights)
  ];

  function insertCities(city) {
    return co(function* (){

      if (!city.latitude || !city.longitude) {
        const term = [];
        if (city.city) term.push(city.city);
        if (city.state) term.push(city.state);
        if (city.country) term.push(city.country);

        const { lat, long } = yield geocode(term.join(', '));

        city.latitude  = lat;
        city.longitude = long;

      }

      try {
        return yield db.run(`INSERT INTO cities (
         id
        ,name
        ,latitude
        ,longitude
        ,state
        ,country
        ,abbr
      ) VALUES (?,?,?,?,?,?,?)`, [
          city.id,
          city.city,
          city.latitude,
          city.longitude,
          city.state,
          city.state ? 'USA' : city.country,
          city.abbr
        ]);

      } catch (e) {
        console.error('Failed to insert into cities', e);
      }

    });
  }

  function insertRates(rate) {
    // console.log(rate);
    return db.run(`
      INSERT INTO perDiemRates (
         id
        ,cityId      
        ,seasonBegin    
        ,seasonEnd      
        ,lodging
        ,mie        
      ) VALUES (?,?,?,?,?,?)
    `, [
      rate.id,
      rate.cityId,
      rate.seasonBegin || null,
      rate.seasonEnd   || null,
      rate.lodgingRate,
      rate.mie
    ]).catch(err => console.error('Failed to insert into perDiemRates', err));
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
    return db.run(`
      INSERT INTO flights (
         id
        ,originCityId
        ,destinationCityId
        ,itemNum
        ,awardYear
        ,originAirportAbbrev
        ,destinationAirportAbbrev
        ,originCity
        ,originState
        ,originCountry
        ,destinationCity
        ,destinationState
        ,destinationCountry
        ,airlineAbbrev
        ,awardedServ
        ,paxCount
        ,ycaFare
        ,xcaFare
        ,businessFare
        ,originAirportLocation
        ,destinationAirportLocation
        ,effectiveDate
        ,expirationDate
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
      flight.id,
      flight.originCityId,
      flight.destinationCityId,
      flight.itemNum,
      flight.awardYear,
      flight.originAirportAbbrev,
      flight.destinationAirportAbbrev,
      flight.originCityName,
      flight.originState,
      flight.originCountry,
      flight.destinationCityName,
      flight.destinationState,
      flight.destinationCountry,
      flight.airlineAbbrev,
      flight.awardedServ,
      flight.paxCount,
      flight.ycaFare,
      flight.xcaFare,
      flight.businessFare,
      flight.originAirportLocation,
      flight.destinationAirportLocation,
      flight.effectiveDate,
      flight.expirationDate
    ]).catch(err => console.error('Failed to insert into perDiemRates', err));
  }

});