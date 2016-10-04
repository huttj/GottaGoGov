import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { PerDiemService } from '../../services/per-diem';
import { PerDiemDetailPage } from '../per-diem-detail/per-diem-detail';

import PerDiem from '../../models/per-diem';


@Component({
  templateUrl: 'build/pages/per-diem/per-diem.html',
  providers: [PerDiemService]
})
export class PerDiemPage {
  private city = '';
  private cities : PerDiem[] = [];
  private timeoutId;

  constructor(
    public perDiemService : PerDiemService,
    public navCtrl        : NavController
  ) {}

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

  search(q='') {
    return this.perDiemService.search(this.city || q).then(res => this.cities = res);
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
    this.navCtrl.push(PerDiemDetailPage, { id: city.id });
  }

}
