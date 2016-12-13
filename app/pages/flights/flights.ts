import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { FlightDetailPage } from '../flight-detail/flight-detail';
import { FlightsService }   from '../../services/flights';

import Flight from '../../models/flight';


@Component({
  templateUrl: 'build/pages/flights/flights.html',
  providers: [FlightsService]
})
export class FlightsPage {

  private searchTimeout;
  private originSearch = '';
  private destinationSearch = '';

  private results : Flight[] = [];

  private loading = true;
  private page = 0;
  private hasMore = false;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public flightsService: FlightsService
  ) {
    this.originSearch      = navParams.get('origin') || '';
    this.destinationSearch = navParams.get('destination') || '';
  }

  ionViewWillEnter() {
    this.search();
  }

  search() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(async () => {

      this.page = 0;
      this.loading = true;

      this.results = await this.flightsService.search(this.originSearch, this.destinationSearch);

      this.hasMore = this.results.length >= this.flightsService.pageSize;

      this.loading = false;

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
    flight.saved = !flight.saved;
  }

  selectFlight({ id }) {
    this.navCtrl.push(FlightDetailPage, { id });
  }

  async doInfinite(infiniteScroll) {
    console.log('doInfinite called!');
    this.page++;
    const flights = await this.flightsService.search(this.originSearch, this.destinationSearch, this.page);

    this.results = this.results.concat(flights);

    if (flights.length < this.flightsService.pageSize) {
      this.hasMore = false;
    }

    infiniteScroll.complete();
  }

}
