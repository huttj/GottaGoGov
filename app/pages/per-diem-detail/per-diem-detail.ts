import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

import { PerDiemService } from '../../services/per-diem';

@Component({
  templateUrl: 'build/pages/per-diem-detail/per-diem-detail.html',
  providers: [PerDiemService]
})
export class PerDiemDetailPage {

  private city = {};

  constructor(
    public navParams: NavParams,
    public perDiemService: PerDiemService
  ) {}

  ionViewWillEnter() {
    return this.loadCity();
  }

  loadCity() {
    const id = this.navParams.get('id');
    return this.perDiemService.getById(id).then(res => this.city = JSON.stringify(res));
  }

  toggleSaved(flight) {
    if (flight.saved) {
      this.perDiemService.unsave(flight.id);
    } else {
      this.perDiemService.save(flight.id);
    }
  }

}
