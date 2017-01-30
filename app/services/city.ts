import { Injectable }      from '@angular/core';
import { Http }            from '@angular/http';
import { DataService }     from './data';
import { SettingsService } from './settings';
import calcDistance        from '../util/calcDistance';
import City                from '../models/city';


@Injectable()
export class CityService {

  public pageSize = 10;

  private props = `
     c.id
    ,c.rate
    ,c.latitude
    ,c.longitude
    ,c.name AS city
    ,c.name AS name
    ,c.state
    ,c.county
    ,c.country
    ,c.saved
    ,c.abbr
  `;

  private nodeTypes = /city|administrative|village|hamlet|town|island|suburb|desert|nature_reserve/;


  private newCity(data) : City {

    const time = this.settings.time;

    const rate = JSON.parse(data.rate || '[{}]');

    data.rate = rate.filter(n => {
      return !n.seasonBegin || (n.seasonBegin <= time && n.seasonEnd >= time);
    });

    return new City(data);
  }

  constructor(
    private http: Http,
    private data: DataService,
    private settings: SettingsService
  ) {}

  search(str: string, page:number=0): Promise<City[]> {

    const fuzzy = str+'%';
    const [ city='', state='' ] = str.split(',').map(n => n.trim());

    const params = [str, fuzzy, fuzzy, city, state.toUpperCase(), state+'%', this.pageSize, this.pageSize * page];
    
    return this.data.executeSql(`
          SELECT ${this.props}
            FROM cities c
            
           WHERE (c.abbr = ?
              OR c.state LIKE ?
              OR c.name LIKE ?
              OR (
                    c.name = ? AND (c.abbr = ? OR c.state LIKE ?)
                 ))
             AND c.country = 'USA' 
        ORDER BY c.saved DESC, c.name ASC
           LIMIT ?
           OFFSET ?
    `, params)
      .then(rows => rows.map(r => this.newCity(r)))
      .catch(toss);
  }

  async lookup(str: string):Promise<City[]> {

    // const res = await this.http.get(`http://nominatim.openstreetmap.org/search/${str}?format=json&addressdetails=1&dedupe=1`).toPromise();
    const res = await this.http.get(`http://open.mapquestapi.com/nominatim/v1/search.php?key=Kmjtd|luua2qu7n9,7a=o5-lzbgq&format=json&q=${encodeURIComponent(str)}&addressdetails=1&dedupe=1`).toPromise();
    const json = await res.json();

    console.log(json);

    const cities = values(json
      .reduce((acc, city) => {

        if (!city.type.match(this.nodeTypes)) {
          console.log(city, 'does not match nodeTypes');
          return acc;
        }

        const key = `${city.address[city.type]}:${city.address.state||city.address.country}`;
        if (!acc[key]) {
          console.log(city, 'is NOT a duplicate', key);
          acc[key] = city;
        } else {
          console.log(city, 'is a duplicate', key);
        }

        return acc;

      }, {}))
      .map(this.lookupToCity)
      .filter((n:any) => Boolean(n && n.name && n.latitude && n.longitude));

    // .filter(n => n.type.match(this.nodeTypes))
    // .map(this.lookupToCity)
    // .filter(n => n && n.name && n.latitude && n.longitude);

    console.log(cities);

    return await this.saveCities(cities);

  }

  private lookupToCity(raw) {
    return new City({
      name      : raw.address.city || raw.address[raw.type],
      latitude  : raw.lat,
      longitude : raw.lon,
      state     : raw.address.state,
      county    : raw.address.county,
      country   : raw.address.country
    });
  }

  private saveCities(cities: City[]):Promise<City[]> {
    const res:any = Promise.all(cities.map(city => this.insertAndGet(city)));
    return res;
  }

