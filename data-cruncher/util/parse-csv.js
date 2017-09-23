module.exports = function parseCsv(raw, year) {

  const data = csvToObject(raw, true);

  // For perDiem and flight data
  return data.map(n => {

    if (n.seasonBegin || n.fy17MIe || n.fy18MIe) {

      n.seasonBegin = mapDate(year, n.seasonBegin);
      n.seasonEnd   = mapDate(year, n.seasonEnd, true);
      n.lodgingRate = +(n.fy17LodgingRate || n.fy18LodgingRate).slice(1);
      n.mie         = +(n.fy17MIe || n.fy18MIe).slice(1);

    } else if (n.effectiveDate) {

      if (shortDate(n.effectiveDate) === 64620745200000) {
        debugger;
      }

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
  return +new Date(year.length === 2 ? 2000 + +year : +year, +month-1, +day);
}

function mapDate(year, source, end) {
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

  const shortMonths = {
    'Jan': 0,
    'Feb': 1,
    'Mar': 2,
    'Apr': 3,
    'May': 4,
    'Jun': 5,
    'Jul': 6,
    'Aug': 7,
    'Sep': 8,
    'Oct': 9,
    'Nov': 10,
    'Dec': 11
  };

  if (!source) {

    const date = new Date();

    date.setFullYear(end ? year : year - 1);

    date.setMonth(9);
    date.setDate(1);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return +date;
  }

  try {

    const [,date, month] = source.match(/(\d+)-(\w+)/);
    if (!date || !month) throw new Error('Not the new format');
    const monthNum = shortMonths[month];
    // This one starts in October
    const actualYear = monthNum < 9 ? year : year - 1;
    return +new Date(actualYear, monthNum, +date + (end ? 1 : 0)) - (end ? 1 : 0);

  } catch (e) {

    const [month, date] = source.split(' ');
    const monthNum = months[month];
    // This one starts in October
    const actualYear = monthNum < 9 ? year : year - 1;
    return +new Date(actualYear, monthNum, +date + (end ? 1 : 0)) - (end ? 1 : 0);

  }

}


function titleCase(str) {
  return str.split(' ').map((n='') => n && n[0].toUpperCase() + n.slice(1).toLowerCase()).join(' ');
}

function camelCase(n) {
  if (!n) return n;
  const str = n.replace(/[A-Za-z0-9]+/g, match => match[0].toUpperCase() + match.slice(1).toLowerCase());
  return (str[0].toLowerCase() + str.slice(1)).replace(/[^A-Za-z0-9]/g, '');
}

function csvToObject(csv, formatHead) {
  const lines = csv.split(/\r?\n/);

  if (!lines[lines.length-1]) lines.pop();

  const head = lines[0]
    .match(/("[^"]+"|[^,]*),?/g)
    .map(n => n.trim()) // Remove extra spa
    .map(n => n[n.length-1] === ',' ? n.slice(0,-1) : n) // Pull off trailing comma
    .map(n => (formatHead ? camelCase(n) : n)); // camelCase it

  const rows = lines
    .slice(1)
    .map(n => n.match(/("[^"]+"|[^,]*),?/g)
      .map(n => n[n.length-1] === ',' ? n.slice(0,-1) : n));

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
