export default class Flight {
  id: number;
  awardYear: number;

  originCityId: number;
  originAirportAbbrev: string;
  originCityName: string;
  originState: string;
  originCountry: string;
  originAirportLocation: string;

  destinationCityId: number;
  destinationCityName: string;
  destinationState: string;
  destinationAirportAbbrev: string;
  destinationCountry: string;
  destinationAirportLocation: string;

  airlineAbbrev: string;
  awardedServ: string;
  paxCount: string;
  ycaFare: string;
  xcaFare: string;
  businessFare: number;
  effectiveDate: number;
  expirationDate: number;
  saved: boolean;

  constructor(obj) {
    if (!obj) obj = {};

    this.id                         = obj.id;
    this.awardYear                  = obj.awardYear;

    this.originCityId               = obj.originCityId;
    this.originAirportAbbrev        = obj.originAirportAbbrev;
    this.originCityName             = obj.originCityName;
    this.originState                = obj.originState;
    this.originCountry              = obj.originCountry;
    this.originAirportLocation      = obj.originAirportLocation;

    this.destinationCityId          = obj.destinationCityId;
    this.destinationCityName        = obj.destinationCityName;
    this.destinationState           = obj.destinationState;
    this.destinationAirportAbbrev   = obj.destinationAirportAbbrev;
    this.destinationCountry         = obj.destinationCountry;
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
