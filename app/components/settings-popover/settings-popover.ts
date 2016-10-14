import { PopoverController, ViewController } from 'ionic-angular';

import { Component } from '@angular/core';
import {SettingsService} from "../../services/settings";


@Component({
  templateUrl: 'build/components/settings-popover/popover-page.html',
  providers: [SettingsService]
})
class PopoverPage {

  private min = new Date().getFullYear() - 1;
  private max = new Date().getFullYear() + 1;
  private time: string;
  private range: number;

  constructor(
    public viewCtrl: ViewController,
    public settings: SettingsService
  ) {
    this.time  = new Date(this.settings.time).toISOString();
    this.range = this.settings.range;
  }

  reset() {
    this.time = new Date().toISOString();
    this.range = 50;
  }

  updateRange(range) {
    this.settings.range = range;
  }

  updateTime(time) {
    this.settings.time = +new Date(time);
  }

  close() {
    this.viewCtrl.dismiss();
  }
}

@Component({
  selector: 'settings-popover',
  templateUrl: 'build/components/settings-popover/settings-popover.html'
})
export class SettingsPopoverComponent {

  constructor(public popoverCtrl: PopoverController) {}

  presentPopover(ev) {
    const popover = this.popoverCtrl.create(PopoverPage);
    popover.present({ ev });
  }
}

