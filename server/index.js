const sqlite3 = require('sqlite3');
const http    = require('http');

const db = new sqlite3.Database(__dirname + '/../app/GottaFlyFed.sqlite');

http.createServer((req, res) => {

  console.log(req.method, req.url, new Date());

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Accept', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.setHeader('Allow', 'GET, POST, PUT, PATCH, HEAD, OPTIONS');
    return res.end('');
  }

  try {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');

    let data = '';

    req.on('data', chunk => data += chunk);

    req.on('end', () => {

      try {

        const {sql, params} = JSON.parse(data);

        console.log(sql);
        console.log(params);

        db.all(sql, params, (err, rows) => {

          if (err) {
            console.error(err);
            res.statusCode = 400;
            res.end(err.stack || err.message || err);

          } else {
            console.log(rows);
            res.end(JSON.stringify(rows));
          }

        });

      } catch (e) {
        res.statusCode = 500;
        res.end(e.stack);
      }

    });

  } catch (e) {

    res.statusCode = 500;
    res.end(e.stack);
  }


}).listen(3000);
