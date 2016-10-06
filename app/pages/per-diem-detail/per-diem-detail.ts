import { Component }                from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';

import { PerDiemService } from '../../services/per-diem';
import { MapComponent }   from '../../components/map/map';

import { FlightsPage } from '../flights/flights';

import PerDiem from '../../models/per-diem';

@Component({
  templateUrl: 'build/pages/per-diem-detail/per-diem-detail.html',
  providers: [PerDiemService],
  directives: [MapComponent]
})
export class PerDiemDetailPage {

  private perDiem     : PerDiem   = new PerDiem();
  private nearby      : PerDiem[] = [];
  private sort        : string    = 'total';
  private betterDeals : number    = 0;

  constructor(
    public navParams      : NavParams,
    public perDiemService : PerDiemService,
    public navCtrl        : NavController

  ) {}

  ionViewWillEnter() {
    return this.loadCity();
  }

  loadCity() {
    const id  = this.navParams.get('id');

    this.perDiemService.getById(id)
      .then(perDiem => {

        this.perDiem = perDiem;

        this.perDiemService.getNearby(perDiem.latitude, perDiem.longitude)
          .then(res => {

            const thisTotal = this.perDiem.mie + this.perDiem.lodging;

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
          });

      });
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

  searchFlights(props) {
    this.navCtrl.push(FlightsPage, props);
  }

}
