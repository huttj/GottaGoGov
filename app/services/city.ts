import { Injectable }  from '@angular/core';
import { Http }        from '@angular/http';
import { DataService } from './data';
import City            from '../models/city';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class CityService {

  public pageSize = 10;

  private props = `
     c.id
    ,c.name
    ,c.latitude
    ,c.longitude
    ,c.state
    ,c.county
    ,c.country
    ,c.abbr
    ,c.saved
  `;

  private nodeTypes = /city|administrative|village|hamlet|town|island|suburb|desert|nature_reserve/;

  private mapCity(city) {
    return new City(city);
  }

  constructor(
    private data: DataService,
    private http: Http
  ) {}

  getById(id: number) {
    return this.data.executeSql(`
      SELECT ${this.props}
        FROM cities c
       WHERE c.id = ?
    `, [id])
      .then(rows => rows.map(this.mapCity)[0])
      .catch(toss);
  }

  search(str: string, page:number=0):Promise<City[]> {
    const fuzzy = str+'%';
    const caps = str.toUpperCase();
    return this.data.executeSql(`
          SELECT ${this.props}
            FROM cities c
           WHERE c.name    LIKE ?
              OR c.state   LIKE ?
              OR c.abbr    = ?
              OR c.country LIKE ?
           LIMIT ?
          OFFSET ?
    `, [fuzzy,fuzzy,caps,fuzzy, this.pageSize, this.pageSize * page])
      .then(rows => rows.map(this.mapCity))
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
      .filter(n => Boolean(n && n.name && n.latitude && n.longitude));

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

  private async insertAndGet({ name, latitude, longitude, state, county, country }):Promise<City> {

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
              ) VALUES (?,?,?,?,?,?,?,(SELECT abbr FROM cities WHERE state = ? LIMIT 1))
            `, [name, latitude, longitude, state, county, country, false, state]);

      } catch (e) {
        console.error(e);
      }

      rows = await this.data.executeSql(`
            SELECT ${this.props}
              FROM cities c
             WHERE c.name = ?
               AND c.latitude = ?
               AND c.longitude = ?
          `, [name, latitude, longitude]);
    }

    return this.mapCity(rows[0]);
  }

}

function toss(err) {
  console.log('tossed error', err.message, err.stack, err);
  throw err;
}

function values(o) {
  return Object.keys(o).map(key => o[key]);
}
