import { Injectable }      from '@angular/core';
import { DataService }     from './data';
import { SettingsService } from './settings';
import calcDistance        from '../util/calcDistance';
import PerDiem             from '../models/per-diem';

const perDiemsByCounty = {};

@Injectable()
export class PerDiemService {

  public pageSize = 10;

  private props = `
     p.id
    ,c.id AS cityId
    ,p.lodging
    ,p.mie
    ,c.latitude
    ,c.longitude
    ,c.name AS city
    ,c.state
    ,c.county
    ,c.country
    ,c.saved
    ,p.seasonBegin
    ,p.seasonEnd
    ,c.abbr
  `;



  private newPerDiem(data) : PerDiem {
    return new PerDiem(data);
  }

  constructor(
    private data: DataService,
    private settings: SettingsService
  ) {}

  search(str: string, page:number=0): Promise<PerDiem[]> {
    const time = this.settings.time;

    const fuzzy = str+'%';
    const [ city='', state='' ] = str.split(',').map(n => n.trim());

    console.log(city, state);

    const params = [time, time, str, fuzzy, fuzzy, city+'%', state.toUpperCase(), state+'%', this.pageSize, this.pageSize * page];
    console.log(params);

    return this.data.executeSql(`
          SELECT ${this.props}
            FROM cities c
            
      LEFT JOIN perDiemRates p
              ON (c.id = p.cityId)
             
           WHERE (p.seasonBegin IS NULL
              OR (p.seasonBegin <= ? AND p.seasonEnd >= ?))
              AND (
                    c.abbr = ?
                    OR c.state LIKE ?
                    OR c.name LIKE ?
                    OR (
                      c.name LIKE ?
                      AND (c.abbr = ? OR c.state LIKE ?)
                    )
                 )
        ORDER BY c.saved DESC, c.name ASC
           LIMIT ?
           OFFSET ?
    `, params)
      .then(rows => this.addMissingPerDiems(rows))
      .catch(toss);
  }

  addMissingPerDiems(perDiems): Promise<PerDiem[]> {

    return Promise.all(perDiems.map(async (perDiem) => {


      if (!perDiem.id) {

        console.log('Looking up by county', perDiem);

        const actual = await this.getByCounty(perDiem.county);

        if (actual) {
          perDiem.id = -1;
          perDiem.seasonBegin = actual.seasonBegin;
          perDiem.seasonEnd = actual.seasonEnd;
          perDiem.lodging = actual.lodging;
          perDiem.mie = actual.mie;
        } else {
          console.log('Failed to load actual for', perDiem);
        }
      }

      return this.newPerDiem(perDiem);

    }));
  }

  getSaved() {
    const time = this.settings.time;
    return this.data.executeSql(
      `    SELECT ${this.props}
             FROM perDiemRates p
       INNER JOIN cities c
               ON c.id = p.cityId
              AND c.saved = 1
            WHERE p.seasonBegin IS NULL
               OR (p.seasonBegin <= ? AND p.seasonEnd >= ?)
      `, [time, time])
      .then(rows => rows.map(this.newPerDiem))
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

  getByCityId(cityId: number): Promise<PerDiem> {
    const time = this.settings.time;
    return this.data.executeSql(`
            SELECT ${this.props}
              FROM cities c
        INNER JOIN perDiemRates p 
                ON (p.cityId = c.id OR p.cityId = -1)
             WHERE c.id = ?
               AND (
                     p.seasonBegin IS NULL
                     OR (p.seasonBegin <= ? AND p.seasonEnd >= ?)
                   )
      `, [cityId, time, time])
      .then(rows => rows.map(this.newPerDiem)[0])
      .catch(toss);
  }

  getById(id: number): Promise<PerDiem> {
    return this.data.executeSql(`
          SELECT ${this.props}
            FROM perDiemRates p
      INNER JOIN cities c
              ON c.id = p.cityId
           WHERE p.id = ?
              OR p.id = -1
    `, [id])
      .then(rows => rows.map(this.newPerDiem)[0])
      .catch(toss);
  }

  getByCounty(county: string): Promise<PerDiem> {

    if (!perDiemsByCounty[county]) {
      const time = this.settings.time;

      perDiemsByCounty[county] = this.data.executeSql(`
            SELECT ${this.props}
              FROM cities c
        INNER JOIN perDiemRates p 
                ON (p.cityId = c.id OR p.cityId = -1)
             WHERE (c.county = ? OR p.id = -1)
               AND (
                     p.seasonBegin IS NULL
                     OR (p.seasonBegin <= ? AND p.seasonEnd >= ?)
                   )
          ORDER BY p.cityId DESC
             LIMIT 3
      `, [county, time, time])
        .then(log('byCounty'))
        .then(rows => rows.map(this.newPerDiem)[0])
        .catch(toss);
    }

    return perDiemsByCounty[county];

  }

  async getNearby(lat:number, long:number): Promise<PerDiem[]> {

    const miles = this.settings.range;
    const time = this.settings.time;

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
      INNER JOIN perDiemRates p
              ON p.cityId = c.id
              
      WHERE (
            c.latitude  > ?
        AND c.latitude  < ?
        AND c.longitude > ?
        AND c.longitude < ?
      )
      AND (
        p.seasonBegin IS NULL
        OR (p.seasonBegin <= ? AND p.seasonEnd >= ?)
      )
      LIMIT 200
    `;

    const params = [latLower, latUpper, longLower, longUpper, time, time];

    const rows     = await this.data.executeSql(sql, params);
    const perDiems = rows.map(this.newPerDiem);

    perDiems.forEach(n => n.distance = calcDistance(lat, long, n.latitude, n.longitude));

    return perDiems.filter(n => n.distance < miles).sort((a,b) => a.distance - b.distance)

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
