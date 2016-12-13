const fetch = require('isomorphic-fetch');
const co    = require('co');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let previous = Promise.resolve();

module.exports = co.wrap(function* geocode(str) {

  yield previous;

  try {
    // const req = fetch(`http://nominatim.openstreetmap.org/search/${encodeURIComponent(str)}?format=json`).then(n => n.json());
    const req = fetch(`http://open.mapquestapi.com/nominatim/v1/search.php?key=Kmjtd|luua2qu7n9,7a=o5-lzbgq&format=json&q=${encodeURIComponent(str)}&addressdetails=1`).then(n => n.json());
    // const req = fetch(`http://nominatim.openstreetmap.org/search/${encodeURIComponent(str)}?format=json&addressdetails=1&dedupe=1`).then(n => n.json());

    previous = req.catch(()=>{}).then(() => sleep(1000));

    const resp = yield req;

    if (resp.length) {
      let lat, long, county, state = resp[0].address.state;

      let i = 0;
      do {
        if (state === resp[i].address.state && resp[i].type.match(/city|administrative|village|hamlet|town|island|suburb|desert|nature_reserve/)) {
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

        throw new Error('No suitable data found');
      }

      return { lat, long, county };
    }

  } catch (e) {
    console.log('Error loading', str, e.stack || e.reason || e.message);
  }

  return {};
});
