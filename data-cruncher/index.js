const fs               = require('fs');
const parseCsv         = require('./util/parse-csv');
const groupByCity      = require('./util/groupByCity');
const insertData       = require('./util/db/insertData');
const cities           = require('./util/cities');
const log              = require('./util/log');

// Airlines
log.info('Loading Airlines');
const rawAirlines = fs.readFileSync('./data/airlines.csv', 'utf8');
const airlines    = parseCsv(rawAirlines);

airlines.forEach((n, i) => n.id = i+1);


// PerDiems
log.info('Loading PerDiems');
const rawPerDiem    = fs.readFileSync('./data/per-diem.csv', 'utf8');
const parsedPerDiem = parseCsv(rawPerDiem);
const perDiem       = groupByCity(parsedPerDiem);

let i = 0;
for (let city of perDiem) {
  try {
    city.id = i++;
    city.cityId = cities.getCityId(city.state, city.destination);
  } catch (e) {
    console.error('Failed to getCityId for', city);
    throw e;
  }
}
perDiem.push({
  id: -1,
  cityId: -1,
  lodgingRate: 91,
  mie: 51
});


// City Pairs
log.info('Loading City Pairs');
const rawFlights = fs.readFileSync('./data/award2017.csv', 'utf8');
const flights    = parseCsv(rawFlights);

i = 0;
for (let flight of flights) {
  flight.id = i++;

  flight.originState       = cities.getStateName(flight.originState);
  flight.destinationState  = cities.getStateName(flight.destinationState);

  flight.originCityId      = cities.getCityId(flight.originState, flight.originCityName, flight.originCountry);
  flight.destinationCityId = cities.getCityId(flight.destinationState, flight.destinationCityName, flight.destinationCountry);
}

log.info('Inserting Data');
insertData({
  perDiem,
  flights,
  cities: cities.all(),
  airlines
})
  .then(()=>console.log('Inserted data!'))
  .catch(err => console.error('Failed to insert data:', err));

// fs.writeFileSync('perDiem.json', JSON.stringify(perDiem, null, 2));
// fs.writeFileSync('flights.json', JSON.stringify(flights, null, 2));
// fs.writeFileSync('cities.json', JSON.stringify(cities.all(), null, 2));
