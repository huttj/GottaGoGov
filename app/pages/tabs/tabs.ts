import { Component }    from '@angular/core';
import { HomePage }     from '../home/home';
import { PerDiemPage }  from '../per-diem/per-diem';
import { FlightsPage }  from '../flights/flights';
// import { SettingsPage } from '../settings/settings';

@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {

  public tab1Root: any;
  public tab2Root: any;
  public tab3Root: any;
  // public tab4Root: any;

  constructor() {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    this.tab1Root = FlightsPage;
    this.tab2Root = PerDiemPage;
    this.tab3Root = HomePage;
    // this.tab4Root = SettingsPage;
  }
}
