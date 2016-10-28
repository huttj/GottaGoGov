module.exports = function parseCsv(raw) {

  const data = csvToObject(raw, true);

  // For perDiem and flight data
  return data.map(n => {

    if (n.seasonBegin || n.fy17MIe) {

      n.seasonBegin = mapDate(n.seasonBegin);
      n.seasonEnd   = mapDate(n.seasonEnd);
      n.lodgingRate = +(n.fy17LodgingRate).slice(1);
      n.mie         = +(n.fy17MIe).slice(1);

    } else if (n.effectiveDate) {

      n.effectiveDate  = shortDate(n.effectiveDate);
      n.expirationDate = shortDate(n.expirationDate);

      n.originCityName              = titleCase(n.originCityName);
      n.destinationCityName         = titleCase(n.destinationCityName);
      n.originAirportLocation       = titleCase(n.originAirportLocation);
      n.destinationAirportLocation  = titleCase(n.destinationAirportLocation);
      n.originCityStateAirport      = titleCase(n.originCityStateAirport);
      n.destinationCityStateAirport = titleCase(n.destinationCityStateAirport);

      n.destinationCityName.replace(' City', '');
      n.originCityName.replace(' City', '');

      n.originCityName      = n.originCityName.split(/\/|-/)[0];
      n.destinationCityName = n.destinationCityName.split(/\/|-/)[0];

    }

    return n;

  });

};

function shortDate(short) {
  if (!short) return short;
  const [month, day, year] = short.split('/');
  return +new Date(2000 + +year, +month-1, +day);
}

function mapDate(source) {
  const months = {
    'January': 0,
    'February': 1,
    'March': 2,
    'April': 3,
    'May': 4,
    'June': 5,
    'July': 6,
    'August': 7,
    'September': 8,
    'October': 9,
    'November': 10,
    'December': 11
  };

  if (!source) return source;
  const [month, date] = source.split(' ');
  const monthNum = months[month];
  // This one starts in October
  const year = monthNum < 9 ? 2017 : 2016;
  return +new Date(year, monthNum, +date);
}


function titleCase(str) {
  return str.split(' ').map((n='') => n && n[0].toUpperCase() + n.slice(1).toLowerCase()).join(' ');
}

function camelCase(n) {
  const str = n.replace(/[A-Za-z0-9]+/g, match => match[0].toUpperCase() + match.slice(1).toLowerCase());
  return (str[0].toLowerCase() + str.slice(1)).replace(/[^A-Za-z0-9]/g, '');
}

function csvToObject(csv, formatHead) {
  const lines = csv.split(/\r?\n/);
  const head = lines[0].match(/("[^"]+"|[^,]*),/g).map(n => n.slice(0,-1)).map(n => (formatHead ? camelCase(n) : n));

  const rows = lines.slice(1).map(n => n.match(/("[^"]+"|[^,]*),/g).map(n => n.slice(0,-1)));
  return rows.reduce((acc, values) => {
    var row = {};

    for (let i = 0; i < head.length; i++) {
      if (head[i]) {

        const val = values[i].trim();
        if (val === '' || isNaN(+val)) {
          row[head[i]] = val.replace(/"/g,'');
        } else {
          row[head[i]] = +val;
        }
      }
    }

    acc.push(row);

    return acc;

  }, []);
}
