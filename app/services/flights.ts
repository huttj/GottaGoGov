import { Injectable }      from '@angular/core';
import { DataService }     from './data';
import { SettingsService } from './settings';
import calcDistance        from '../util/calcDistance';

import Flight from '../models/flight';


@Injectable()
export class FlightsService {

  public pageSize = 10;

  private props = `
     f.id AS id
    ,f.originCity
    ,f.originCityId
    ,f.originCountry
    ,f.originAirportAbbrev
    ,f.originState
    ,f.originStateAbbrev
    ,f.originAirportLocation
    
    ,f.destinationCity
    ,f.destinationCityId
    ,f.destinationCountry
    ,f.destinationAirportAbbrev
    ,f.destinationState
    ,f.destinationStateAbbrev
    ,f.destinationAirportLocation
    
    ,f.airlineAbbrev
    ,a.name AS airlineName
    ,f.rates
    ,f.saved
  `;

  private reverseProps = `
     -f.id AS id
    ,f.destinationCity            AS originCity
    ,f.destinationCityId          AS originCityId
    ,f.destinationCountry         AS originCountry
    ,f.destinationAirportAbbrev   AS originAirportAbbrev
    ,f.destinationState           AS originState
    ,f.destinationStateAbbrev     AS originStateAbbrev
    ,f.destinationAirportLocation AS originAirportLocation
    
    ,f.originCity                 AS destinationCity
    ,f.originCityId               AS destinationCityId
    ,f.originCountry              AS destinationCountry
    ,f.originAirportAbbrev        AS destinationAirportAbbrev
    ,f.originState                AS destinationState
    ,f.originStateAbbrev          AS destinationStateAbbrev
    ,f.originAirportLocation      AS destinationAirportLocation
    
    ,f.airlineAbbrev
    ,a.name AS airlineName
    ,f.rates
    ,f.saved
    
  `;

  constructor(
    public data: DataService,
    public settings: SettingsService
  ) {}

  makeFlight(data) {
    const time = this.settings.time;
    const flight = new Flight(data);

    const rate = flight.rates.find(n => n.effectiveDate <= time && n.expirationDate >= time);

    if (rate) {
      Object.assign(flight, rate);
    }

    return flight;
  }

  async search(
    originCity: string,
    destinationCity: string,
    page: number = 0
  ):Promise<Flight[]> {

    const sql = `
      SELECT ${this.props}
      FROM flights f
      LEFT JOIN airlines a
      ON f.airlineAbbrev = a.code
      WHERE (
        f.originAirportAbbrev = ?
        OR f.originCity LIKE ?
      )
      AND (
        f.destinationAirportAbbrev = ?
        OR f.destinationCity LIKE ?
      )      
      ORDER BY f.saved DESC, originCity ASC, destinationCity ASC
      LIMIT ?
      OFFSET ?
    `;

    const reverseSql = `
      SELECT ${this.reverseProps}
      FROM flights f
      LEFT JOIN airlines a
      ON f.airlineAbbrev = a.code
      WHERE (
        f.destinationAirportAbbrev = ?
        OR f.destinationCity LIKE ?
      )
      AND ( 
        f.originAirportAbbrev = ?
        OR f.originCity LIKE ?
      )
      ORDER BY f.saved DESC, originCity ASC, destinationCity ASC
      LIMIT ?
      OFFSET ?
    `;

    const params = [originCity.toUpperCase(), originCity+'%', destinationCity.toUpperCase(), destinationCity+'%', this.pageSize, this.pageSize * page];

    const res:any = await Promise.all([
      this.data.executeSql(sql, params),
      this.data.executeSql(reverseSql, params),
    ]);

    const [a,b] = res;

    const result = a.concat(b).map(n => this.makeFlight(n));

    console.log(result);

    return result;

  }

  getSaved() {
    return this.data.executeSql(
      ` SELECT ${this.props}
          FROM flights f
     LEFT JOIN airlines a
            ON f.airlineAbbrev = a.code
         WHERE f.saved = 1
      ORDER BY f.saved DESC, f.originCity ASC, f.destinationCity ASC`,
      []
    )
      .catch(toss);
  }

  getById(id):Promise<Flight> {

    let props, coords;

    if (id < 0) {
      id = -id;
      props = this.reverseProps;
    } else {
      props = this.props;
    }

    return this.data.executeSql(
      `SELECT
                 ${props}
            FROM flights f
       LEFT JOIN airlines a
              ON f.airlineAbbrev = a.code
           WHERE f.id = ?
     `, [Math.abs(id)])
      .then(rows => this.makeFlight(rows[0]))
      .catch(toss);
  }

  save(id) {
    return this.data.executeSql(
      `UPDATE flights
          SET saved = 1
        WHERE id = ?`,
      [id]
    )
      .catch(toss);
  }

  unsave(id) {
    return this.data.executeSql(
      `UPDATE flights
          SET saved = 0
        WHERE id = ?`,
      [id]
    )
      .catch(toss);
  }

  async getNearestCityWithFlights(lat:number, long:number, miles?:number) {
    return (await this.getNearestCitiesWithFlights(lat, long, miles))[0];
  }

  async getNearestCitiesWithFlights(lat:number, long:number, miles?:number) {

    if (!miles) miles = this.settings.range;

    const miPerDeg = 27.0271614;
    // const miPerDeg = 69.1710411;
    const degrees = miles / miPerDeg;

    const latLower  = lat - degrees;
    const latUpper  = lat + degrees;
    const longLower = long - degrees;
    const longUpper = long + degrees;

    const sql = `
      SELECT
         c.id
        ,c.name
        ,c.state
        ,c.country
        ,c.county
        ,c.abbr
        ,c.latitude
        ,c.longitude
        ,COUNT(1) AS flights
      FROM cities c
      INNER JOIN flights f
        ON f.destinationCityId = c.id
        OR f.originCityId = c.id
      WHERE (
            c.latitude  > ?
        AND c.latitude  < ?
        AND c.longitude > ?
        AND c.longitude < ?
      )
      
      GROUP BY
         c.id
        ,c.name
        ,c.state
        ,c.latitude
        ,c.longitude
    `;

    const params = [latLower, latUpper, longLower, longUpper];

    try {
      const rows = await this.data.executeSql(sql, params);

      rows.forEach(n => n.distance = calcDistance(lat, long, n.latitude, n.longitude));

      return rows.sort((a, b) => a.distance - b.distance).filter(n => n.distance <= miles);

    } catch (e) {

      console.log('error in getNearestCityWithFlights', e.message || e);
      throw e;
    }

  }

}

function toss(err) {
  console.log('tossed error', err.message, err.stack, err);
  throw err;
}
