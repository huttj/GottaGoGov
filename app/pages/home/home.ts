import { Component }     from '@angular/core';
import { NavController } from 'ionic-angular';

import { CityService }       from '../../services/city';
import { FlightsService }    from '../../services/flights';
import { AnalyticsService }  from '../../services/analytics';

import { PerDiemDetailPage } from '../per-diem-detail/per-diem-detail';
import { FlightDetailPage }  from '../flight-detail/flight-detail';

@Component({
  templateUrl: 'build/pages/home/home.html',
  providers: [CityService, FlightsService, AnalyticsService]
})
export class HomePage {
  private cities  = [];
  private flights = [];

  constructor(
    public navCtrl          : NavController,
    public perDiemService   : CityService,
    public flightsService   : FlightsService,
    public analyticsService : AnalyticsService
  ) {
  }

  ionViewWillEnter() {
    this.analyticsService.trackView('Home');
    this.perDiemService.getSaved().then(rows => this.cities  = rows);
    this.flightsService.getSaved().then(rows => {
      this.flights = rows;
      console.log(rows);
    });
  }

  unsaveCity(event, city) {
    event.stopPropagation();
    this.perDiemService.unsave(city.id);
    this.perDiemService.getSaved().then(rows => this.cities = rows);
    this.analyticsService.trackEvent('PerDiem', 'unsave', city.name || city.city);
  }

  unsaveFlight(event, flight) {
    event.stopPropagation();
    this.flightsService.unsave(flight.id);
    this.flightsService.getSaved().then(rows => this.flights = rows);
    this.analyticsService.trackEvent('Flight', 'unsave', flight.id);
  }

  selectCity(city) {
    const { id } = city;
    this.navCtrl.push(PerDiemDetailPage, {id});
    this.analyticsService.trackEvent('PerDiem', 'select from home', city.name || city.city);
  }

  selectFlight({id}) {
    this.navCtrl.push(FlightDetailPage, {id});
    this.analyticsService.trackEvent('Flight', 'select from home', id);
  }

}
