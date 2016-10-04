export default class City {
  id        : number;
  name      : string;
  latitude  : number;
  longitude : number;
  state     : string;
  abbr      : string;
  saved     : boolean;

  constructor(obj) {
    this.id        = obj.id;
    this.name      = obj.name;
    this.latitude  = obj.latitude;
    this.longitude = obj.longitude;
    this.state     = obj.state;
    this.abbr      = obj.abbr;
    this.saved     = !!obj.saved;
  }
}
