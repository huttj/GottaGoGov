const sqlite3 = require('sqlite3');
const http    = require('http');

// const db = new sqlite3.Database(__dirname + '/../app/GottaFlyFed.sqlite');
const db = new sqlite3.Database(__dirname + '/GottaFlyFed.sqlite');

db.all(`DELETE FROM cities WHERE name = ?`, ['test'], (err, rows) => {
  console.log(err, rows);
});

