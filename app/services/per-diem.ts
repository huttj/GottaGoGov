import { Injectable }  from '@angular/core';
import { DataService } from './data';
import calcDistance    from '../util/calcDistance';


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

  private mapCity(city) {
    console.log(`City ${city.City} ${city.Saved ? 'IS' : ' is NOT'} saved: ${city.Saved}`);
    city.Saved = !!city.Saved;
    return city;
  }

  constructor(private data: DataService) {}

  search(str: string) {
    const time = Date.now();
    return this.data.executeSql(`
          SELECT ${this.props}
            FROM perDiemRates p
      INNER JOIN cities c
              ON c.id = p.cityId
             AND c.name LIKE ?
           WHERE p.seasonBegin IS NULL
              OR (p.seasonBegin <= ? AND p.seasonBegin >= ?)
           LIMIT 100
    `, [str+'%', time, time])
      .then(rows => rows.map(this.mapCity))
      .catch(toss);
  }

  getSaved() {
    return this.data.executeSql(
      `    SELECT ${this.props}
             FROM perDiemRates p
       INNER JOIN cities c
               ON c.id = p.cityId
              AND c.saved = 1
            WHERE p.seasonBegin IS NULL
               OR (p.seasonBegin <= ? AND p.seasonBegin >= ?)
      `, [])
      .then(rows => rows.map(this.mapCity))
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

  getByCityId(cityId: number) {
    return this.data.executeSql("SELECT * FROM perDiemRates WHERE cityId = ?", [cityId])
      .then(rows => rows.map(this.mapCity))
      .catch(toss);
  }

  getById(id: number) {
    return this.data.executeSql(`
          SELECT ${this.props}
            FROM perDiemRates
      INNER JOIN cities
           WHERE id = ?
    `, [id])
      .then(rows => rows.map(this.mapCity)[0])
      .catch(toss);
  }

  async getByIdWithNearby(id, miles=50) {

    const miPerDeg = 27.0271614;
    // const miPerDeg = 69.1710411;
    const degrees = miles / miPerDeg;

    const rows = await this.data.executeSql(`
      SELECT
         ${this.props}
        ,oc.latitude  AS originLatitude
        ,oc.longitude AS originLongitude
      
      FROM perDiemRates p
      
      INNER JOIN cities c
        ON c.id = p.cityId
      
      LEFT JOIN cities oc
        ON  oc.latitude  IS NOT NULL
        AND oc.longitude IS NOT NULL
        AND  c.latitude  IS NOT NULL
        AND  c.longitude IS NOT NULL
      
        AND c.latitude  > oc.latitude  - ?
        AND c.latitude  < oc.latitude  + ?
        AND c.longitude > oc.longitude - ?
        AND c.longitude < oc.longitude + ?
      
      WHERE p.id = ?
    `, [degrees,degrees,degrees,degrees,id]);

    return rows
      .forEach(n => n.distance = calcDistance(n.originLatitude, n.originLongitude, n.latitude, n.longitude))
      .filter(n => n.distance < miles)
      .sort((a,b) => a.distance - b.distance);

  }

}

function toss(err) {
  console.log(err.message, err.stack, err);
  throw err;
}
