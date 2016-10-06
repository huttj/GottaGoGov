import { Component } from '@angular/core';
import { NavParams, NavController  } from 'ionic-angular';

import { MapComponent }   from '../../components/map/map';
import { FlightsService } from '../../services/flights';
import { PerDiemService } from '../../services/per-diem';
import { CityService }    from '../../services/city';

import { PerDiemDetailPage } from '../per-diem-detail/per-diem-detail';

import Flight  from '../../models/flight';
import PerDiem from '../../models/per-diem';


@Component({
  templateUrl: 'build/pages/flight-detail/flight-detail.html',
  providers: [FlightsService, PerDiemService, CityService],
  directives: [MapComponent]
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
    public cityService    : CityService
  ) {}

  ionViewWillEnter() {
    return this.loadFlight();
  }

  loadFlight() {
    const id = this.navParams.get('id');
    return this.flightsService.getById(id)
      .then(res => {
        console.log('flight', JSON.stringify(res, null, 2));
        this.flight = res;
        return this.perDiemService.getByCityId(res.destinationCityId)
      })
      .then(perDiem => {
        console.log('perDiem', JSON.stringify(perDiem, null, 2));

        if (perDiem || perDiem.city) {
          this.perDiem = perDiem;
          return this.perDiemService.getNearby(perDiem.latitude, perDiem.longitude);

        } else {
          this.perDiem = null;
          return this.cityService.getById(this.flight.destinationCityId)
            .then(city => {
              return this.perDiemService.getNearby(city.latitude, city.longitude);
            });
        }

      })
      .then(res => {
        console.log('nearbyPerDiems', JSON.stringify(res, null, 2));
        this.nearbyPerDiems = res;

        const thisTotal = this.perDiem.mie + this.perDiem.lodging;

        res.forEach((n:PerDiem) => {

          const thisPerDiem = this.perDiem || n;
          n.difference = this.difference(this.perDiem, thisPerDiem);

          const total = n.mie + n.lodging;
          if (total > thisTotal) {
            this.betterDeals++;
            n['betterDeal'] = true;
          }
        });

        if (this.perDiem) {
          this.nearbyPerDiems = res.slice(1);
        }


        this.sortBy();

      });
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

  sortBy() {
    switch(this.sort) {
      case 'total':
        return this.nearbyPerDiems.sort((a,b) => (b.mie + b.lodging) - (a.mie + a.lodging));
      case 'meals':
        return this.nearbyPerDiems.sort((a,b) => b.mie - a.mie);
      case 'lodging':
        return this.nearbyPerDiems.sort((a,b) => b.lodging - a.lodging);
    }
  }

  difference(n1, n2) {

    if (!n1 || !n2) return {
      mie: {},
      lodgingRate: {}
    };

    return {
      mie: diff(n1.mie, n2.mie),
      lodgingRate: diff(n1.lodgingRate, n2.lodgingRate)
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

  selectCity(city) {
    this.navCtrl.push(PerDiemDetailPage, { id: city.id });
  }

  toFixed(n) {
    return (n || 0).toFixed(2);
  }

}
