const fs               = require('fs');
const parseCsv         = require('./parse-csv');

const rawFlights = fs.readFileSync('../data/award2017.csv', 'utf8');
const flights    = parseCsv(rawFlights);

fs.writeFileSync('flights.json', JSON.stringify(flights, null, 2));