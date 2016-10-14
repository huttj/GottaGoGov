import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

const time$  = new Subject();
const range$ = new Subject();

let _time;
let _range;

time$.subscribe(x => _time = x);
range$.subscribe(x => _range = x);

time$.next(Date.now());
range$.next(50);


@Injectable()
export class SettingsService {

  private changeTimeoutId: number;

  public time$  = time$;
  public range$ = range$;

  constructor() {}

  public get time() {
    return _time;
  }

  public set time(val: number) {
    _time = val;
    time$.next(val);
  }

  public get range() {
    return _range;
  }

  public set range(val: number) {
    _range = val;
    range$.next(val);
  }

  public theme:string = 'delta';
  private themeCallbacks = [];

  onThemeChange(fn) {
    this.themeCallbacks.push(fn);
  }

  selectTheme(name:string) {
    this.theme = name;
    this.themeCallbacks.forEach(fn => fn(this.theme));
  }

}
