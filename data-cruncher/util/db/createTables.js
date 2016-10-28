module.exports = function createTables(db) {
  return dropTables(db).then(() => Promise.all([
    cities(db),
    rates(db),
    flights(db),
    airlines(db)
  ]));
};

function dropTables(db) {
  return Promise.all([
    db.run(`DROP TABLE IF EXISTS cities`),
    db.run(`DROP TABLE IF EXISTS perDiemRates`),
    db.run(`DROP TABLE IF EXISTS flights`),
    db.run(`DROP TABLE IF EXISTS airlines`),

    db.run(`DROP INDEX IF EXISTS perDiemRatesCityId`, []),
    db.run(`DROP INDEX IF EXISTS flightsOriginCityId`, []),
    db.run(`DROP INDEX IF EXISTS flightsDestinationCityId`, [])
  ]);
}

function cities(db) {
  return db.run(`
    CREATE TABLE cities (
        id        INTEGER PRIMARY KEY
       ,name      TEXT
       ,latitude  REAL
       ,longitude REAL
       ,state     TEXT
       ,country   TEXT
       ,abbr      TEXT
       ,saved     INTEGER NON NULL DEFAULT 0
    );
  `, []);
}

function rates(db) {
  return db.run(`
    CREATE TABLE perDiemRates (
        id          INTEGER
       ,cityId      INTEGER
       ,seasonBegin INTEGER
       ,seasonEnd   INTEGER
       ,lodging     INTEGER
       ,mie         INTEGER
    );
  `, []).then(() => indexRates(db));
}

function airlines(db) {
  return db.run(`
    CREATE TABLE airlines (
        id       INTEGER
       ,code     INTEGER
       ,name     INTEGER
       ,favorite INTEGER
    );
  `, []).then(() => indexRates(db));
}

function flights(db) {
  return db.run(`
    CREATE TABLE flights (
        id                          INTEGER
       ,originCityId                INTEGER
       ,destinationCityId           INTEGER
       ,itemNum                     INTEGER
       ,awardYear                   INTEGER
       ,originAirportAbbrev         TEXT
       ,destinationAirportAbbrev    TEXT
       ,originCity                  TEXT
       ,originState                 TEXT
       ,originCountry               TEXT
       ,destinationCity             TEXT
       ,destinationState            TEXT
       ,destinationCountry          TEXT
       ,airlineAbbrev               TEXT
       ,awardedServ                 TEXT
       ,paxCount                    INTEGER
       ,ycaFare                     INTEGER
       ,xcaFare                     INTEGER
       ,businessFare                INTEGER
       ,originAirportLocation       TEXT
       ,destinationAirportLocation  TEXT
       ,effectiveDate               INTEGER
       ,expirationDate              INTEGER
       ,saved                       INTEGER NON NULL DEFAULT 0
    );
  `, []).then(() => indexRates(db));
}

function indexRates(db) {
  return Promise.all([
    // db.run(`CREATE INDEX perDiemRatesCityId       ON perDiemRates(cityId);`, []),
    // db.run(`CREATE INDEX flightsOriginCityId      ON flights(originCityId);`, []),
    // db.run(`CREATE INDEX flightsDestinationCityId ON flights(destinationCityId);`, [])
  ]);
}

function noop() {}