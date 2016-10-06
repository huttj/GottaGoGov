export default class Flight {
  id                         : number;
  awardYear                  : number;

  originCityId               : number;
  originCity                 : string;
  originState                : string;
  originCountry              : string;
  originAirportAbbrev        : string;
  originAirportLocation      : string;

  destinationCityId          : number;
  destinationCity            : string;
  destinationState           : string;
  destinationCountry         : string;
  destinationAirportAbbrev   : string;
  destinationAirportLocation : string;

  airlineAbbrev              : string;
  awardedServ                : string;
  paxCount                   : string;
  ycaFare                    : string;
  xcaFare                    : string;
  businessFare               : number;
  effectiveDate              : number;
  expirationDate             : number;
  saved                      : boolean;

  constructor(obj?) {
    if (!obj) obj = {};

    this.id                         = obj.id;
    this.awardYear                  = obj.awardYear;

    this.originCityId               = obj.originCityId;
    this.originCity                 = obj.originCity;
    this.originState                = obj.originState;
    this.originCountry              = obj.originCountry;
    this.originAirportAbbrev        = obj.originAirportAbbrev;
    this.originAirportLocation      = obj.originAirportLocation;

    this.destinationCityId          = obj.destinationCityId;
    this.destinationCity            = obj.destinationCity;
    this.destinationState           = obj.destinationState;
    this.destinationCountry         = obj.destinationCountry;
    this.destinationAirportAbbrev   = obj.destinationAirportAbbrev;
    this.destinationAirportLocation = obj.destinationAirportLocation;

    this.airlineAbbrev              = obj.airlineAbbrev;
    this.awardedServ                = obj.awardedServ;
    this.paxCount                   = obj.paxCount;
    this.ycaFare                    = obj.ycaFare;
    this.xcaFare                    = obj.xcaFare;
    this.businessFare               = obj.businessFare;
    this.effectiveDate              = obj.effectiveDate;
    this.expirationDate             = obj.expirationDate;
    this.saved                      = obj.saved;

    this.saved                      = !!obj.saved;
  }
}
