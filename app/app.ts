import { Component } from '@angular/core';
import { Platform, ionicBootstrap } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { TabsPage } from './pages/tabs/tabs';
import { enableProdMode } from '@angular/core';

import { DataService } from './services/data';
import { SettingsService } from './services/settings';
import { AnalyticsService } from './services/analytics';


if (window.hasOwnProperty('cordova')) {
  enableProdMode();
}

@Component({
  template: '<ion-nav [root]="rootPage" [class]="theme.name"></ion-nav>',
  providers: [DataService, SettingsService, AnalyticsService]
})
export class MyApp {

  private theme = {
    name: 'delta'
  };
  public rootPage: any;

  constructor(
    private settingsService: SettingsService,
    private analyticsService: AnalyticsService,
    private platform: Platform
  ) {

    // const logDiv = document.getElementById('log');
    // let shade = true;
    //
    // function log(color='#000') {
    //
    //   return function(...args) {
    //
    //     const line = document.createElement('pre');
    //
    //     line.textContent   = args.map(n => JSON.stringify(n, null, 2)).join(' ').replace(/\\n/g, '\n');
    //     line.style.padding = '6px';
    //
    //     if (shade) {
    //       line.style.backgroundColor = '#e0e0e0';
    //     }
    //
    //     line.style.fontSize = '10px';
    //     line.style.color    = color;
    //     shade               = !shade;
    //
    //     logDiv.appendChild(line);
    //   };
    // }
    //
    // window.console.log   = log('#444444');
    // window.console.warn  = log('#757400');
    // window.console.error = log('#750006');


    this.analyticsService.initialize();

    this.rootPage = TabsPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // StatusBar.styleDefault();
      StatusBar.styleLightContent(); // do not use default style
      setTimeout(() => Splashscreen.hide(), 500);
    });

    this.settingsService.onThemeChange((theme:string) => {
      this.theme = {
        name: theme
      };
    });

  }
}

ionicBootstrap(MyApp);
