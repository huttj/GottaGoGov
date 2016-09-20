import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { FlightDetailPage } from '../flight-detail/flight-detail';
import { FlightsService }   from '../../services/flights';

@Component({
  templateUrl: 'build/pages/flights/flights.html',
  providers: [FlightsService]
})
export class FlightsPage {

  private searchTimeout;
  private originSearch = '';
  private destinationSearch = '';

  private results = [];

  constructor(
    public navCtrl: NavController,
    public flightsService: FlightsService
  ) {}

  ionViewWillEnter() {
    return this.search();
  }

  search() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {

      this.flightsService.search(this.originSearch, this.destinationSearch)
        .then(rows => this.results = rows)
        .catch(err => console.log(err));

    }, 200);
  }

  updateOrigin(event) {
    this.originSearch = event.target.value;
    this.search();
  }

  updateDestination(event) {
    this.destinationSearch = event.target.value;
    this.search();
  }

  resetOrigin() {
    this.originSearch = '';
    this.search();
  }

  resetDestination() {
    this.destinationSearch = '';
    this.search();
  }

  toggleSaved(event, flight) {
    event.stopPropagation();
    if (flight.saved) {
      this.flightsService.unsave(flight.id);
    } else {
      this.flightsService.save(flight.id);
    }
    this.search();
  }

  selectFlight({ id }) {
    this.navCtrl.push(FlightDetailPage, { id });
  }

}
