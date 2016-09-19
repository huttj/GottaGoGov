import { Injectable }  from '@angular/core';
import { DataService } from './data';

@Injectable()
export class PerDiemService {

  private mapCity(city) {
    console.log(`City ${city.City} ${city.Saved ? 'IS' : ' is NOT'} saved: ${city.Saved}`);
    city.Saved = !!city.Saved;
    return city;
  }

  constructor(private data: DataService) {}

  search(str: string) {
    return this.data.executeSql(
      `   SELECT p1.*
            FROM PerDiemRates p1
       LEFT JOIN PerDiemRates p2
              ON p1.City = p2.City
             AND p1.End_Date < p2.End_Date
           WHERE p1.City LIKE ?
             AND p2.ID IS NULL
        ORDER BY p1.Saved DESC, p1.City ASC
           LIMIT 20
      `, [str+'%'])
      .then(rows => rows.map(this.mapCity))
      .catch(toss);
  }

  getSaved() {
    return this.data.executeSql(
      `   SELECT p1.*
            FROM PerDiemRates p1
       LEFT JOIN PerDiemRates p2
              ON p1.City = p2.City
             AND p1.End_Date < p2.End_Date
           WHERE p1.Saved = 1
             AND p2.ID IS NULL
        ORDER BY p1.City ASC
      `, [])
      .then(rows => rows.map(this.mapCity))
      .catch(toss);
  }

  save(id) {
    return this.data.executeSql(
      `UPDATE PerDiemRates SET Saved = 1 WHERE ID = ?`, [id])
      .catch(toss);
  }

  unsave(id) {
    return this.data.executeSql(
      `UPDATE PerDiemRates SET Saved = 0 WHERE ID = ?`, [id])
      .catch(toss);
  }

  getByCity(str: string) {
    return this.data.executeSql("SELECT * FROM PerDiemRates WHERE City = ?", [str])
      .then(rows => rows.map(this.mapCity))
      .catch(toss);
  }

}

function toss(err) {
  console.log(err.message, err.stack, err);
  throw err;
}
