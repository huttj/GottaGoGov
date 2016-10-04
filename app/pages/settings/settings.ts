import { Component }     from '@angular/core';
import { NavController } from 'ionic-angular';

import { SettingsService } from '../../services/settings';

@Component({
  templateUrl: 'build/pages/settings/settings.html',
  providers: [SettingsService]
})
export class SettingsPage {

  private themes = [{
    name: 'Delta',
    value: 'delta'
  }, {
    name: 'Southwest',
    value: 'southwest'
  }];

  private selectedTheme = this.themes[0];

  constructor(private settingsService: SettingsService) {}

  update(theme) {
    console.log('update theme', theme);
    this.settingsService.selectTheme(theme);
  }

}
