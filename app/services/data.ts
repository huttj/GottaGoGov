import { Injectable } from '@angular/core';
import { SQLite }     from 'ionic-native';
import { Http }       from '@angular/http';

import stringify      from '../util/stringify';

@Injectable()
export class DataService {

  private static dbName = "GottaFlyFed.sqlite";
  private db   = new SQLite();
  private lock = Promise.resolve({});

  constructor(private http: Http) {
    this.onUnlock(() => this.onFirstRun())
      .then(()=>this.connect());
    window['db'] = this.db;
  }

  connect() {

    return this.db.openDatabase({
      name: DataService.dbName,
      iosDatabaseLocation: 'Documents'
    });

  }

  onUnlock(cb) {
    return this.lock = this.lock.then(cb).catch(err => {
      console.log('Error in DataService.lock: ' + stringify(err));
      throw err;
    });
  }

  onFirstRun() {
    return new Promise((res, rej) => window['plugins'].sqlDB.copy(DataService.dbName, 0, res, rej)).catch(()=>{});
  }

  executeSql(sql: string, params: any[] = []) {

    if (window['sqlitePlugin']) {

      return this.lock.then(() => this.db.executeSql(sql, params))

        .then((res:any) => {
          const results = [];
          for (let i = 0, len = res.rows.length; i < len; i++) {
            results.push(res.rows.item(i));
          }
          return results;
        });

    } else {

      return this.http.post('http://localhost:3000', { sql, params }).toPromise()
        .then(res => res.json())
        .catch(e => {
          console.log(e);
          throw e;
        });

    }

  }

}
