import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { CityService } from '../../services/city';
import { SettingsService } from '../../services/settings';
import { AnalyticsService } from '../../services/analytics';

import { PerDiemDetailPage } from '../per-diem-detail/per-diem-detail';
import { SettingsPopoverComponent } from '../../components/settings-popover/settings-popover';

import City from '../../models/city';

@Component({
  templateUrl: 'build/pages/per-diem/per-diem.html',
  providers: [CityService, SettingsService, AnalyticsService],
  directives: [SettingsPopoverComponent]
})
export class PerDiemPage {
  private city = '';
  private cities : City[] = [];
  private timeoutId;
  private loading = true;
  private page = 0;
  private infiniteScroll;
  private hasMore;

  constructor(
    public cityService      : CityService,
    public navCtrl          : NavController,
    public settingsService  : SettingsService,
    public analyticsService : AnalyticsService
  ) {
    this.settingsService.range$.subscribe(()=>this.search());
    this.settingsService.time$.subscribe(()=>this.search());
  }

  ionViewWillEnter() {
    this.analyticsService.trackView('PerDiem');
    return this.search();
  }

  update(event) {

    clearTimeout(this.timeoutId);

    this.city = event.target.value;

    this.timeoutId = setTimeout(() => this.search(), 300);
  }

  reset() {
    this.city = '';
    this.search('');
  }

  async search(q='') {
    this.loading = true;
    this.page = 0;
    this.cities = [];
    this.cities = await this.cityService.search(this.city || q);
    this.loading = false;
    // if (this.infiniteScroll) this.infiniteScroll.enable(true);
    this.hasMore = true;
  }

  async doInfinite(infiniteScroll) {
    console.log('doInfinite called!');
    this.page++;
    const newCities = await this.cityService.search(this.city, this.page);

    this.cities = this.cities.concat(newCities);

    if (newCities.length < this.cityService.pageSize) {
      this.hasMore = false;
    }

    infiniteScroll.complete();
  }

  toggleSaved(event, city) {
    event.stopPropagation();
    if (city.saved) {
      this.cityService.unsave(city.id);
      this.analyticsService.trackEvent('PerDiem', 'save', city.id);
    } else {
      this.cityService.save(city.id);
      this.analyticsService.trackEvent('PerDiem', 'unsave', city.id);
    }
    city.saved = !city.saved;
  }

  selectCity(city) {
    console.log('Selecting city', city);
    this.navCtrl.push(PerDiemDetailPage, city);
  }

}
