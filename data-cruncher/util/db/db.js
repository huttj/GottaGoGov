const sqlite3 = require('sqlite3');
const np      = require('./../node-promise');


module.exports = function(path) {

  const db = new sqlite3.Database(path);

  return {
    run: function(sql, params=[]) {
      return np(cb => db.run(sql, params, cb));
    },
    get: function(sql, params=[]) {
      return np(cb => db.get(sql, params, cb));
    },
    all: function(sql, params=[]) {
      return np(cb => db.all(sql, params, cb));
    }
  }

};