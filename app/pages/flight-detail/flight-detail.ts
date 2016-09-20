import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

import { FlightsService } from '../../services/flights';

@Component({
  templateUrl: 'build/pages/flight-detail/flight-detail.html',
  providers: [FlightsService]
})
export class FlightDetailPage {

  private flight = {};

  constructor(
    public navParams: NavParams,
    public flightsService: FlightsService
  ) {}

  ionViewWillEnter() {
    return this.loadFlight();
  }

  loadFlight() {
    const id = this.navParams.get('id');
    return this.flightsService.getById(id).then(res => this.flight = JSON.stringify(res));
  }

  toggleSaved(event, flight) {
    event.stopPropagation();
    if (flight.saved) {
      this.flightsService.unsave(flight.id);
    } else {
      this.flightsService.save(flight.id);
    }
  }

}
