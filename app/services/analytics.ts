import { Injectable } from '@angular/core';
import { Platform} from 'ionic-angular';

@Injectable()
export class AnalyticsService {

  private ga : any;

  constructor(private platform: Platform) {
    this.platform.ready().then(()=> this.ga = window['ga']);
  }

  async initialize() {
    await this.platform.ready();
    try {
      this.ga.startTrackerWithId('UA-89808831-1');
      this.ga.setAllowIDFACollection(true);
      this.ga.enableUncaughtExceptionReporting(true);
    } catch (e) {
      console.log('Something went wrong with GA', e.message);
    }
  }

  setUserId(id) {
    try {
      this.ga.setUserId(id);
    } catch (e) {
      console.log('Failed to set userId');
    }
  }

  async trackEvent(category, action, label?, value?, newSession?) {
    try {
      await this.platform.ready();
      console.log('Tracking event', category, action, label);
      this.ga.trackEvent(category, action, label, value, newSession);
    } catch (e) {
      console.log('Failed to track event', e.stack || e.message);
    }
  }

  async trackView(title, campaignUrl?, newSession?) {
    try {
      await this.platform.ready();
      console.log('Tracking view', title);
      this.ga.trackView(title, campaignUrl, newSession);
    } catch (e) {
      console.log('Failed to track view', e.stack || e.message);
    }
  }



}
