export default class City {
  id          : number;
  seasonBegin : number;
  seasonEnd   : number;
  lodging     : number;
  mie         : number;
  distance    : number;
  name        : string;
  city        : string;
  latitude    : number;
  longitude   : number;
  state       : string;
  county      : string;
  country     : string;
  abbr        : string;
  saved       : boolean;
  difference  : any;

  constructor(obj?) {
    if (!obj) obj = {};

    const [rate] = obj.rate || [{}];

    this.id          = obj.id;


    this.seasonBegin = rate.seasonBegin;
    this.seasonEnd   = rate.seasonEnd;
    this.lodging     = rate.lodging;
    this.mie         = rate.mie;

    this.city        = obj.name;
    this.name        = obj.name;
    this.latitude    = obj.latitude;
    this.longitude   = obj.longitude;
    this.state       = obj.state;
    this.county      = obj.county;
    this.country     = obj.country;
    this.abbr        = obj.abbr;
    this.saved       = !!obj.saved;
  }
}