  private async insertAndGet({ name, latitude, longitude, state, county, country }:any):Promise<City> {

    if (country.match(/United States/i)) {
      country = 'USA';
    }

    const nameNoCity = name.replace(/city/i, '').trim();

    let rows = await this.data.executeSql(`
            SELECT ${this.props}
              FROM cities c
             WHERE (c.name = ? OR c.name = ?)
               AND (
                      (c.state = ? OR (c.state IS NULL AND c.country = ?))
                      OR (c.latitude = ? AND c.longitude = ?)
                   )
          `, [name, nameNoCity, state, country, latitude, longitude]);

    console.log('Checked to see if', name, 'already in DB', rows[0]);

    if (!rows.length) {
      try {

        const [countyData] = await this.data.executeSql(`
          SELECT * FROM counties
          WHERE name = ?
        `, [county]);

        const countyRate = JSON.parse(countyData && countyData.rate || '[{}]');

        let { mie, lodging, seasonBegin, seasonEnd } = countyRate;

        if (!mie || !lodging) {
          mie = 51;
          lodging = 91;
        }

        console.log(name, {mie, lodging, seasonBegin, seasonEnd});

        const rate = JSON.stringify([{mie, lodging, seasonBegin, seasonEnd}]);

        console.log(name, rate);

        await this.data.executeSql(`
              INSERT INTO cities (
                 name
                ,latitude
                ,longitude
                ,state
                ,county
                ,country
                ,saved
                ,abbr
                ,rate
              ) VALUES (?,?,?,?,?,?,?,(SELECT abbr FROM cities WHERE state = ? LIMIT 1),?)
            `, [name, latitude, longitude, state, county, country, false, state, rate]);

      } catch (e) {
        console.error(e);
      }

      rows = await this.data.executeSql(`
            SELECT ${this.props}
              FROM cities c
             WHERE c.name = ?
               AND c.latitude = ?
               AND c.longitude = ?
               AND c.country = 'USA'
          `, [name, latitude, longitude]);
    }

    return this.newCity(rows[0]);
  }

  getSaved() {
    return this.data.executeSql(
      `    SELECT ${this.props}
             FROM cities c
            WHERE c.saved = 1
      `, [])
      .then(rows => rows.map(r => this.newCity(r)))
      .catch(toss);
  }

  save(id) {
    return this.data.executeSql(
      `UPDATE cities SET saved = 1 WHERE id = ?`, [id])
      .catch(toss);
  }

  unsave(id) {
    return this.data.executeSql(
      `UPDATE cities SET saved = 0 WHERE id = ?`, [id])
      .catch(toss);
  }

  getById(id: number): Promise<City> {

    return this.data.executeSql(`
          SELECT ${this.props}
            FROM cities c
           WHERE c.id = ?
    `, [id])
      .then(rows => this.newCity(rows[0]))
      .catch(toss);
  }

  async getNearby(lat:number, long:number): Promise<City[]> {

    const miles = this.settings.range;

    const miPerDeg = 27.0271614;
    // const miPerDeg = 69.1710411;
    const degrees = miles / miPerDeg;

    const latLower  = lat  - degrees;
    const latUpper  = lat  + degrees;
    const longLower = long - degrees;
    const longUpper = long + degrees;


    const sql = `
      SELECT ${this.props}
        FROM cities c
       WHERE
             c.latitude  > ?
         AND c.latitude  < ?
         AND c.longitude > ?
         AND c.longitude < ?
         AND c.country = 'USA'
      
       LIMIT 50
    `;

    const params = [latLower, latUpper, longLower, longUpper];

    const rows     = await this.data.executeSql(sql, params);
    const cities = rows.map(r => this.newCity(r));

    cities.forEach(n => n.distance = calcDistance(lat, long, n.latitude, n.longitude));

    return cities.filter(n => n.distance < miles).sort((a,b) => a.distance - b.distance)

  }

}

function log(str) {
  return function(a) {
    console.log(str, a);
    return a;
  }
}

function toss(err) {
  console.log('tossed error', err.message, err.stack, JSON.stringify(err, null, 2));
  throw err;
}

function values(o) {
  return Object.keys(o).map(key => o[key]);
}
