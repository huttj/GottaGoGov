export default class PerDiem {
  id          : number;
  cityId      : number;
  seasonBegin : number;
  seasonEnd   : number;
  lodgingRate : number;
  mie         : number;
  distance    : number;
  city        : string;
  latitude    : number;
  longitude   : number;
  state       : string;
  abbr        : string;
  saved       : boolean;
  difference  : any;

  constructor(obj?) {
    if (!obj) obj = {};
    this.id          = obj.id;
    this.cityId      = obj.cityId;
    this.seasonBegin = obj.seasonBegin;
    this.seasonEnd   = obj.seasonEnd;
    this.lodgingRate = obj.lodgingRate;
    this.mie         = obj.mie;
    this.city        = obj.city;
    this.latitude    = obj.latitude;
    this.longitude   = obj.longitude;
    this.state       = obj.state;
    this.abbr        = obj.abbr;
    this.saved       = !!obj.saved;
  }
}
