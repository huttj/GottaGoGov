import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class SettingsService {

  public theme:string = 'delta';
  private themeCallbacks = [];

  onThemeChange(fn) {
    this.themeCallbacks.push(fn);
  }

  selectTheme(name:string) {
    this.theme = name;
    console.log('Selected theme: ' + name);
    this.themeCallbacks.forEach(fn => fn(this.theme));
  }

}
