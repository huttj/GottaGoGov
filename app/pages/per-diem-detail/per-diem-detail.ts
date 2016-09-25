import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

import { PerDiemService } from '../../services/per-diem';

@Component({
  templateUrl: 'build/pages/per-diem-detail/per-diem-detail.html',
  providers: [PerDiemService]
})
export class PerDiemDetailPage {

  private city   = {};
  private nearby = [];

  constructor(
    public navParams: NavParams,
    public perDiemService: PerDiemService
  ) {}

  ionViewWillEnter() {
    return this.loadCity();
  }

  async loadCity() {
    const id  = this.navParams.get('id');
    const res = await this.perDiemService.getByIdWithNearby(id);

    [this.city, ...this.nearby] = res;
  }

  toggleSaved(city) {
    if (city.saved) {
      this.perDiemService.unsave(city.cityId);
    } else {
      this.perDiemService.save(city.cityId);
    }
  }

}
