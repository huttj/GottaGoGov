import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { PerDiemService } from '../../services/per-diem';
import { PerDiemDetailPage } from '../per-diem-detail/per-diem-detail';

@Component({
  templateUrl: 'build/pages/per-diem/per-diem.html',
  providers: [PerDiemService]
})
export class PerDiemPage {
  private city = '';
  private cities = [];
  private timeoutId;

  constructor(
    public perDiemService : PerDiemService,
    public navCtrl        : NavController
  ) {}

  ionViewWillEnter() {
    return this.search();
  }

  update(event) {
    clearTimeout(this.timeoutId);

    this.city = event.target.value;


    this.timeoutId = setTimeout(() => this.search(), 300);
  }

  reset() {
    this.city = '';
    this.search();
  }

  search() {
    return this.perDiemService.search(this.city).then(res => this.cities = res);
  }

  toggleSaved(event, city) {
    event.stopPropagation();
    if (city.Saved) {
      this.perDiemService.unsave(city.id);
    } else {
      this.perDiemService.save(city.id);
    }
    city.Saved = !city.Saved;
  }

  selectCity(city) {
    console.log('Selected', JSON.stringify(city, null, 2));
    this.navCtrl.push(PerDiemDetailPage, { id: city.id });
  }

}
