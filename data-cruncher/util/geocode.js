const fetch = require('isomorphic-fetch');
const co    = require('co');



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let previous = Promise.resolve();

const mapping = require('../cache/geocodes.json') || {};

module.exports = co.wrap(function* geocode(str) {

  if (mapping[str]) return mapping[str];

  yield previous;

  try {
    // const req = fetch(`http://nominatim.openstreetmap.org/search/${encodeURIComponent(str)}?format=json`).then(n => n.json());
    const req = fetch(`http://open.mapquestapi.com/nominatim/v1/search.php?key=Kmjtd|luua2qu7n9,7a=o5-lzbgq&format=json&q=${encodeURIComponent(str)}&addressdetails=1`).then(n => n.json());
    // const req = fetch(`http://nominatim.openstreetmap.org/search/${encodeURIComponent(str)}?format=json&addressdetails=1&dedupe=1`).then(n => n.json());

    previous = req.catch(()=>{});//.then(() => sleep(1));

    const resp = yield req;

    if (resp.length) {
      let lat, long, county, state = resp[0].address.state;

      let i = 0;
      do {
        if (state === resp[i].address.state && resp[i].type.match(/aerodrome|city|administrative|village|hamlet|town|island|suburb|desert|nature_reserve/)) {
          lat = resp[i].lat;
          long = resp[i].lon;
          county = resp[i].address.county;
        }
        i++;
      } while (!county && resp[i]);

      if (!lat || !long) {

        if (str.match(/city/i)) {
          const replaced = str.replace(/city/gi, '').trim();
          return yield co(geocode, replaced);
        }

        console.log(resp);

        if (resp[0].county) {
          return {
            lat: resp[0].lat,
            long: resp[0].long,
            county: resp[0].county
          };
        }

        throw new Error('No suitable data found');
      }

      mapping[str] = { lat, long, county };

      return { lat, long, county };
    }

  } catch (e) {
    console.log('Error loading', str, e.stack || e.reason || e.message);
  }

  return {};
});

module.exports.getMapping = function() {
  return mapping;
};
