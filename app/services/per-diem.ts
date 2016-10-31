import { Injectable }      from '@angular/core';
import { DataService }     from './data';
import { SettingsService } from './settings';
import calcDistance        from '../util/calcDistance';
import PerDiem             from '../models/per-diem';

@Injectable()
export class PerDiemService {

  private props = `
     p.id
    ,p.cityId
    ,p.lodging
    ,p.mie
    ,c.latitude
    ,c.longitude
    ,c.name AS city
    ,c.state
    ,c.country
    ,c.saved
    ,p.seasonBegin
    ,p.seasonEnd
    ,c.abbr
  `;

  private newPerDiem(data) {
    return new PerDiem(data);
  }

  constructor(
    private data: DataService,
    private settings: SettingsService
  ) {}

  search(str: string) {
    const time = this.settings.time;

    const fuzzy = str+'%';
    const [ city='', state='' ] = str.split(',').map(n => n.trim());

    console.log(city, state);

    const params = [str, fuzzy, fuzzy, city, state+'%', time, time];
    console.log(params);

    return this.data.executeSql(`
          SELECT ${this.props}
            FROM perDiemRates p
      INNER JOIN cities c
              ON c.id = p.cityId
             AND (
                    c.abbr = ?
                    OR c.state LIKE ?
                    OR c.name LIKE ?
                    OR (
                      c.name = ?
                      AND c.state LIKE ?
                    )
                 )
           WHERE p.seasonBegin IS NULL
              OR (p.seasonBegin <= ? AND p.seasonEnd >= ?)
        ORDER BY c.saved DESC, c.name ASC
           LIMIT 100
    `, params)
      .then(rows => rows.map(this.newPerDiem))
      .catch(toss);
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

  async getNearby(lat:number, long:number): Promise<PerDiem[]> {

    const miles = this.settings.range;
    const time = this.settings.time;

    const miPerDeg = 27.0271614;
    // const miPerDeg = 69.1710411;
    const degrees = miles / miPerDeg;

    const latLower  = lat - degrees;
    const latUpper  = lat + degrees;
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
    `;

    const params = [latLower, latUpper, longLower, longUpper, time, time];

    const rows     = await this.data.executeSql(sql, params);
    const perDiems = rows.map(this.newPerDiem);

    perDiems.forEach(n => n.distance = calcDistance(lat, long, n.latitude, n.longitude));

    return perDiems.filter(n => n.distance < miles).sort((a,b) => a.distance - b.distance)

  }

}

function toss(err) {
  console.log('tossed error', err.message, err.stack, JSON.stringify(err, null, 2));
  throw err;
}
