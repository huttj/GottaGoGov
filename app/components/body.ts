import { Component, HostBinding } from '@angular/core';

import { SettingsService } from '../services/settings';

@Component({
  selector: 'body',
  providers: [SettingsService]
})
export class BodyElement {
  @HostBinding('class') theme:string = 'delta';

  constructor(
    private settingsService: SettingsService
  ) {
    this.settingsService.theme.subscribe((theme:string) => this.theme = theme);
  }
}
