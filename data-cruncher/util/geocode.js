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
    const req = fetch(`http://open.mapquestapi.com/nominatim/v1/search.php?key=Kmjtd|luua2qu7n9,7a=o5-lzbgq&format=json&q=${encodeURIComponent(str)}`).then(n => n.json());

    previous = req.catch(()=>{}).then(() => sleep(1000));

    const resp = yield req;

    if (resp.length) {
      const {lat, lon: long} = resp[0];
      return {lat, long};
    }

  } catch (e) {
    console.log('Error loading', str, e.reason || e.message);
  }

  return {};
});