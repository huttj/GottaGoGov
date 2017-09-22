const fs          = require('fs');
const co          = require('co');

const parseCsv    = require('./util/parse-csv');
const groupByCity = require('./util/groupByCity');
const insertData  = require('./util/db/insertData');
const cities      = require('./util/cities');
const log         = require('./util/log');
const geocode     = require('./util/geocode');

// Airlines
log.info('Loading Airlines');
const rawAirlines = fs.readFileSync('./data/airlines.csv', 'utf8');
const airlines    = parseCsv(rawAirlines);

airlines.forEach((n, i) => n.id = i+1);

const perDiems = [
  ...loadPerDiemsByYear(2017),
  ...loadPerDiemsByYear(2018)
];

const flights = [
  ...loadCityPairsByYear(2017),
  ...loadCityPairsByYear(2018)
];

function loadPerDiemsByYear(year) {
  // PerDiems
  log.info('Loading PerDiems');
  const rawPerDiem    = fs.readFileSync(`./data/per-diem-${year}.csv`, 'utf8');
  const parsedPerDiem = parseCsv(rawPerDiem, year);
  const perDiems      = groupByCity(parsedPerDiem);


  for (let perDiem of perDiems) {
    try {

      const city = cities.getById(cities.getCityId(perDiem.state, perDiem.destination));

      if (!city.rate) city.rate = [];

      city.rate.push({
        lodging     : perDiem.lodgingRate,
        mie         : perDiem.mie,
        seasonBegin : perDiem.seasonBegin,
        seasonEnd   : perDiem.seasonEnd
      });

    } catch (e) {
      console.error('Failed to getCityId for', perDiem);
      throw e;
    }
  }

  return perDiems;
}


// cities.all().push({
//   id: -1,
//   cityId: -1,
//   lodgingRate: 91,
//   mie: 51
// });


function loadCityPairsByYear(year) {
  // City Pairs
  log.info('Loading City Pairs');
  const rawFlights = fs.readFileSync(`./data/city-pairs-${year}.csv`, 'utf8');
  const flights    = parseCsv(rawFlights);

  i = 0;
  for (let flight of flights) {
    flight.id = i++;

    flight.originState       = cities.getStateName(flight.originState);
    flight.destinationState  = cities.getStateName(flight.destinationState);

    flight.originCityId      = cities.getCityId(flight.originState, flight.originCityName, flight.originCountry);
    flight.destinationCityId = cities.getCityId(flight.destinationState, flight.destinationCityName, flight.destinationCountry);
  }

  return flights;
}




(async function() {

  const counties = {};
  const allCities = cities.all();

  log.info('Loading County Data');

  const total = allCities.length;
  let i = 1;
  for (const city of allCities) {

    log.info(`${i++}/${total}`, 'Loading county data for:', `${city.city}, ${city.state || city.country}`);
    const { lat, long, county } = await geocode(`${city.city}, ${city.state || city.country}`);

    city.latitude  = lat;
    city.longitude = long;
    city.county    = county;

    if (county) {
      const key = `${county}:${city.state}`;

      const countyData = counties[key];

      if (!countyData || !countyData.rate || !city.rate || countyData.rate.lodging > city.rate.lodging) {
        counties[key] = {
          name        : county,
          state       : city.state,
          rate        : city.rate
        };

      } else if (countyData && !city.rate) {
        city.rate = countyData.rate;
      }

    }

  }

  for (const city of allCities) {

    if ((!city.rate)) {

      if (city.county) {
        const key = `${city.county}:${city.state}`;
        const county = counties[key];

        county.rate = city.rate = county.rate || [
            {
              mie         : 51,
              lodging     : 91,
              seasonBegin : 0,
              seasonEnd   : 1506841200838,
              fallback    : true,
            },{
              mie         : 51,
              lodging     : 93,
              seasonBegin : 1506841200838,
              seasonEnd   : 5000000000000,
              fallback    : true,
            }
        ];


      } else {
        city.rate = [
          {
            mie         : 51,
            lodging     : 91,
            seasonBegin : 0,
            seasonEnd   : 1506841200838,
            fallback    : true,
          },{
            mie         : 51,
            lodging     : 93,
            seasonBegin : 1506841200838,
            seasonEnd   : 5000000000000,
            fallback    : true,
          }
        ];
      }
    }

  }

  for (const flight of flights) {
    const origin           = cities.getById(flight.originCityId);
    const destination      = cities.getById(flight.destinationCityId);

    try {

      flight.destinationLat       = destination.lat;
      flight.destinationLong      = destination.long;
      flight.destinationStateAbbr = destination.abbr;

      flight.originLat            = origin.lat;
      flight.originLong           = origin.long;
      flight.originStateAbbr      = origin.abbr;

    } catch (e) {
      console.log("Couldn't find flight:", flight);
    }
  }

  const allCounties = Object.keys(counties).map(n => counties[n]);


  log.info('Saving JSON');

  saveJson({
    flights,
    cities: cities.all(),
    counties: allCounties,
    airlines,
    geocodes: geocode.getMapping()
  });

  log.info('Inserting Data');

  await insertData({
    flights,
    cities: cities.all(),
    counties: allCounties,
    airlines
  });

  console.log('Inserted data!');

})().catch(console.log);


function saveJson(obj) {
  for (const key in obj) {
    fs.writeFileSync(`./cache/${key}.json`, JSON.stringify(obj[key]));
  }
}
