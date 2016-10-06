import { Injectable }  from '@angular/core';
import { DataService } from './data';
import calcDistance    from '../util/calcDistance';

import Flight from '../models/flight';


@Injectable()
export class FlightsService {

  constructor(public data: DataService) {}

  search(
    originCity: string,
    destinationCity: string
  ):Promise<Flight[]> {

    return this.data.executeSql(
      `    SELECT *
           FROM flights
           WHERE (
                originCity LIKE ?
                OR flights.originAirportAbbrev LIKE ?
           )
             AND (
                destinationCity LIKE ?
                OR flights.destinationAirportAbbrev LIKE ?
             )
        ORDER BY saved DESC, originCity ASC, destinationCity ASC
           LIMIT 50`,
      [originCity+'%', originCity+'%', destinationCity+'%', destinationCity+'%']
    )
      .catch(toss);
  }

  getSaved() {
    return this.data.executeSql(
      ` SELECT *
          FROM flights
         WHERE saved = 1
      ORDER BY saved DESC, originCity ASC, destinationCity ASC`,
      []
    )
      .catch(toss);
  }

  getById(id):Promise<Flight> {
    return this.data.executeSql(
      `SELECT
                  f.*
                 ,oc.latitude  AS originLatitude
                 ,oc.longitude AS originLongitude
                 ,dc.latitude  AS destinationLatitude
                 ,dc.longitude AS destinationLongitude
            FROM flights f
       LEFT JOIN cities oc
              ON oc.id = f.originCityId
       LEFT JOIN cities dc
              ON dc.id = f.destinationCityId
           WHERE f.id = ?
     `, [id])
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

}

function toss(err) {
  console.log(err.message, err.stack, err);
  throw err;
}
