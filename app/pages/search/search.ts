import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { CityService }      from '../../services/city';
import { FlightsService }   from '../../services/flights';
import { SettingsService }  from '../../services/settings';
import { AnalyticsService } from '../../services/analytics';

import City from '../../models/city';

import { FlightsPage }              from '../../pages/flights/flights';
import { PerDiemDetailPage }        from '../../pages/per-diem-detail/per-diem-detail';
import { SettingsPopoverComponent } from '../../components/settings-popover/settings-popover';

@Component({
  templateUrl: 'build/pages/search/search.html',
  providers: [CityService, FlightsService, SettingsService, AnalyticsService],
  directives: [SettingsPopoverComponent]
})
export class SearchPage {

  private searching = false;
  private searchTimeout;
  private citySearch = '';
  private results : City[] = [];

  private page = 0;
  private hasMore = true;

  constructor(
    public navParams        : NavParams,
    public navCtrl          : NavController,
    public cityService      : CityService,
    public flightsService   : FlightsService,
    public settingsService  : SettingsService,
    public analyticsService : AnalyticsService
  ) {
    this.settingsService.range$.subscribe(()=>this.updateSearch());
    this.settingsService.time$.subscribe(()=>this.updateSearch());
  }

  ionViewWillEnter() {
    this.analyticsService.trackView('Search');
    if (!this.citySearch) {
      this.search();
    }
  }

  search() {
    return new Promise(resolve => {
      clearTimeout(this.searchTimeout);

      this.searchTimeout = setTimeout(async() => {

        this.searching = true;

        try {
          let rows = await this.cityService.search(this.citySearch, this.page);

          if (this.page === 0 && !rows.length) {
            rows = await this.cityService.lookup(this.citySearch);
          }

          this.results = this.results.concat(rows);

          rows.forEach(async(city) => {
            city['flight'] = null;
            city['flight'] = await this.flightsService.getNearestCityWithFlights(city.latitude, city.longitude);
          });

        } catch (e) {
          console.error(e);
        }

        this.searching = false;

        resolve();

      }, 500);

    });
  }

  async updateSearch(event?) {
    if (event) this.citySearch = event.target.value;
    this.page = 0;
    this.results = [];
    await this.search();
    this.setHasMore(this.results.length);
  }

  async resetSearch() {
    this.page = 0;
    this.citySearch = '';
    this.results = [];
    await this.search();
    this.setHasMore(this.results.length);
  }

  flightMessage(city) {
    if (!city.flight) {
      return `No flights within ${this.settingsService.range} mile${ending(this.settingsService.range)}`;

    } else if (city.flight.id === city.id) {
      const n = city.flight.flights;
      return `${n} direct flight${ending(n)}`;

    } else {
      const { flights: n, name, abbr, country } = city.flight;
      return `${n} flight${ending(n)} to ${name}, ${abbr || country}`;
    }

    function be(n) {
      return n === 1 ? 'is' : 'are';
    }

    function ending(n) {
      return n === 1 ? '' : 's';
    }
  }

  selectCity(city, e) {
    if (e) e.preventDefault();
    console.log('Selecting city for', city, city.id);
    this.navCtrl.push(PerDiemDetailPage, { id: city.id });
  }

  selectFlights(city, e) {
    if (e) e.preventDefault();
    this.navCtrl.push(FlightsPage, { destination: city.name });
  }

  // selectCity({ id }) {
  //   this.navCtrl.push(CityDetailPage, { id });
  // }

  async doInfinite(infiniteScroll) {
    console.log('doInfinite called!');
    this.page++;
    const oldLength = this.results.length;

    await this.search();

    const difference = this.results.length - oldLength;

    console.log('difference', difference);
    this.setHasMore(difference);

    infiniteScroll.complete();
  }

  setHasMore(n) {
    this.hasMore = n >= this.cityService.pageSize;
  }

}
