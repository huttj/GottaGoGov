import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { PerDiemService } from '../../services/per-diem';
import { SettingsService } from '../../services/settings';
import { PerDiemDetailPage } from '../per-diem-detail/per-diem-detail';
import { SettingsPopoverComponent } from '../../components/settings-popover/settings-popover';

import PerDiem from '../../models/per-diem';

@Component({
  templateUrl: 'build/pages/per-diem/per-diem.html',
  providers: [PerDiemService, SettingsService],
  directives: [SettingsPopoverComponent]
})
export class PerDiemPage {
  private city = '';
  private cities : PerDiem[] = [];
  private timeoutId;
  private loading = true;
  private page = 0;
  private infiniteScroll;
  private hasMore;

  constructor(
    public perDiemService  : PerDiemService,
    public navCtrl         : NavController,
    public settingsService : SettingsService
  ) {
    this.settingsService.range$.subscribe(()=>this.search());
    this.settingsService.time$.subscribe(()=>this.search());
  }

  ionViewWillEnter() {
    return this.search();
  }

  update(event) {
    window['perDiem'] = this;

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
    this.cities = await this.perDiemService.search(this.city || q);
    this.loading = false;
    // if (this.infiniteScroll) this.infiniteScroll.enable(true);
    this.hasMore = true;
  }

  async doInfinite(infiniteScroll) {
    console.log('doInfinite called!');
    this.page++;
    const newCities = await this.perDiemService.search(this.city, this.page);

    this.cities = this.cities.concat(newCities);

    if (newCities.length < this.perDiemService.pageSize) {
      this.hasMore = false;
    }

    infiniteScroll.complete();
  }

  toggleSaved(event, city) {
    event.stopPropagation();
    if (city.saved) {
      this.perDiemService.unsave(city.cityId);
    } else {
      this.perDiemService.save(city.cityId);
    }
    city.saved = !city.saved;
  }

  selectCity(city) {
    console.log('Selecting city', city);
    this.navCtrl.push(PerDiemDetailPage, city);
  }

}
