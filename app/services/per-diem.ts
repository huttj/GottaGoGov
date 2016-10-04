import { Injectable }  from '@angular/core';
import { DataService } from './data';
import calcDistance    from '../util/calcDistance';
import PerDiem         from '../models/per-diem';

@Injectable()
export class PerDiemService {

  private props = `
     p.id
    ,p.cityId
    ,p.lodgingRate
    ,p.mie
    ,c.latitude
    ,c.longitude
    ,c.name AS city
    ,c.state
    ,c.saved
    ,p.seasonBegin
    ,p.seasonEnd
    ,c.abbr
  `;

  private newPerDiem(data) {
    return new PerDiem(data);
  }

  constructor(private data: DataService) {}

  search(str: string) {
    const time = Date.now();
    return this.data.executeSql(`
          SELECT ${this.props}
            FROM perDiemRates p
      INNER JOIN cities c
              ON c.id = p.cityId
             AND (
                       c.name  LIKE ?
                    OR c.state LIKE ?
                    OR c.abbr  LIKE ?
                 )
           WHERE p.seasonBegin IS NULL
              OR (p.seasonBegin <= ? AND p.seasonEnd >= ?)
        ORDER BY c.name ASC
           LIMIT 100
    `, [str+'%', str+'%', str+'%', time, time])
      .then(rows => rows.map(this.newPerDiem))
      .catch(toss);
  }

  getSaved() {
    const time = Date.now();
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
    return this.data.executeSql(`
            SELECT ${this.props}
              FROM perDiemRates p
        INNER JOIN cities c 
                ON p.cityId = c.id
             WHERE p.cityId = ?
      `, [cityId])
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
    `, [id])
      .then(rows => rows.map(this.newPerDiem)[0])
      .catch(toss);
  }

  getNearby(lat:number, long:number, miles:number=50): Promise<PerDiem[]> {

    const time = Date.now();
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


    return this.data.executeSql(sql, params)
      .then(res => res.map(this.newPerDiem))
      .then((rows:PerDiem[]) => {

        console.log('rows', JSON.stringify(rows, null, 2));

        rows.forEach(n => n.distance = calcDistance(lat, long, n.latitude, n.longitude));

        return rows.filter(n => n.distance < miles).sort((a,b) => a.distance - b.distance)

      })
      .catch(toss);

  }

}

function toss(err) {
  console.log(err.message, err.stack, JSON.stringify(err, null, 2));
  throw err;
}
