import { Component }     from '@angular/core';
import { NavController } from 'ionic-angular';

import { CityService }       from '../../services/city';
import { FlightsService }    from '../../services/flights';
import { PerDiemDetailPage } from '../per-diem-detail/per-diem-detail';
import { FlightDetailPage }  from '../flight-detail/flight-detail';

@Component({
  templateUrl: 'build/pages/home/home.html',
  providers: [CityService, FlightsService]
})
export class HomePage {
  private cities  = [];
  private flights = [];

  constructor(
    public navCtrl        : NavController,
    public perDiemService : CityService,
    public flightsService : FlightsService
  ) {}

  ionViewWillEnter() {
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
  }

  unsaveFlight(event, flight) {
    event.stopPropagation();
    this.flightsService.unsave(flight.id);
    this.flightsService.getSaved().then(rows => this.flights = rows);
  }

  selectCity({id}) {
    this.navCtrl.push(PerDiemDetailPage, {id});
  }

  selectFlight({id}) {
    this.navCtrl.push(FlightDetailPage, {id});
  }

}
