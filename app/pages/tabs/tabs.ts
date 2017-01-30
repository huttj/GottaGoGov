import { Component }        from '@angular/core';
import { AlertController }  from 'ionic-angular';

import { HomePage }         from '../home/home';
import { SearchPage }       from '../search/search';
import { PerDiemPage }      from '../per-diem/per-diem';
import { FlightsPage }      from '../flights/flights';
// import { SettingsPage } from '../settings/settings';

import { AnalyticsService } from '../../services/analytics';

@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {

  public tab1Root: any;
  public tab2Root: any;
  public tab3Root: any;
  public tab4Root: any;

  constructor(
    private alertCtrl: AlertController,
    private analyticsService: AnalyticsService
  ) {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    this.tab1Root = SearchPage;
    this.tab2Root = FlightsPage;
    this.tab3Root = PerDiemPage;
    this.tab4Root = HomePage;
    // this.tab4Root = SettingsPage;

    setTimeout(() => this.askForEmail(), 1000);

  }

  askForEmail() {
    if (localStorage.getItem('gotEmail')) return;

    this.alertCtrl.create({
      title: 'Enter your email',
      message: 'We would like to invite you to try new features and submit your ideas for GottaGoGov!',
      inputs: [{ name: 'email', placeholder: 'Email', type: 'email' }],
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Never',
          role: 'cancel',
          handler: () => localStorage.setItem('gotEmail', 'true')
        },
        {
          text: 'Later',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: data => {
            if (!data || !data.email) return false;

            localStorage.setItem('gotEmail', 'true');
            console.log(data.email);
            this.analyticsService.trackEvent('email', data.email);
            this.analyticsService.setUserId(data.email);
          }
        }
      ]
    }).present();

  }
}
