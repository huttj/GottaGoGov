import { Injectable }  from '@angular/core';
import { DataService } from './data';

@Injectable()
export class FlightsService {

  constructor(public data: DataService) {}

  search(originCity: string, destinationCity: string) {

    return this.data.executeSql(
      ` SELECT ID                         AS 'id'
             , ORIGIN_CITY_NAME           AS 'originCity'
             , DESTINATION_CITY_NAME      AS 'destinationCity'
             , ORIGIN_AIRPORT_ABBREV      AS 'originAirport'
             , DESTINATION_AIRPORT_ABBREV AS 'destinationAirport'
             , YCA_FARE                   AS 'ycaFare'
             , XCA_FARE                   AS 'xcaFare'
             , AIRLINE_ABBREV             AS 'airline'
             , SAVED                      AS 'saved'
          FROM Flights
         WHERE ORIGIN_CITY_NAME LIKE ? 
           AND DESTINATION_CITY_NAME LIKE ?
      ORDER BY SAVED DESC, ORIGIN_CITY_NAME ASC, DESTINATION_CITY_NAME ASC`,
      [originCity+'%', destinationCity+'%']
    );
  }

  getSaved() {
    return this.data.executeSql(
      ` SELECT ID                         AS 'id'
             , ORIGIN_CITY_NAME           AS 'originCity'
             , DESTINATION_CITY_NAME      AS 'destinationCity'
             , ORIGIN_AIRPORT_ABBREV      AS 'originAirport'
             , DESTINATION_AIRPORT_ABBREV AS 'destinationAirport'
             , YCA_FARE                   AS 'ycaFare'
             , XCA_FARE                   AS 'xcaFare'
             , AIRLINE_ABBREV             AS 'airline'
             , SAVED                      AS 'saved'
          FROM Flights
         WHERE SAVED = 1
      ORDER BY SAVED DESC, ORIGIN_CITY_NAME ASC, DESTINATION_CITY_NAME ASC`,
      []
    );
  }

  save(id) {
    return this.data.executeSql(
      `UPDATE Flights
          SET SAVED = 1
        WHERE ID = ?`,
      [id]
    );
  }

  unsave(id) {
    return this.data.executeSql(
      `UPDATE Flights
          SET SAVED = 0
        WHERE ID = ?`,
      [id]
    );
  }

}
