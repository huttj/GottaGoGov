module.exports = function createTables(db) {
  return dropTables(db).then(() => Promise.all([
    cities(db),
    counties(db),
    flights(db),
    airlines(db)
  ]));
};

function dropTables(db) {
  return Promise.all([
    db.run(`DROP TABLE IF EXISTS cities`),
    db.run(`DROP TABLE IF EXISTS counties`),
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
        id          INTEGER PRIMARY KEY
       ,name        TEXT
       ,latitude    REAL
       ,longitude   REAL
       ,state       TEXT
       ,county      TEXT
       ,country     TEXT
       ,abbr        TEXT
       ,saved       INTEGER NON NULL DEFAULT 0
       ,rate        TEXT
    );
  `, []);
}

function counties(db) {
  return db.run(`
    CREATE TABLE counties (
        id          INTEGER PRIMARY KEY
       ,name        TEXT
       ,state       TEXT
       ,rate        TEXT
    );
  `, []);
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
       ,originAirportAbbrev         TEXT
       ,destinationAirportAbbrev    TEXT
       ,originCity                  TEXT
       ,originState                 TEXT
       ,originCountry               TEXT
       ,originStateAbbrev           TEXT
       ,originLatitude              REAL
       ,originLongitude             REAL
       ,destinationCity             TEXT
       ,destinationState            TEXT
       ,destinationCountry          TEXT
       ,destinationStateAbbrev      TEXT
       ,destinationLatitude         REAL
       ,destinationLongitude        REAL
       ,airlineAbbrev               TEXT
       ,originAirportLocation       TEXT
       ,destinationAirportLocation  TEXT
       ,effectiveDate               INTEGER
       ,expirationDate              INTEGER
       ,saved                       INTEGER NON NULL DEFAULT 0
       ,rates                       TEXT
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
