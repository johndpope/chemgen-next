const app = require('../../../../../server/server');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {google} = require('googleapis');
const Promise = require('bluebird');
import {
  RnaiScreenUploadWorkflowResultSet,
  ExpScreenUploadWorkflowResultSet,
  RnaiLibraryResultSet
} from "../../../../types/sdk/models";
import {
  remove,
  isArray,
  isString,
  includes,
  set,
  chunk,
  get,
  cloneDeep,
  isEmpty,
  merge,
  isEqual,
  uniq,
  find,
  trim,
  orderBy,
  isUndefined,
  isNull,
  flattenDeep,
} from 'lodash';
import * as moment from 'moment'

/*********************************************************************************
 * This API takes the google sheets URL, and tries to parse the batch data out of it
 * What is returned is an object containing the parsed batch data, any associated errors with their line numbers
 * and  hopefully the expWorkflows, and an array of any foundWorkflows that were processed previously
 *
 * TODO - the sheet should get updated with successful calls
 *
 *********************************************************************************/

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';
// Here are two examples of some spreadsheet Ids that parse, one with and one without errors
// const spreadsheetId = '1yRoBQ9ybGH19t-ryw9tMiKiAiUSKV-hO3Co6FG3LeiY';
// const spreadsheetId = '1ZctLTu9Bc8RrT-Q2mdPd30urFqhMoNRi1gLP2BxjhXw';

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;

