import { Component }                from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';

import { PerDiemService }  from '../../services/per-diem';
import { FlightsService }  from '../../services/flights';
import { SettingsService } from '../../services/settings';
import { MapComponent }    from '../../components/map/map';
import { SettingsPopoverComponent } from '../../components/settings-popover/settings-popover';


import { FlightsPage } from '../flights/flights';

import PerDiem from '../../models/per-diem';

@Component({
  templateUrl: 'build/pages/per-diem-detail/per-diem-detail.html',
  providers: [PerDiemService, FlightsService],
  directives: [MapComponent, SettingsPopoverComponent]
})
export class PerDiemDetailPage {

  private perDiem               : PerDiem   = new PerDiem();
  private nearby                : PerDiem[] = [];
  private sort                  : string    = 'total';
  private betterDeals           : number    = 0;
  private flightDestinationCity : Promise<any>;

  constructor(
    public navParams       : NavParams,
    public perDiemService  : PerDiemService,
    public flightsService  : FlightsService,
    public settingsService : SettingsService,
    public navCtrl         : NavController

  ) {
    window['PerDiemDetailPage'] = this;
    this.settingsService.range$.subscribe(()=>this.loadCity(this.perDiem.cityId));
    this.settingsService.time$.subscribe(()=>this.loadCity(this.perDiem.cityId));
  }

  ionViewWillEnter() {
    return this.loadCity();
  }

  async loadCity(cityId?) {
    const id  = this.navParams.get('id');

    if (cityId) {

      this.perDiem = await this.perDiemService.getByCityId(cityId);

      console.log('got perDiem by cityID', JSON.stringify(this.perDiem, null, 2));
      console.log('seasonBegin', new Date(this.perDiem.seasonBegin));
      console.log('seasonEnd', new Date(this.perDiem.seasonEnd));

      if (!this.perDiem) {
        this.perDiem = await this.perDiemService.getById(id);
      }

    } else {
      this.perDiem = await this.perDiemService.getById(id);
    }

    this.flightDestinationCity = this.flightsService.getNearestCityWithFlights(
      this.perDiem.latitude,
      this.perDiem.longitude
    );

    const res = await this.perDiemService.getNearby(this.perDiem.latitude, this.perDiem.longitude);

    const thisTotal = this.perDiem.mie + this.perDiem.lodging;

    this.betterDeals = 0;

    res.forEach((n:PerDiem) => {
      n.difference = this.difference(this.perDiem, n);
      const total = n.mie + n.lodging;
      if (total > thisTotal) {
        this.betterDeals++;
        n['betterDeal'] = true;
      }
    });

    this.nearby = res.slice(1);
    this.sortBy();

  }

  selectCity(city) {
    this.navCtrl.push(PerDiemDetailPage, { id: city.id });
  }

  toggleSaved(city) {
    if (city.saved) {
      this.perDiemService.unsave(city.cityId);
    } else {
      this.perDiemService.save(city.cityId);
    }
    city.saved = !city.saved;
  }

  difference(n1, n2) {

    if (!n1 || !n2) return {
      mie: {},
      lodging: {}
    };

    return {
      mie: diff(n1.mie, n2.mie),
      lodging: diff(n1.lodging, n2.lodging)
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
    return (n || 0).toFixed(2);
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

  async searchFlights(props) {
    const city = await this.flightDestinationCity;
    if (city) {
      props = {
        destination: city.name
      };
    }
    this.navCtrl.push(FlightsPage, props);
  }

}
