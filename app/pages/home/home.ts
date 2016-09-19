import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { PerDiemService } from '../../services/per-diem';
import { FlightsService }  from '../../services/flights';

@Component({
  templateUrl: 'build/pages/home/home.html',
  providers: [PerDiemService, FlightsService]
})
export class HomePage {
  private cities  = [];
  private flights = [];

  constructor(
    public navCtrl        : NavController,
    public perDiemService : PerDiemService,
    public flightsService : FlightsService
  ) {}

  ionViewWillEnter() {
    return Promise.all([
      this.perDiemService.getSaved().then(rows => this.cities  = rows),
      this.flightsService.getSaved().then(rows => this.flights = rows)
    ]);
  }

  unsaveCity(city) {
    this.perDiemService.unsave(city.ID);
    this.perDiemService.getSaved().then(rows => this.cities = rows);
  }

  unsaveFlight(flight) {
    this.flightsService.unsave(flight.id);
    this.flightsService.getSaved().then(rows => this.flights = rows);
  }

}
