import { Injectable }      from '@angular/core';
import { SQLite }          from 'ionic-native';
import { Http }            from '@angular/http';
import { AlertController } from 'ionic-angular';

import stringify           from '../util/stringify';


@Injectable()
export class DataService {

  private static dbName = "GottaFlyFed2018.sqlite";
  private db   = new SQLite();
  private lock = null;

  constructor(private http: Http, public alertCtrl: AlertController) {
    this.lock = this.init();
  }

  async init() {
    if (!this.isNative()) return;

    try {
      await this.isReady();

      if (!this.isCopied()) {
        console.log('database not copied; copying');
        await this.onFirstRun();
      }

      await this.connect();

    } catch (e) {

      // If we still failed, something else went wrong
      console.warn('db init failed', e.message, e.stack);

      this.alert({
        title: 'Error',
        subTitle: 'Something went wrong, and we were unable to load the data. Please restart the app. If the problem persists, contact support.<br/><br/> Here is the error: <br><i>' + e.message + '</i>',
        buttons: ['OK']
      });
    }
  }

  markCopied() {
    return window['localStorage'].setItem('copied', DataService.dbName);
  }

  isCopied() {
    try {
      return window['localStorage'].getItem('copied') === DataService.dbName;
    } catch (e) {
      return false;
    }
  }

  async isReady() {
    let i = 0;
    while (i++ < 10) {
      if (typeof window['sqlitePlugin'] !== 'undefined') return true;
      await new Promise(res => setTimeout(res, 1000));
    }
  }

  connect() {
    return this.db.openDatabase({
      name: DataService.dbName,
      iosDatabaseLocation: 'Documents'
    });
  }

  alert(opts, tries=0) {
    try {
      this.alertCtrl.create(opts).present();
    } catch (e) {
      console.log('Failed to alert ' + (tries+1) + ' time(s). Trying again in 1 second.');
      if (tries < 3) {
        setTimeout(() => this.alert(opts, tries+1), 1000);
      }
    }
  }

  copyDb() {
    return new Promise((res, rej) => window['plugins'].sqlDB.copy(DataService.dbName, 0, res, rej))
  }

  async onFirstRun() {
    if (this.isNative()) {
      try {

        await this.copyDb();
        this.markCopied();

      } catch (e) {

        if (e.message.indexOf('already exists') > -1) {
          console.log('database was already copied; setting copied');
          return this.markCopied();
        }

        throw e;
      }
    }
  }

  isNative() {
    return !!window['cordova'];
  }

  async executeSql(sql: string, params: any[] = []) {

    try {
      if (this.isNative()) {

        await this.lock;

        const res = await this.db.executeSql(sql, params);

        const results = [];
        for (let i = 0, len = res.rows.length; i < len; i++) {
          results.push(res.rows.item(i));
        }

        return results;

      } else {

        const res = await this.http.post('http://localhost:3000', {sql, params}).toPromise();
        return await res.json();
      }
    } catch (e) {
      console.log('Error executing sql', e.message, e.stack);
      throw e;
    }

  }

}
