export default class Flight {
  id                         : number;
  awardYear                  : number;

  originCityId               : number;
  originCity                 : string;
  originState                : string;
  originStateAbbrev          : string;
  originCountry              : string;
  originAirportAbbrev        : string;
  originAirportLocation      : string;

  destinationCityId          : number;
  destinationCity            : string;
  destinationState           : string;
  destinationStateAbbrev     : string;
  destinationCountry         : string;
  destinationAirportAbbrev   : string;
  destinationAirportLocation : string;

  airlineAbbrev              : string;
  airlineName                : string;
  awardedServ                : string;
  paxCount                   : string;
  ycaFare                    : string;
  xcaFare                    : string;
  businessFare               : number;
  effectiveDate              : any;
  expirationDate             : any;

  rates                      : any;

  saved                      : boolean;

  constructor(obj?) {
    if (!obj) obj = {};

    this.id                         = obj.id;
    this.awardYear                  = obj.awardYear;

    this.originCityId               = obj.originCityId;
    this.originCity                 = obj.originCity;
    this.originState                = obj.originState;
    this.originStateAbbrev          = obj.originStateAbbrev;
    this.originCountry              = obj.originCountry;
    this.originAirportAbbrev        = obj.originAirportAbbrev;
    this.originAirportLocation      = obj.originAirportLocation;

    this.destinationCityId          = obj.destinationCityId;
    this.destinationCity            = obj.destinationCity;
    this.destinationState           = obj.destinationState;
    this.destinationStateAbbrev     = obj.destinationStateAbbrev;
    this.destinationCountry         = obj.destinationCountry;
    this.destinationAirportAbbrev   = obj.destinationAirportAbbrev;
    this.destinationAirportLocation = obj.destinationAirportLocation;

    this.airlineAbbrev              = obj.airlineAbbrev;
    this.airlineName                = obj.airlineName;
    this.awardedServ                = obj.awardedServ;

    this.rates                      = JSON.parse(obj.rates || '[]');

    this.saved                      = !!obj.saved;
  }
}
