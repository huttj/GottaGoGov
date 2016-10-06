import { Injectable }  from '@angular/core';
import { DataService } from './data';
import City            from '../models/city';

@Injectable()
export class CityService {

  private props = `
     c.id
    ,c.name
    ,c.latitude
    ,c.longitude
    ,c.state
    ,c.country
    ,c.abbr
    ,c.saved
  `;

  private mapCity(city) {
    return new City(city);
  }

  constructor(private data: DataService) {}

  getById(id: number) {
    return this.data.executeSql(`
      SELECT ${this.props}
        FROM cities
       WHERE id = ?
    `, [id])
      .then(rows => rows.map(this.mapCity)[0])
      .catch(toss);
  }

  search(str: string) {
    return this.data.executeSql(`
          SELECT ${this.props}
            FROM cities c
           WHERE c.name  LIKE ?
              OR c.state LIKE ?
              OR c.abbr  LIKE ?
           LIMIT 100
    `, [str+'%',str+'%',str+'%'])
      .then(rows => rows.map(this.mapCity))
      .catch(toss);
  }

}

function toss(err) {
  console.log(err.message, err.stack, err);
  throw err;
}
