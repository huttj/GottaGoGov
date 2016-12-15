import { Component }                from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';

import { CityService }  from '../../services/city';
import { FlightsService }  from '../../services/flights';
import { SettingsService } from '../../services/settings';
import { MapComponent }    from '../../components/map/map';
import { SettingsPopoverComponent } from '../../components/settings-popover/settings-popover';


import { FlightsPage } from '../flights/flights';

import City from '../../models/city';

@Component({
  templateUrl: 'build/pages/per-diem-detail/per-diem-detail.html',
  providers: [CityService, FlightsService],
  directives: [MapComponent, SettingsPopoverComponent]
})
export class PerDiemDetailPage {

  private city                  : City   = new City();
  private nearby                : City[] = [];
  private sort                  : string    = 'total';
  private betterDeals           : number    = 0;
  private flightDestinationCity : Promise<any>;
  private flights               : any[] = [];

  constructor(
    public navParams       : NavParams,
    public cityService     : CityService,
    public flightsService  : FlightsService,
    public settingsService : SettingsService,
    public navCtrl         : NavController

  ) {
    window['CityDetailPage'] = this;
    this.settingsService.range$.subscribe(()=>this.loadCity(this.city.id));
    this.settingsService.time$.subscribe(()=>this.loadCity(this.city.id));
  }

  ionViewWillEnter() {
    return this.loadCity().catch(e => console.error(e));
  }

  async loadCity(_id?) {
    const id = _id || this.navParams.get('id');

    try {
      this.city = await this.cityService.getById(id);
    } catch (e) {
      console.error(e);
    }

    // this.flightDestinationCity = this.flightsService.getNearestCityWithFlights(
    //   this.city.latitude,
    //   this.city.longitude
    // );
    console.log('Got city', this.city);

    this.flights = await this.flightsService.getNearestCitiesWithFlights(
      this.city.latitude,
      this.city.longitude
    );

    console.log('nearestFights', this.flights);

    try {
      const res = await this.cityService.getNearby(this.city.latitude, this.city.longitude);

      const thisTotal = this.city.mie + this.city.lodging;

      this.betterDeals = 0;

      res.forEach((n:City) => {
        n.difference = this.difference(this.city, n);
        const total = n.mie + n.lodging;
        if (total > thisTotal) {
          this.betterDeals++;
          n['betterDeal'] = true;
        }
      });

      console.log('nearbys', res);

      this.nearby = res.slice(1);
      this.sortBy();

    } catch (e) {
      console.error(e);
    }

  }

  selectCity(city) {
    this.navCtrl.push(PerDiemDetailPage, { id: city.id });
  }

  toggleSaved(city) {
    if (city.saved) {
      this.cityService.unsave(city.id);
    } else {
      this.cityService.save(city.id);
    }
    city.saved = !city.saved;
  }

  difference(n1, n2) {

    if (!n1 || !n2) return {
      mie: {},
      lodging: {},
      total: {}
    };

    return {
      mie: diff(n1.mie, n2.mie),
      lodging: diff(n1.lodging, n2.lodging),
      total: diff(n1.lodging+n1.mie, n2.lodging+n2.mie)
    };

    function diff(n1, n2) {
      const diff = n2 - n1;
      const sign = diff < 0 ? '' : '+';
      const color = diff < 0 ? 'red' : 'green';
      return {
        value: diff ? sign + diff : '',
        color
      }
    }
  }

  toFixed(n) {
    return (n || 0).toFixed(0);
  }

  sortBy() {
    switch(this.sort) {
      case 'total':
        return this.nearby.sort((a,b) => (b.mie + b.lodging) - (a.mie + a.lodging));
      case 'meals':
        return this.nearby.sort((a,b) => b.mie - a.mie);
      case 'lodging':
        return this.nearby.sort((a,b) => b.lodging - a.lodging);
      case 'distance':
        return this.nearby.sort((a,b) => a.distance - b.distance);
    }
  }

  betterDealMessage() {
    if (!this.betterDeals) return 'This is the best deal in the area.';

    var numbers = {
      '1': 'a',
      '2': 'two',
      '3': 'three',
      '4': 'four',
      '5': 'five',
      '6': 'six',
      '7': 'seven',
      '8': 'eight',
      '9': 'nine',
      '10': 'ten'
    };

    const verb = this.betterDeals > 1 ? 'are' : 'is';
    const count = numbers[this.betterDeals];
    const plural = this.betterDeals > 1 ? 's' : '';

    return `There ${verb} ${count} better deal${plural} nearby.`;
  }

  // async searchFlights(props) {
  //   const city = await this.flightDestinationCity;
  //   console.log(city);
  //   if (city) {
  //     props = {
  //       destination: city.name
  //     };
  //   }
  //   this.navCtrl.push(FlightsPage, props);
  // }

  async searchFlights(city) {
    this.navCtrl.push(FlightsPage, { destination: city.name });
  }

}
