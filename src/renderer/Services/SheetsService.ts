import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { google } from 'googleapis';
import * as moment from 'moment';
import * as readline from 'readline';
import * as fs from 'fs';
//import * as _ from 'lodash';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

export class SheetsService {
  token: any;

  constructor() {
    this.authorize();
  }

  private authorize() {
    const client_id =
      '599802141490-2no4i4642c8ahla2rbbqcl4nkdg7l4f0.apps.googleusercontent.com';
    const client_secret = 'l-doi7lsJigvRZfFD29PojRY';
    const redirect_uris = ['urn:ietf:wg:oauth:2.0:oob', 'http://localhost'];
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    if (this.token) {
      oAuth2Client.setCredentials(this.token);
      this.getWorkHoursFromSheet(oAuth2Client);
    } else {
      this.getNewToken(oAuth2Client);
    }
  }

  private getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', code => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err)
          return console.error(
            'Error while trying to retrieve access token',
            err
          );
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        this.token = token;
        this.getWorkHoursFromSheet(oAuth2Client);
      });
    });
  }

  private getWorkHoursFromSheet(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: '1U9FtS7WKD-VUAJU-sYlMuuK5cuNwJmz4gGHISOWxJMo',
        range: 'Duplicate!A2',
      },
      (err, res) => {
        if (err) return console.log('Google Sheet API Error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
          console.log(rows);
        } else {
          console.log('No data returned');
        }
      }
    );
  }

  /*   getWorkHours() {
    const hours = new BehaviorSubject([]);
    this.getWorkHoursFromSheet().then((response: any) => {
      const periods: any = [];
      _.flattenDeep(response.rows).forEach((date: any, index: number) => {
        const parsedDate = moment(date, 'MMM DD, YYYY at HH:mmA');
        if (index % 2 === 0) {
          periods.push({ start: parsedDate });
        } else {
          periods[(index - 1) / 2].stop = parsedDate;
        }
      });
      const _weeks: any = [];
      let currentWeek: any = { days: {} };
      _.forEachRight(periods, (period: any) => {
        if (
          !currentWeek.weekOf ||
          currentWeek.weekOf.week() !== period.start.week()
        ) {
          if (currentWeek.weekOf) {
            _weeks.push(currentWeek);
          }
          currentWeek = { days: {} };
          currentWeek.weekOf = period.start.clone().startOf('week');
          currentWeek.days[period.start.day()] = [period];
        } else {
          if (currentWeek.days[period.start.day()]) {
            currentWeek.days[period.start.day()].push(period);
          } else {
            currentWeek.days[period.start.day()] = [period];
          }
        }
      });
      hours.next(_weeks);
    });
    return hours.pipe(filter((result: any[]) => result.length > 0));
  } */
}
