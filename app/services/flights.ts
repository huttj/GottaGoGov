import { Injectable }  from '@angular/core';
import { DataService } from './data';
import calcDistance    from '../util/calcDistance';


@Injectable()
export class FlightsService {

  constructor(public data: DataService) {}

  search(originCity: string, destinationCity: string) {

    return this.data.executeSql(
      `   SELECT *
            FROM flights
           WHERE originCityName LIKE ?
             AND destinationCityName LIKE ?
        ORDER BY saved DESC, originCityName ASC, destinationCityName ASC
           LIMIT 50`,
      [originCity+'%', destinationCity+'%']
    )
      .catch(toss);
  }

  getSaved() {
    return this.data.executeSql(
      ` SELECT *
          FROM flights
         WHERE saved = 1
      ORDER BY saved DESC, originCityName ASC, destinationCityName ASC`,
      []
    )
      .catch(toss);
  }

  getById(id) {
    return this.data.executeSql(
      `SELECT *
       FROM flights
       WHERE id = ?`,
      [id]
    )
      .then(rows => rows[0])
      .catch(toss);
  }

  save(id) {
    return this.data.executeSql(
      `UPDATE flights
          SET saved = 1
        WHERE id = ?`,
      [id]
    )
      .catch(toss);
  }

  unsave(id) {
    return this.data.executeSql(
      `UPDATE flights
          SET saved = 0
        WHERE id = ?`,
      [id]
    )
      .catch(toss);
  }

  getPerDiems(destinationCityId, miles=50) {

    const miPerDeg = 27.0271614;
    // const miPerDeg = 69.1710411;
    const degrees = miles / miPerDeg;

    return this.data.executeSql(`
      SELECT
         f.*
        ,oc.*
        ,fc.latitude  AS flightLatitude
        ,fc.longitude AS flightLongitude
      
      FROM flights f
      
      INNER JOIN cities fc
        ON fc.id = f.destinationCityId
      
      LEFT JOIN cities oc
        ON  oc.latitude  IS NOT NULL
        AND oc.longitude IS NOT NULL
        AND fc.latitude  IS NOT NULL
        AND fc.longitude IS NOT NULL
      
        AND fc.latitude  > oc.latitude  - ?
        AND fc.latitude  < oc.latitude  + ?
        AND fc.longitude > oc.longitude - ?
        AND fc.longitude < oc.longitude + ?
      
      WHERE f.id = ?
    `, [
      degrees,
      degrees,
      degrees,
      degrees,
      destinationCityId
    ]).then((rows:any[]) => rows.filter(n => calcDistance(n.flightLatitude, n.flightLongitude, n.latitude, n.longitude) < miles));

  }

}

function toss(err) {
  console.log(err.message, err.stack, err);
  throw err;
}