ExpScreenUploadWorkflow.load.workflows.uploadFromGoogleSpreadSheet = function (spreadsheetId) {
  app.winston.info('should be processing google spreadsheet');
  return new Promise((resolve, reject) => {
    getOAuthClient()
      .then((oAuth2client) => {
        //TODO get spreadsheetId from URL
        return getSpreadsheetData(oAuth2client, spreadsheetId);
      })
      .then((spreadsheetData) => {
        return ExpScreenUploadWorkflow.load.workflows.splitToBatches(spreadsheetData);
      })
      .then((batchObj) => {
        resolve(batchObj);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

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


function getOAuthClient() {
// Load client secrets from a local file.
  return new Promise((resolve, reject) => {
    getCredentials()
      .then((credentialsStr: string) => {
        return authorizePromise(JSON.parse(credentialsStr));
      })
      .then((oAuth2client) => {
        resolve(oAuth2client);
      })
      // .then((spreadsheetData) => {
      // return getSpreadsheetData(oAuth2client, spreadsheetId);
      //   return spreadsheetData;
      // })
      .catch((error) => {
        reject(new Error(error))
      });
  });
}

function getCredentials() {
  return new Promise((resolve, reject) => {
    fs.readFile(CREDENTIALS_PATH, (err, content) => {
      if (err) {
        reject(new Error(`Error loading client secret file: ${err}`));
      } else {
        resolve(content);
      }
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
      }
    });
  });
}

function getSpreadsheetData(auth, spreadsheetId) {
  return new Promise((resolve, reject) => {
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
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

/**
 * Get the spreadsheet ID from the URL
 * Example URL
 * ID is the big long string after spreadsheets/d/
 * const url = 'https://docs.google.com/spreadsheets/d/1yRoBQ9ybGH19t-ryw9tMiKiAiUSKV-hO3Co6FG3LeiY/edit#gid=0';
 * @param url
 */
function getSpreadSheetIdFromUrl(url: string) {
  let split = url.split('/');
  return split[5];
}

function getScreenExperimentDataSheet(sheets: Array<{ properties, data }>) {
  return get(sheets, [1, 'data', 0, 'rowData']);
}

function getScreenExperimentDataHeaders(rowDataValues: Array<{ values }>) {
  let headers = get(rowDataValues, [1, 'values']).map((column: any) => {
    return column.formattedValue;
  });
  headers.push('rowIndex');
  return headers;
}

function getScreenExperimentDataRows(rowDataValues: Array<any>) {
  return getDataRows(rowDataValues);
}

/**
 * The first row is the same as the sheet name
 * The second are the headers
 * From there on down are the headers
 * @param rowDataValues
 */
function getDataRows(rowDataValues) {
  if (isArray(rowDataValues)) {
    return rowDataValues.slice(2, rowDataValues.length - 1).map((rowData, rowIndex) => {
      let values = rowData.values;
      let isThereData = false;
      if (isArray(values)) {
        let formattedValues = values.map((cell: any) => {
          if (cell.formattedValue) {
            isThereData = true;
          }
          return cell.formattedValue;
        });
        formattedValues.push(rowIndex + 3);
        if (isThereData) {
          //The first two rows are header rows
          //And we need to add a + 1 because indexes are 0 based, whereas we want to display the row number to the user
          //Check for empty strings - we need to make them null
          //Sometimes people just press space in a cell, and it doesn't mean anything
          formattedValues.map((str, index) => {
            if (isString(str)) {
              str = trim(str);
              if (!str.replace(/\s/g, '').length) {
                //string is only whitespace, probably a typo
                str = null;
                formattedValues[index] = null;
              } else if (!str.match(/\w+/)) {
                //if it doesn't have anything in there its probably also a typo
                str = null;
                formattedValues[index] = null;
              }
            }
            //Also, gsheets reads in values as undefined, but I like null values
            // if (isUndefined(str)) {
            //   formattedValues[index] = null;
            // }
          });
          return formattedValues;
        } else {
          return null;
        }
      } else {
        return null;
      }
    }).filter((row) => {
      return row;
    });
  } else {
    throw new Error('Unknown data type for ExperimentSheet data');
  }
}

/**
 * Take the rowDataValues and split to batches
 * Every time we see something in the batchId row
 * Create a new batchId Key
 * @param sheets
 */
ExpScreenUploadWorkflow.load.workflows.splitToBatches = function (sheets: Array<any>) {
  return new Promise((resolve, reject) => {
    let sheet, headers, data;
    //Get the sheets
    app.winston.info('Getting the data from the google spreadsheet');
    try {
      sheet = getScreenExperimentDataSheet(sheets);
    } catch (error) {
      reject(new Error(`Error getting ScreenExperimentSheet Data: ${error}`));
    }
    //Get the headers
    try {
      headers = getScreenExperimentDataHeaders(sheet);
    } catch (error) {
      reject(new Error(`Error getting ScreenExperimentSheet Headers: ${error}`));
    }
    //Get the actual experiment data
    try {
      data = getScreenExperimentDataRows(sheet);
    } catch (error) {
      reject(new Error(`Error formatting ScreenExperimentSheet Data Rows: ${error}`));
    }

    /**
     * Parse this into a more expected data structure for a csv
     * data is an array of arrays, where each element in the top array corresponds to a row
     * and each element in the array corresponds to a single cell
     * Most csvs are an array of objects, where each array is the row
     * and the object is { columnName: cellValue }
     */
    app.winston.info('Parsing data to array of objects data structure');
    let parsedData: Array<any> = data.map((row) => {
      let rowObject = {};
      row.map((cell: string, index) => {
        let headerValue = headers[index];
        if (!isUndefined(headerValue) && !isNull(headerValue)) {
          rowObject[headerValue] = cell;
        }
      });
      rowObject['rowIndex'] = row[row.length - 1];
      return rowObject;
    });
    app.winston.info(`parsedData: ${parsedData[0]}`);

    /**
     * This is what the lab calls a batch
     * which is a group of plates all imaged on the same day or range of days
     * They include L4440, L4440(E/S), RNAi(N2), RNAi(M/mel/mip)
     */
    app.winston.info('Parsing data to batches');
    let batches = {};
    let thisBatch = null;
    parsedData.map((row) => {
      //Create the batch key list if it doesn't exist already
      if (!isUndefined(row.BatchID) && !isNull(row.BatchID) && !row.BatchID.match(/^#/)) {
        if (!get(batches, row.BatchID)) {
          batches[row.BatchID] = [];
        }
        thisBatch = row.BatchID;
      }

      //Add the rows to the batch
      if (thisBatch) {
        row.BatchID = thisBatch;
        batches[thisBatch].push(row);
      }
    });

    app.winston.info('Filling in the sparse data');
    fillInSparseData(batches)
      .then((batches) => {
        app.winston.info('Doing sanity checks');
        return sanityChecks(batches);
      })
      .then((batchObj) => {
        // If there are errors just resolve the batchObj with the errors
        app.winston.info('Checking for errors');
        if (get(batchObj, 'hasErrors') && isEqual(get(batchObj, 'hasErrors'), true)) {
          app.winston.info('There are errors, not creating expWorkflows');
          resolve(batchObj);
        } else {
          //Carry on with making the batches
          app.winston.info('No errors! Creating the expWorkflows!');
          // resolve(batchObj);
          resolve(searchBatches(batchObj));
        }
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

/**
 * Remove workflows that were previously processed / exist
 * @param batchObj
 */
function removeFoundWorkflows(batchObj) {
  let expWorkflows = [];
  batchObj['expWorkflows'].map((expWorkflow) => {
    if (!includes(batchObj['foundWorkflows'], expWorkflow.name)) {
      expWorkflows.push(expWorkflow);
    }
  });
  batchObj['expWorkflows'] = expWorkflows;
  return batchObj;
}

/**
 * The team fills out a spreadsheet that is sparsely populated to make for fewer typos
 * That needs to be filled in with the appropriate sticky rules
 * @param batches
 */
const fillInSparseData = function (batches) {
  return new Promise((resolve, reject) => {
    try {
      batches = fillInCtrlBatches(batches);
    } catch (error) {
      reject(new Error(`Error filling in ctrl batches: ${error}`));
    }
    try {
      batches = fillInScreenMoniker(batches);
    } catch (error) {
      reject(new Error(`Error filling in screen monikers: ${error}`));
    }
    try {
      batches = fillInDates(batches);
    } catch (error) {
      reject(new Error(`Error filling in dates: ${error}`));
    }

    try {
      batches = fillInTemperatures(batches);
    } catch (error) {
      reject(new Error(`Error filling in temperatures: ${error}`));
    }
    resolve(batches);
  });
};

/**
 * Perform a series of sanity checks against the data
 * 1. Do the screen monikers exist in the PlateSearchConfiguration collection
 * 2. Do all control batches have a corresponding batch
 * @param batches
 */
const sanityChecks = function (batches) {
  //TODO Return errors
  let batchObj = {batches: batches, errors: {}, hasErrors: false};
  batchObj = sanityChecksInitializeErrors(batchObj);
  batchObj = sanityChecksAreDatesValid(batchObj);
  batchObj = sanityChecksDoControlBatchesExist(batchObj);
  return new Promise((resolve, reject) => {
    sanityCheckDoScreenMonikersExistPlateSearchConfiguration(batchObj)
      .then((batchObj) => {
        return sanityCheckEnsureStockPlateExists(batchObj);
      })
      .then((batchObj) => {
        resolve(batchObj);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

const sanityChecksInitializeErrors = function (batchObj) {
  let batches = batchObj['batches'];
  Object.keys(batches).map((batchKey) => {
    let batch = batches[batchKey];
    batch.map((row) => {
      row['errors'] = [];
    });
  });
  return batchObj;
};

/**
 * Check to ensure all dates are valid
 * Dates should be JUST DATES AND ONLY DATES
 * no other strings, comments, stars, astericks, hashtags, whatever
 * @param batches
 */
const sanityChecksAreDatesValid = function (batchObj) {
  let batches = batchObj['batches'];
  let foundDateError = false;
  //TODO Permissive/Restrictive should be based on the screenMonikers
  // 'RestrictiveStartImageDate',
  //   'RestrictiveEndImageDate', 'PermissiveStartImageDate', 'PermissiveEndImageDate'];


  Object.keys(batches).map((batchKey) => {
    let batch = batches[batchKey];
    batch.map((row) => {
      let dateKeys = ['AssayDate', 'CultureDate', 'IPTG_InductionDate'];
      row['ScreenMonikerList'].map((screenMoniker) => {
        //This is a really hacky way of checking if this is a permissive screen...
        if (screenMoniker.match(/E$/)) {
          dateKeys.push('PermissiveStartImageDate');
          dateKeys.push('PermissiveEndImageDate');
        }
        if (screenMoniker.match(/S$/)) {
          dateKeys.push('RestrictiveStartImageDate');
          dateKeys.push('RestrictiveEndImageDate');
        }
      });
      dateKeys.map((dateKey) => {
        if (row[dateKey] && !moment(row[dateKey]).isValid()) {
          row['errors'].push(`DateType: ${dateKey} is not a valid date.`);
          foundDateError = true;
          batchObj['hasErrors'] = true;
          set(batchObj, ['errors', 'DateError'], true);
        }
      });
    });
  });
  return batchObj;
};

/**
 * All control batches MUST map back to a top level batch key
 * If they don't there is probably a typo somewhere
 * @param batches
 */
const sanityChecksDoControlBatchesExist = function (batchObj) {
  let batches = batchObj['batches'];
  let ctrlSets = ['CtrlNullSet', 'CtrlStrainSet', 'CtrlRNAiSet'];
  Object.keys(batches).map((batchKey) => {
    let batch = batches[batchKey];
    batch.map((row) => {
      ctrlSets.map((ctrlSet) => {
        let ctrlSetBatchKey = row[ctrlSet];
        if (!get(batches, ctrlSetBatchKey)) {
          row['errors'].push(`CtrlSet ${ctrlSet} has an invalid batch key identifier. ${ctrlSetBatchKey} is not valid`);
          batchObj['hasErrors'] = true;
          set(batchObj, ['errors', 'CtrlSetKeyError'], true);
        }
      });
    });
  });
  return batchObj;
};

const sanityCheckDoScreenMonikersExistPlateSearchConfiguration = function (batchObj) {
  let batches = batchObj['batches'];
  let screenMonikers = [];
  Object.keys(batches).map((batchKey) => {
    let batch = batches[batchKey];
    batch.map((row) => {
      let t = row['ScreenMonikerList'];
      t.map((tt) => {
        screenMonikers.push(tt);
      });
    });
  });
  screenMonikers = uniq(screenMonikers);
  return new Promise((resolve, reject) => {
    app.models.PlateSearchConfiguration
      .find({where: {screenMoniker: {inq: screenMonikers}}, fields: {screenMoniker: true}})
      .then((plateSearchConfigs) => {

        let foundMonikers = plateSearchConfigs.map((plateSearchConfig) => {
          return plateSearchConfig.screenMoniker;
        });
        screenMonikers.map((screenMoniker) => {
          if (!includes(foundMonikers, screenMoniker)) {
            app.winston.info(`ScreenMoniker: ${screenMoniker} not found!`);
            batches = addScreenMonikersError(batches, screenMoniker);
            set(batchObj, 'hasErrors', true);
            set(batchObj, ['errors', 'ScreenMonikerError'], true);
          }
        });
        resolve(batchObj);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

const addScreenMonikersError = function (batches, screenMoniker) {
  Object.keys(batches).map((batchKey) => {
    let batch = batches[batchKey];
    batch.map((row) => {
      if (includes(row['ScreenMonikerList'], screenMoniker)) {
        row['errors'].push(`ScreenMoniker: ${screenMoniker} is not a valid Screen Moniker. Please ensure that there are no typos and that the screen moniker exists in the PlateSearchConfiguration collection.`);
      }
    });
  });
  return batches;
};

/**
 * The stock plate is written in 3 separate columns
 * Chromosome Plate384 SectorID
 * In the database this is concatenated in a single column as -
 * StockPlate - ${Chromosome}-${Plate384}-${SectorID}
 */
const sanityCheckEnsureStockPlateExists = function (batchObj) {
  let batches = batchObj['batches'];
  let stockPlates = [];
  Object.keys(batches).map((batchKey) => {
    let batch = batches[batchKey];
    batch.map((row) => {
      if (row['Chromosome']) {
        let stockPlate = `${row['Chromosome']}-${row['Plate384']}-${row['SectorID']}`;
        stockPlates.push(stockPlate);
        row['StockPlate'] = stockPlate;
      }
    });
  });
  stockPlates = uniq(stockPlates);
  return new Promise((resolve, reject) => {
    Promise.map(stockPlates, (stockPlate) => {
      return app.models.RnaiLibrary
        .findOne({where: {stockPlate: stockPlate}, fields: {stockPlate: true}})
        .then((results) => {
          if (!results) {
            batches = addStockPlateNotFoundError(batches, stockPlate);
            batchObj['hasErrors'] = true;
            set(batchObj, ['errors', 'StockPlateError'], true);
            //ToDO Add Error
          }
          return;
        })
        .catch((error) => {
          return new Error(error);
        })
    })
      .then(() => {
        resolve(batchObj);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

const addStockPlateNotFoundError = function (batches, stockPlate) {
  Object.keys(batches).map((batchKey) => {
    let batch = batches[batchKey];
    batch.map((row) => {
      if (isEqual(row['StockPlate'], stockPlate)) {
        row['errors'].push(`Stock Plate: ${stockPlate} is not a valid stock plate`);
      }
    });
  });
};
/**
 * The spreadsheet is sparsely populated
 * But for the computer/QC checking we want it completely filled in
 * CtrlNullSet, CtrlRNAiSet, CtrlStrainSet are sticky to the first row in the batch
 * Unlike dates, which are sticky to the previous
 * @param batches
 */
const fillInCtrlBatches = function (batches: any) {
  let ctrlSets = ['CtrlNullSet', 'CtrlStrainSet', 'CtrlRNAiSet'];
  Object.keys(batches).map((batchName: string) => {
    let firstRow = batches[batchName][0];
    batches[batchName].map((row) => {
      ctrlSets.map((ctrlSet) => {
        if (isUndefined(row[ctrlSet]) || isNull(row[ctrlSet])) {
          row[ctrlSet] = firstRow[ctrlSet];
        }
      });
    });
  });
  return batches;
};

/**
 * ScreenMoniker is a code that has the screens
 * mips_1E would correspond to the screen "Mips-1;mips-2 Primary Permissive Screen"
 * "mips_1E mips_1S" needs to be split to an array of [mips_1E, mips_1S]
 * Right now I have that the screenMonikerList is always filled in from the top
 * But i'm not sure if it can change mid stream of not...
 * @param batches
 */
const fillInScreenMoniker = function (batches) {
  let splits = [" ", ","];
  Object.keys(batches).map((batchKey) => {
    let screenMoniker: string = batches[batchKey][0]['ScreenMoniker'];
    if (!screenMoniker) {
      throw new Error(`No screen moniker for ${batchKey}`);
    } else {
      let screenMonikerList = [];
      splits.map((split: string) => {
        screenMoniker.split(split).map((t) => {
          if (!isEqual(t, screenMoniker)) {
            screenMonikerList.push(trim(t));
          }
        });
      });
      screenMonikerList = uniq(screenMonikerList);
      batches[batchKey].map((row) => {
        row['ScreenMonikerList'] = screenMonikerList;
        row['ScreenMoniker'] = screenMoniker;
      })
    }
  });
  return batches;
};

/**
 * Dates are sticky to the previous date, not the first date in the batch (unlike ctrl dates)
 * @param batches
 */
const fillInDates = function (batches) {
  let dateKeys = ['AssayDate', 'CultureDate', 'IPTG_InductionDate', 'RestrictiveStartImageDate',
    'RestrictiveEndImageDate', 'PermissiveStartImageDate', 'PermissiveEndImageDate'];

  Object.keys(batches).map((batchKey) => {
    let firstRow = batches[batchKey][0];
    //Sometimes the date has a comment in it, which is nearly always replicated in the actual comment section
    //So for now I'm just getting rid of it.
    ['PermissiveEndImageDate', 'RestrictiveEndImageDate', 'PermissiveStartImageDate', 'RestrictiveStartImageDate'].map((dateKey) => {
      let tDate = firstRow[dateKey];
      tDate = trim(tDate);
      batches[batchKey][0][dateKey] = tDate;
      if (tDate.match(/\w+/)) {
        // let date = tDate.match(/(\w+)-(\w+)-(\w+)/);
        // firstRow[dateKey] = `${date[1]}-${date[2]}-${date[3]}`;
        firstRow[dateKey] = moment(tDate, "DD-MMM-YYYY");
      } else {
        batches[batchKey][0][dateKey] = null;
      }
    });

    //Make sure all the dates have some sort of character in them
    //If someone just typed in a space it will get screwed up down the line
    Object.keys(batches).map((batchKey) => {
      batches[batchKey].map((row: any) => {
        dateKeys.map((dateKey) => {
          if (isEmpty(row[dateKey])) {
            row[dateKey] = null;
          }
        });
      });
    });

    //If the EndDate is not filled in its just the start date
    let pKey = 'PermissiveEndImageDate';
    let rKey = 'RestrictiveEndImageDate';

    if (isNull(firstRow[pKey]) || isUndefined(firstRow[pKey])) {
      firstRow[pKey] = firstRow['PermissiveStartImageDate'];
    }
    if (isNull(firstRow[rKey]) || isUndefined(firstRow[rKey])) {
      firstRow[rKey] = firstRow['RestrictiveStartImageDate'];
    }

    //Turn these into actual dates
    dateKeys.map((dateKey) => {
      if (firstRow[dateKey]) {
        try {
          firstRow[dateKey] = moment(firstRow[dateKey], 'DD-MMM-YYYY');
          console.log();
        } catch (error) {
          console.log(error);
        }
      }
    });

    batches[batchKey].map((row: any, index: number) => {
      dateKeys.map((dateKey) => {
        if (!row[dateKey]) {
          try {
            let lastRow = get(batches[batchKey], index - 1);
            if (lastRow) {
              row[dateKey] = moment(lastRow[dateKey], "DD-MMM-YYYY");
            }
          } catch (error) {
            console.log(error);
            // throw new Error(error);
          }
        }
      });
    });

  });
  return batches;
};

const fillInTemperatures = function (batches) {

  let temperatureKeys = ['PermissiveTemp', 'RestrictiveTemp'];
  Object.keys(batches).map((batchKey) => {
    batches[batchKey].map((row: any, index) => {
      temperatureKeys.map((temperatureKey) => {
        if (row[temperatureKey]) {
          row[temperatureKey] = trim(row[temperatureKey]);
        }
        //Sometimes they add a star in to indicate there can be more than 1 temperature
        if (row[temperatureKey] && row[temperatureKey].match('\\*')) {
          let temp: string = row[temperatureKey];
          row[temperatureKey] = temp.replace('*', '');
          row[temperatureKey] = trim(row[temperatureKey]);
        }
        if (row[temperatureKey] || isEmpty(row[temperatureKey])) {
          try {
            let lastRow = get(batches[batchKey], index - 1);
            if (lastRow) {
              row[temperatureKey] = lastRow[temperatureKey];
            }
          } catch (error) {
            throw new Error(error);
          }
        }
      });
    });

  });
  return batches;
};


/**
 * Searches mostly come from the PlateSearchConfiguration, which has the barcode configuration
 * Dates come from the batch data itself
 * @param batch
 * @param screenType
 */
const generateImageDateSearch = function (batch, screenType) {
  const imageStart = batch[0][`${screenType}StartImageDate`];
  const last = batch[batch.length - 1];
  let imageEnd = last[`${screenType}EndImageDate`];

  let startDate = moment(imageStart).format('YYYY-MM-DD');
  let endDate = moment(imageEnd).format('YYYY-MM-DD');
  return {creationdate: {between: [startDate, endDate]}}
};

const searchBatches = function (batchObj) {
  let batches = batchObj['batches'];
  set(batchObj, ['errors', 'createWorkflowErrors'], []);
  set(batchObj, ['expWorkflows'], []);
  set(batchObj, ['foundWorkflows'], []);
  let ctrlNullBatchKeys = [];
  let ctrlStrainBatchKeys = [];
  let ctrlReagentBatchKeys = [];
  let treatReagentBatchKeys = [];
  let screenMonikers = [];

  Object.keys(batches).map((batchKey: string) => {
    const batch = batches[batchKey];
    batch.map((row) => {
      ctrlNullBatchKeys.push(row['CtrlNullSet']);
      ctrlStrainBatchKeys.push(row['CtrlStrainSet']);
      ctrlReagentBatchKeys.push(row['CtrlRNAiSet']);
      row['ScreenMonikerList'].map((sm) => {
        screenMonikers.push(sm);
      });
    });
    treatReagentBatchKeys.push(batchKey);
  });

  ctrlNullBatchKeys = uniq(ctrlNullBatchKeys);
  ctrlStrainBatchKeys = uniq(ctrlStrainBatchKeys);
  ctrlReagentBatchKeys = uniq(ctrlReagentBatchKeys);
  treatReagentBatchKeys = uniq(treatReagentBatchKeys);
  screenMonikers = uniq(screenMonikers);
  let blockKeys = {
    treatReagent: treatReagentBatchKeys,
    ctrlReagent: ctrlReagentBatchKeys,
    ctrlNull: ctrlNullBatchKeys,
    ctrlStrain: ctrlStrainBatchKeys,
  };

  let batchedPlateData = {};
  return new Promise((resolve, reject) => {
    app.models.PlateSearchConfiguration
      .find()
      .then((plateSearchConfigurations) => {
        return Promise.map(Object.keys(blockKeys), (block) => {
          //this loop searches the ctrlBatches
          return Promise.map(blockKeys[block], (ctrlBatchKey) => {
            if (!get(batches, ctrlBatchKey)) {
              batchObj['errors']['createWorkflowErrors'].push(`No batch found for ${ctrlBatchKey}. There is probably a typo somewhere`);
              return new Error(`No batch found for ${ctrlBatchKey}. There is probably a typo somewhere`);
            } else {
              let ctrlBatch = batches[ctrlBatchKey];
              //Get the barcode search pattern from the configuration
              //These should be fairly standardized, but sometimes there is a custom search for the batch
              //There is often a custom search when there is some form of error
              //The microscope didn't cooperate, there were typos in the barcode, etc
              return Promise.map(ctrlBatch[0]['ScreenMonikerList'], (screenMoniker: string) => {
                //Check to ensure there is a barcode search configuration for this screenMoniker
                if (!find(plateSearchConfigurations, {screenMoniker: screenMoniker})) {
                  batchObj['errors']['createWorkflowErrors'].push(`No barcode search configuration found for ScreenMoniker: ${screenMoniker}. Please ensure ScreenMoniker is typed EXACTLY as it is in the metadata form.`);
                  batchObj['errors']['hasErrors'] = true;
                  return new Error(`No barcode search configuration found for ScreenMoniker: ${screenMoniker}. Please ensure ScreenMoniker is typed EXACTLY as it is in the metadata form.`);
                } else {
                  let tsearch: any = cloneDeep(find(plateSearchConfigurations, {screenMoniker: screenMoniker}));
                  let barcodeSearches = tsearch['barcodeSearches'];
                  let search = barcodeSearches[`${block}BarcodePattern`];
                  search.and.push(generateImageDateSearch(ctrlBatch, tsearch.screenType));
                  return searchPlates(screenMoniker, tsearch.screenType, ctrlBatchKey, block, search)
                    .then((plates) => {
                      merge(batchedPlateData, plates);
                      return;
                    })
                    .catch((error) => {
                      //We don't want to just throw errors, but instead catch them
                      //So we can return them to the users
                      batchObj['errors']['hasErrors'] = true;
                      batchObj['errors']['createWorkflowErrors'].push(error);
                      return;
                    });
                }
              })
            }
          })
        })
          .then(() => {
            app.winston.info('Creating expWorkflows from batched plate data');
            let expWorkflows = separateBatchedPlateDataIntoExpWorkflows(batches, batchedPlateData, plateSearchConfigurations);
            //TODO the updateExpWorkflowNames is just a cleanup
            //It will get removed at some point
            return updateExpWorkflowNames(expWorkflows)
              .then(() => {
                return findProcessedWorkflows(expWorkflows);
              })
              .then((foundWorkflowNames: Array<string>) => {
                app.winston.info(`These batches were already processed: ${foundWorkflowNames}`);
                let t = {expWorkflows: expWorkflows, foundWorkflows: foundWorkflowNames};
                batchObj['expWorkflows'].push(t['expWorkflows']);
                batchObj['foundWorkflows'].push(foundWorkflowNames);
                return t;
              });
          })
          .then(() => {
            return;
          })
          .catch((error) => {
            app.winston.info(`Found errors ${error}`);
            batchObj['errors']['hasErrors'] = true;
            batchObj['errors']['createWorkflowErrors'].push(error);
            resolve(batchObj);
          })
      })
      .then(() => {
        app.winston.info(`Should be attaching batchedPlateData to batchObj`);
        batchObj['expWorkflows'] = flattenDeep(batchObj['expWorkflows']);
        batchObj['foundWorkflows'] = flattenDeep(batchObj['foundWorkflows']);
        batchObj = removeFoundWorkflows(batchObj);
        //For now I am keeping the foundWorkflows, but they should really be deleted to save space
        resolve(batchObj);
      })
      .catch((error) => {
        app.winston.error(error);
        batchObj['errors']['hasErrors'] = true;
        batchObj['errors']['createWorkflowErrors'].push(error);
        resolve(batchObj);
      });
  });
};

const findProcessedWorkflows = function (expWorkflows: ExpScreenUploadWorkflowResultSet[]) {
  let where = {
    or:
      expWorkflows.map((expWorkflow) => {
        return {name: expWorkflow['name']}
      }),
  };
  return new Promise((resolve, reject) => {
    app.models.ExpScreenUploadWorkflow
      .find({where: where, fields: {name: true}})
      .then((results: ExpScreenUploadWorkflowResultSet[]) => {
        let names = results.map((r) => {
          return r.name;
        });
        names = uniq(names);
        resolve(names);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

/**
 * This is a (hopefully) one time update!
 * @param expWorkflows
 */
const updateExpWorkflowNames = function (expWorkflows: ExpScreenUploadWorkflowResultSet[]) {
  return new Promise((resolve, reject) => {
    app.models.ExpScreenUploadWorkflow
      .find({
        where: {
          or:
            expWorkflows.map((expWorkflow) => {
              return {name: new RegExp(expWorkflow['tmpSearchForThisName'])}
            }),
        },
      })
      .then((results) => {
        return Promise.map(results, (expWorkflow) => {
          let tExpWorkflow = find(expWorkflows, (newExpWorkflow) => {
            return expWorkflow.name.match(newExpWorkflow['tmpSearchForThisName']);
          });

          expWorkflow.name = tExpWorkflow.name;
          expWorkflow['assayDates'] = tExpWorkflow.assayDates;
          expWorkflow['stockPrepDate'] = tExpWorkflow.stockPrepDate;
          expWorkflow['cultureDate'] = tExpWorkflow['cultureDate'];

          return app.models.ExpScreenUploadWorkflow
            .upsert(expWorkflow)
            .then((r) => {
              return;
            })
            .catch((error) => {
              return new Error(error);
            })
        });
      })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

/**
 * We have the 'batches' from the spreadsheet
 * And the batchedPlateData, which are the actual plates from the arrayscan database with their corresponding batches
 * Now we need to match these (treatReagent, ctrlNull, ctrlStrain, ctrlReagent) into what I call a batch, which is the ExpWorkflow def
 * @param batches
 * @param batchedPlateData
 */
const separateBatchedPlateDataIntoExpWorkflows = function (batches, batchedPlateData, plateSearchConfigurations) {
  let expWorkflows = [];
  const plateModelMapping = {
    ctrlNull: 'ctrl_null_plates',
    treatReagent: 'treat_rnai_plates',
    ctrlStrain: 'ctrl_strain_plates',
    ctrlReagent: 'ctrl_rnai_plates',
  };
  Object.keys(batches).map((treatReagentBatchKey) => {
    let treatReagentBatch: Array<any> = batches[treatReagentBatchKey];
    treatReagentBatch.map((row: any) => {
      let ctrlReagentBatchKey = row['CtrlRNAiSet'];
      let ctrlStrainBatchKey = row['CtrlStrainSet'];
      let ctrlNullBatchKey = row['CtrlNullSet'];
      let screenMonikers = row['ScreenMonikerList'];
      let batchNames = {
        ctrlNull: ctrlNullBatchKey,
        ctrlStrain: ctrlStrainBatchKey,
        ctrlReagent: ctrlReagentBatchKey,
        treatReagent: treatReagentBatchKey,
      };

      screenMonikers.map((screenMoniker: string) => {
        if (!find(plateSearchConfigurations, {screenMoniker: screenMoniker})) {
          console.log(`there is no plate configuration for screenMoniker: ${screenMoniker}`);
        } else {
          let plateConfiguration = find(plateSearchConfigurations, {screenMoniker: screenMoniker});
          let screenType = plateConfiguration['screenType'];
          let temperature = row[`${screenType}Temp`];
          let expBiosampleName = get(plateConfiguration, ['biosamples', 'experimentBiosample', 'name']);
          let controlBiosampleName = get(plateConfiguration, ['biosamples', 'ctrlBiosample', 'name']);
          let notFound = false;

          ['AssayDate', 'Chromosome', 'Plate384', 'SectorID'].map((key) => {
            if (!get(row, key)) {
              //TODO Add to errors
              notFound = true;
              // errors.push(`${key} not found for ${screenMoniker} ${treatReagentBatchKey}`);
            }
          });
          if (isEqual(notFound, false)) {
            let assayDate = moment(row['AssayDate']).format('YYYY-MM-DD');
            let chrom = row['Chromosome'];
            let plate = row['Plate384'];
            let quadrant = row['SectorID'];
            let screenCode = 'E';
            if (isEqual(screenType, 'Restrictive')) {
              screenCode = 'S';
            }
            let batchName = `AD RNAi AHR ${assayDate} ${expBiosampleName} ${controlBiosampleName} ${temperature} ${screenCode} Chr ${chrom} ${plate} ${quadrant}`;
            let searchForThisName = `${expBiosampleName} ${controlBiosampleName} ${temperature} ${screenCode} Chr ${chrom} ${plate} ${quadrant}`;

            let plateModel = {};
            let expDataModel = {
              assayDates: [moment(row['AssayDate'])],
              name: batchName, comment: row['Comments'],
              expScreen: {
                screenId: plateConfiguration['screenId'], screenName: plateConfiguration['screenName'],
                screenType: plateConfiguration['screenType']
              },
              library: {libraryId: 1},
              temperature: temperature,
            };
            const expBiosampleModel = {
              expBiosample: {
                biosampleId: get(plateConfiguration, ['biosamples', 'experimentBiosample', 'id']),
                biosampleName: get(plateConfiguration, ['biosamples', 'experimentBiosample', 'name']),
              },
              ctrlBiosample: {
                biosampleId: get(plateConfiguration, ['biosamples', 'ctrlBiosample', 'id']),
                biosampleName: get(plateConfiguration, ['biosamples', 'ctrlBiosample', 'name']),
              },
            };

            ['treatReagent', 'ctrlReagent', 'ctrlNull', 'ctrlStrain'].map((setType) => {
              let batchKey = batchNames[setType];
              let thisSetKeyAllBatches: Array<any> = get(batchedPlateData, [batchKey, screenType]);
              let thisSetKeyPlates = null;
              //Preferentially get ctrl batches with the same moniker
              if (get(thisSetKeyAllBatches, [screenMoniker, setType])) {
                thisSetKeyPlates = get(thisSetKeyAllBatches, [screenMoniker, setType]);
              } else if (isEqual(Object.keys(thisSetKeyAllBatches).length, 1)) {
                let matchedScreenMoniker = Object.keys(thisSetKeyAllBatches)[0];
                thisSetKeyPlates = get(thisSetKeyAllBatches, [matchedScreenMoniker, setType]);
              } else {
                // errors.push('WTF');
                console.log('Unknown error');
              }
              let matchedPlates = [];
              if (setType.match('Reagent')) {
                matchedPlates = thisSetKeyPlates.filter((plateObj) => {
                  return plateObj.name.match(`${chrom}.${plate}${quadrant}`);
                });
              } else {
                matchedPlates = thisSetKeyPlates;
              }
              matchedPlates = orderBy(matchedPlates, 'csPlateid');
              let plateModelKey = get(plateModelMapping, setType);
              set(plateModel, [plateModelKey], matchedPlates);
            });
            splitIntoReplicates(plateModel);
            //Stupid import IS STUPID
            let expWorkflow = setDefaults(plateModel, expDataModel, expBiosampleModel);
            set(expWorkflow, ['assayDates'], [moment(row['AssayDate']).toISOString()]);
            set(expWorkflow, ['stockPrepDate'], moment(row['CultureDate'].toISOString()));
            set(expWorkflow, ['cultureDate'], moment(row['CultureDate'].toISOString()));
            set(expWorkflow, ['search', 'rnaiLibrary', 'plate'], plate);
            set(expWorkflow, ['search', 'rnaiLibrary', 'quadrant'], quadrant);
            set(expWorkflow, ['search', 'rnaiLibrary', 'chrom'], chrom);
            //I was a dummy and somehow have the date in there as the date it was uploaded instead of the assaydate
            //So I am a dummy
            //I am great big dummy
            //Dummy dummy dummy
            set(expWorkflow, ['tmpSearchForThisName'], searchForThisName);
            expWorkflows.push(expWorkflow);
          }
        }
      });
    });
  });
  return expWorkflows;
};

const searchPlates = function (screenMoniker: string, screenType: string, plateSearchKey: string, block: string, search) {
  return new Promise((resolve, reject) => {
    const r = {};
    app.models.Plate
      .find({
        where: search, fields: {
          csPlateid: true,
          id: true,
          name: true,
          platebarcode: true,
          creationdate: true,
        }
      })
      .then((plates) => {
        //TODO Create global error object and stick this here
        let r = {};
        if (!plates.length) {
          console.log(`There were no plates for ${screenMoniker} ${block} ${plateSearchKey}`);
        }
        plates.map((plate) => {
          plate['instrumentPlateId'] = plate.csPlateid;
        });
        set(r, [plateSearchKey, screenType, screenMoniker, block], plates);
        resolve(r)
      })
      .catch((error) => {
        // errors.push(error);
        resolve(r);
      });
  });
};

/**
 * All this replicates functionality is deprecated since we introduced expGroupIds
 * But its still in the codebase somewhere so it STAYS
 * @param plateModel
 */
const splitIntoReplicates = function (plateModel) {
  plateModel['replicates'] = {};
  plateModel.treat_rnai_plates.map((plate, index) => {
    pushReplicate(plateModel, plate, index);
  });
  plateModel.ctrl_rnai_plates.map((plate, index) => {
    pushReplicate(plateModel, plate, index);
  });
  // Sometimes there is 1 L4440 per replicate, and sometimes 2
  // If its two we want the first half in the R1 replicates, and the second in the R2
  // Chunk each l4440 plate array into bins size of l4440_index
  const chunkSize = Math.ceil(plateModel.ctrl_strain_plates.length / plateModel.treat_rnai_plates.length);
  const chunked_treat_l4440 = chunk(plateModel.ctrl_strain_plates, chunkSize);
  const chunked_null_l4440 = chunk(plateModel.ctrl_null_plates, chunkSize);

  chunked_treat_l4440.map((chunk, index) => {
    chunk.map((plate) => {
      pushReplicate(plateModel, plate, index);
    });
  });

  chunked_null_l4440.map((chunk, index) => {
    chunk.map((plate) => {
      pushReplicate(plateModel, plate, index);
    });
  });
};

const pushReplicate = function (plateModel, plate, index) {
  if (!plateModel.replicates.hasOwnProperty(index + 1)) {
    plateModel.replicates[index + 1] = [];
  }
  plateModel.replicates[index + 1].push(plate.csPlateid);
};

function setDefaults(plateModel, expDataModel, expBiosampleModel) {

  const model = new ExpScreenUploadWorkflowResultSet();

  // These are just general model things
  model.name = expDataModel.name;
  model.comment = expDataModel.comment;
  model.screenId = expDataModel.expScreen.screenId;
  model.screenName = expDataModel.expScreen.screenName;
  model.screenType = expDataModel.expScreen.screenType;
  model.libraryId = expDataModel.library.libraryId;
  const biosamples = {
    'experimentBiosample': {
      'id': expBiosampleModel.expBiosample.biosampleId,
      'name': expBiosampleModel.expBiosample.biosampleName
    },
    'ctrlBiosample': {
      'id': expBiosampleModel.ctrlBiosample.biosampleId,
      'name': expBiosampleModel.ctrlBiosample.biosampleName
    },
  };
  // model.stockPrepDate = expDataModel.assayDates[0];
  // model.assayDates = expDataModel.assayDates;
  model.stockPrepDate = expDataModel.assayDates[0].toISOString();
  model.assayDates = [];

  expDataModel.assayDates.map((date) => {
    model.assayDates.push(date.toISOString());
  });
  model.biosamples = biosamples;
  model.temperature = expDataModel.temperature;
  model.replicates = plateModel.replicates;
  // NY Specific ArrayScan
  model.instrumentId = 1;
  model.instrumentLookUp = 'arrayScan';
  model.instrumentPlateIdLookup = 'csPlateid';

  model.libraryModel = 'RnaiLibrary';
  model.libraryStockModel = 'RnaiLibraryStock';
  model.librarycode = 'ahringer2';
  model.biosampleType = 'worm';
  model.reagentLookUp = 'rnaiId';
  model.assayViewType = 'exp_assay_ahringer2';
  model.plateViewType = 'exp_plate_ahringer2';
  model.conditions = [
    'treat_rnai',
    'ctrl_rnai',
    'ctrl_null',
    'ctrl_strain'
  ];
  model.controlConditions = [
    'ctrl_strain',
    'ctrl_null'
  ];
  model.experimentConditions = [
    'treat_rnai',
    'ctrl_rnai'
  ];
  model.experimentMatchConditions = {
    'treat_rnai': 'ctrl_rnai'
  };
  model.biosampleMatchConditions = {
    'treat_rnai': 'ctrl_strain',
    'ctrl_rnai': 'ctrl_null'
  };
  model.experimentDesign = {
    'treat_rnai': [
      'ctrl_rnai',
      'ctrl_strain',
      'ctrl_null'
    ]
  };

  // TODO Make Naming Consistent
  model.experimentGroups = {};
  model.experimentGroups.treat_rnai = {};
  model.experimentGroups.ctrl_rnai = {};
  model.experimentGroups.ctrl_strain = {};
  model.experimentGroups.ctrl_null = {};
  model.experimentGroups.treat_rnai.plates = plateModel.treat_rnai_plates;
  model.experimentGroups.treat_rnai.biosampleId = expBiosampleModel.expBiosample.biosampleId;
  model.experimentGroups.ctrl_rnai['plates'] = plateModel.ctrl_rnai_plates;
  model.experimentGroups.ctrl_rnai['biosampleId'] = expBiosampleModel.ctrlBiosample.biosampleId;
  model.experimentGroups.ctrl_strain.plates = plateModel.ctrl_strain_plates;
  model.experimentGroups.ctrl_strain.biosampleId = expBiosampleModel.expBiosample.biosampleId;
  model.experimentGroups.ctrl_null.plates = plateModel.ctrl_null_plates;
  model.experimentGroups.ctrl_null.biosampleId = expBiosampleModel.ctrlBiosample.biosampleId;
  return model;
}

function validateWorkflowData(model: RnaiScreenUploadWorkflowResultSet, errorMessages: Array<any>) {
  if (isEmpty(model.name)) {
    errorMessages.push('You must enter a screen name!');
  }
  if (isEmpty(model.temperature)) {
    errorMessages.push('You must enter a temperature!');
  }
  if (isNull(model.screenId)) {
    errorMessages.push('You must choose a screen!');
  }
  if (isNull(model.libraryId)) {
    errorMessages.push('You must choose a library!');
  }
  if (isEmpty(model.experimentGroups.treat_rnai.plates)) {
    errorMessages.push('There must be one or more Mutant + RNAi plates!');
  }
  if (isEmpty(model.experimentGroups.ctrl_rnai.plates)) {
    errorMessages.push('There must be one or more N2 + RNAi plates!');
  }
  return errorMessages;
}
