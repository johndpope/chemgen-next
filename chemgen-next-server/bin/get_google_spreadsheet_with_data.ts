// BEFORE RUNNING:
// ---------------
// 1. If not already done, enable the Google Sheets API
//    and check the quota for your project at
//    https://console.developers.google.com/apis/api/sheets
// 2. Install the Node.js client library by running
//    `npm install googleapis --save`
// This comes straight from the google sheets API documentation
// I added the functions to parse

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {google} = require('googleapis');
//@ts-ignore
import {splitToBatches} from './parse_screen_upload_google_spreadsheet';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
// const TOKEN_PATH = path.join('token.json');
const TOKEN_PATH = 'token.json';

getOAuthClient()
  .then((results) => {
    console.log(results);
  })
  .catch((error) => {
    console.log(error);
  });
// getSpreadSheetIdFromUrl();

function getOAuthClient() {
// Load client secrets from a local file.
  return new Promise((resolve, reject) => {
    getCredentials()
      .then((credentialsStr: string) => {
        // authorize(JSON.parse(content), listMajors);
        return authorizePromise(JSON.parse(credentialsStr));
      })
      .then((oAuth2client) => {
        return getSpreadsheetData(oAuth2client);
      })
      .then((spreadsheetData: any) => {
        return splitToBatches(spreadsheetData);
      })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(new Error(error))
      });
  });
}

function getCredentials() {
  return new Promise((resolve, reject) => {
    fs.readFile('credentials.json', (err, content) => {
      if (err) {
        reject(new Error(`Error loading client secret file: ${err}`));
      } else {
        resolve(content);
      }
      // if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Sheets API.
      // authorize(JSON.parse(content), listMajors);
    });

  });
}

function authorizePromise(credentials) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  return new Promise((resolve, reject) => {
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      // This script assumes you've already gone through the api verification song and dance
      // if (err) return getNewToken(oAuth2Client, callback);
      if (err) {
        reject(new Error(`You must authorize the google sheets!`));
      } else {
        oAuth2Client.setCredentials(JSON.parse(token));
        resolve(oAuth2Client);
        // callback(oAuth2Client);
      }
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function getNewTokenPromise() {

}

/**
 * Prints the names and majors of
 * students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.get({
    spreadsheetId: '1yRoBQ9ybGH19t-ryw9tMiKiAiUSKV-hO3Co6FG3LeiY',
    ranges: [],
    includeGridData: true,
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    splitToBatches(res.data.sheets);
  });
}

function getSpreadsheetData(auth) {
  return new Promise((resolve, reject) => {
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.get({
      spreadsheetId: '1yRoBQ9ybGH19t-ryw9tMiKiAiUSKV-hO3Co6FG3LeiY',
      ranges: [],
      includeGridData: true,
    }, (err, res) => {
      if (err) {
        reject(new Error('The API returned an error: ' + err));
      } else {
        resolve(res.data.sheets);
      }
    });

  });
}


function getSpreadSheetIdFromUrl() {
  const url = 'https://docs.google.com/spreadsheets/d/1yRoBQ9ybGH19t-ryw9tMiKiAiUSKV-hO3Co6FG3LeiY/edit#gid=0';
  let split = url.split('/');
  console.log(split);
  return split[5];

}
