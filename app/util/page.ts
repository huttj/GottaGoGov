import { Events } from 'ionic-angular';
import { AnalyticsService } from '../services/analytics';

export class BasePage {

  constructor(
    public eventsCtrl: Events,
    private analyticsService: AnalyticsService
  ) {}

  ionViewDidEnter() {
    // this.eventsCtrl.publish('page:load');
    // this.analyticsService.trackView('')
  }

  // ionViewDidUnload() {
  //   this.eventsCtrl.publish('page:unload');
  // }
}
