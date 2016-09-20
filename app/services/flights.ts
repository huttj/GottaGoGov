import { Injectable }  from '@angular/core';
import { DataService } from './data';

@Injectable()
export class FlightsService {

  public props = `
       ID                         AS 'id'
     , ORIGIN_CITY_NAME           AS 'originCity'
     , DESTINATION_CITY_NAME      AS 'destinationCity'
     , ORIGIN_AIRPORT_ABBREV      AS 'originAirport'
     , DESTINATION_AIRPORT_ABBREV AS 'destinationAirport'
     , YCA_FARE                   AS 'ycaFare'
     , XCA_FARE                   AS 'xcaFare'
     , AIRLINE_ABBREV             AS 'airline'
     , SAVED                      AS 'saved'`;

  constructor(public data: DataService) {}

  search(originCity: string, destinationCity: string) {

    return this.data.executeSql(
      ` SELECT ${this.props}
          FROM Flights
         WHERE ORIGIN_CITY_NAME LIKE ? 
           AND DESTINATION_CITY_NAME LIKE ?
      ORDER BY SAVED DESC, ORIGIN_CITY_NAME ASC, DESTINATION_CITY_NAME ASC
         LIMIT 50`,
      [originCity+'%', destinationCity+'%']
    )
      .catch(toss);
  }

  getSaved() {
    return this.data.executeSql(
      ` SELECT ${this.props}
          FROM Flights
         WHERE SAVED = 1
      ORDER BY SAVED DESC, ORIGIN_CITY_NAME ASC, DESTINATION_CITY_NAME ASC`,
      []
    )
      .catch(toss);
  }

  getById(id) {
    return this.data.executeSql(
      `SELECT ${this.props}
       FROM Flights
       WHERE id = ?`,
      [id]
    )
      .then(rows => rows[0])
      .catch(toss);
  }

  save(id) {
    return this.data.executeSql(
      `UPDATE Flights
          SET SAVED = 1
        WHERE ID = ?`,
      [id]
    )
      .catch(toss);
  }

  unsave(id) {
    return this.data.executeSql(
      `UPDATE Flights
          SET SAVED = 0
        WHERE ID = ?`,
      [id]
    )
      .catch(toss);
  }

}

function toss(err) {
  console.log(err.message, err.stack, err);
  throw err;
}
