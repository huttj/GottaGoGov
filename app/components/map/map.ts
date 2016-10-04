import { Component, Input } from '@angular/core';

let idCounter = 0;

@Component({
  selector: 'map',
  template: '<div [attr.id]="id" class="the-map-container"></div>'
})
export class MapComponent {

  @Input() lat:number;
  @Input() long:number;

  private id : string;

  constructor() {
    this.id = 'map-' + idCounter;
    idCounter++;
  }

  initMap() {
    const coords = [this.lat, this.long];
    const mymap = window['L'].map(this.id).setView(coords, 12);
    window['L'].tileLayer('http://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(mymap);
    setTimeout(()=> mymap.invalidateSize());
  }

  ngOnChanges() {
    if (this.lat && this.long) {
      this.initMap();
    }
  }

}
