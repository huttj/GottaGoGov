import { Component } from '@angular/core';
import { NavParams, NavController  } from 'ionic-angular';

import { MapComponent }    from '../../components/map/map';
import { FlightsService }  from '../../services/flights';
import { PerDiemService }  from '../../services/per-diem';
import { SettingsService } from '../../services/settings';
import { CityService }     from '../../services/city';

import { PerDiemDetailPage } from '../per-diem-detail/per-diem-detail';
import { SettingsPopoverComponent } from '../../components/settings-popover/settings-popover';

import Flight  from '../../models/flight';
import PerDiem from '../../models/per-diem';


@Component({
  templateUrl: 'build/pages/flight-detail/flight-detail.html',
  providers: [FlightsService, PerDiemService, CityService, SettingsService],
  directives: [MapComponent, SettingsPopoverComponent]
})
export class FlightDetailPage {

  private flight         : Flight    = new Flight();
  private perDiem        : PerDiem   = new PerDiem();
  private nearbyPerDiems : PerDiem[] = [];
  private sort           : string    = 'total';
  private betterDeals    : number    = 0;

  constructor(
    public navCtrl        : NavController,
    public navParams      : NavParams,
    public flightsService : FlightsService,
    public perDiemService : PerDiemService,
    public settings       : SettingsService,
    public cityService    : CityService
  ) {
  }

  ionViewWillEnter() {
    return this.loadFlight();
  }

  async loadFlight() {
    const id = this.navParams.get('id');
    this.flight = await this.flightsService.getById(id);

    console.log('flight', JSON.stringify(this.flight, null, 2));

    this.perDiem = await this.perDiemService.getByCityId(this.flight.destinationCityId);


    let nearbyPerDiems;

    if (this.perDiem && this.perDiem.city) {
      console.log('perDiem', JSON.stringify(this.perDiem, null, 2));
      nearbyPerDiems = await this.perDiemService.getNearby(this.perDiem.latitude, this.perDiem.longitude);

    } else {
      this.perDiem = null;

      const city = await this.cityService.getById(this.flight.destinationCityId);

      console.log('city', JSON.stringify(city, null, 2));

      nearbyPerDiems = await this.perDiemService.getNearby(city.latitude, city.longitude);

    }

    const thisTotal = this.perDiem ? this.perDiem.mie + this.perDiem.lodging : null;

    this.betterDeals = 0;

    nearbyPerDiems.forEach((n:PerDiem) => {

      const thisPerDiem = this.perDiem || n;
      n.difference = this.difference(thisPerDiem, n);

      const total = n.mie + n.lodging;

      if (thisTotal !== null && total > thisTotal) {
        this.betterDeals++;
        n['betterDeal'] = true;
      }

    });

    console.log('nearbyPerDiems', JSON.stringify(nearbyPerDiems, null, 2));

    if (this.perDiem) {
      this.nearbyPerDiems = nearbyPerDiems.slice(1);
    } else {
      this.nearbyPerDiems = nearbyPerDiems;
    }

    this.sortBy();

  }

  toggleSavedFlight(event, flight) {
    event.stopPropagation();
    if (flight.saved) {
      this.flightsService.unsave(flight.id);
    } else {
      this.flightsService.save(flight.id);
    }
  }

  toggleSavedPerDiem(event, perDiem) {
    event.stopPropagation();
    if (perDiem.saved) {
      this.perDiemService.unsave(perDiem.cityId);
    } else {
      this.perDiemService.save(perDiem.cityId);
    }
    perDiem.saved = !perDiem.saved;
  }

  sortBy(value?) {
    if (value) this.sort = value;
    switch(this.sort) {
      case 'total':
        return this.nearbyPerDiems.sort((a,b) => (b.mie + b.lodging) - (a.mie + a.lodging));
      case 'meals':
        return this.nearbyPerDiems.sort((a,b) => b.mie - a.mie);
      case 'lodging':
        return this.nearbyPerDiems.sort((a,b) => b.lodging - a.lodging);
      case 'distance':
        return this.nearbyPerDiems.sort((a,b) => a.distance - b.distance);
    }
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

  selectCity(city) {
    this.navCtrl.push(PerDiemDetailPage, { id: city.id });
  }

  toFixed(n) {
    return (n || 0).toFixed(2);
  }

}
