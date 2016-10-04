import { Injectable }  from '@angular/core';
import { DataService } from './data';
import calcDistance    from '../util/calcDistance';


@Injectable()
export class CityService {

  private props = `
     c.id
    ,c.name
    ,c.lodgingRate
    ,c.mie
    ,c.latitude
    ,c.longitude
    ,c.state
    ,c.abbr
    ,c.saved
  `;

  private mapCity(city) {
    console.log(`City ${city.City} ${city.Saved ? 'IS' : ' is NOT'} saved: ${city.Saved}`);
    city.Saved = !!city.Saved;
    return city;
  }

  constructor(private data: DataService) {}

  getById(id: number) {
    return this.data.executeSql(`
      SELECT * FROM cities WHERE id = ?
    `, [id])
      .then(rows => rows.map(this.mapCity)[0])
      .catch(toss);
  }

  search(str: string) {
    return this.data.executeSql(`
          SELECT *
            FROM cities c
           WHERE c.name LIKE ?
              OR c.state LIKE ?
              OR c.ABBR LIKE ?
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
