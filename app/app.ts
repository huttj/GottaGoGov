import { Component } from '@angular/core';
import { Platform, ionicBootstrap } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { TabsPage } from './pages/tabs/tabs';
import { enableProdMode } from '@angular/core';

import { DataService } from './services/data';
import { SettingsService } from './services/settings';

if (window.hasOwnProperty('cordova')) {
  enableProdMode();
}

@Component({
  template: '<ion-nav [root]="rootPage" [class]="theme.name"></ion-nav>',
  providers: [DataService, SettingsService]
})
export class MyApp {

  private theme = {
    name: 'delta'
  };
  public rootPage: any;

  constructor(
    private settingsService: SettingsService,
    private platform: Platform
  ) {

    this.rootPage = TabsPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      setTimeout(()=>Splashscreen.hide(),500);
    });

    this.settingsService.onThemeChange((theme:string) => {
      this.theme = {
        name: theme
      };
    });

  }
}

ionicBootstrap(MyApp);
