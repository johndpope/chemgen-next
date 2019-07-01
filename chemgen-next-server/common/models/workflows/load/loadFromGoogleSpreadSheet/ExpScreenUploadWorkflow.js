"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../../../../../server/server');
var fs = require('fs');
var path = require('path');
var readline = require('readline');
var google = require('googleapis').google;
var Promise = require('bluebird');
var models_1 = require("../../../../types/sdk/models");
var lodash_1 = require("lodash");
var moment = require("moment");
/*********************************************************************************
 * This API takes the google sheets URL, and tries to parse the batch data out of it
 * What is returned is an object containing the parsed batch data, any associated errors with their line numbers
 * and  hopefully the expWorkflows, and an array of any foundWorkflows that were processed previously
 *
 * TODO - the sheet should get updated with successful calls
 *
 *********************************************************************************/
// If modifying these scopes, delete token.json.
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
var TOKEN_PATH = 'token.json';
var CREDENTIALS_PATH = 'credentials.json';
// Here are two examples of some spreadsheet Ids that parse, one with and one without errors
// const spreadsheetId = '1yRoBQ9ybGH19t-ryw9tMiKiAiUSKV-hO3Co6FG3LeiY';
// const spreadsheetId = '1ZctLTu9Bc8RrT-Q2mdPd30urFqhMoNRi1gLP2BxjhXw';
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
ExpScreenUploadWorkflow.load.workflows.uploadFromGoogleSpreadSheet = function (spreadsheetId) {
    app.winston.info('should be processing google spreadsheet');
    return new Promise(function (resolve, reject) {
        getOAuthClient()
            .then(function (oAuth2client) {
            //TODO get spreadsheetId from URL
            return getSpreadsheetData(oAuth2client, spreadsheetId);
        })
            .then(function (spreadsheetData) {
            return ExpScreenUploadWorkflow.load.workflows.splitToBatches(spreadsheetData);
        })
            .then(function (batchObj) {
            resolve(batchObj);
        })
            .catch(function (error) {
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
    var _a = credentials.installed, client_secret = _a.client_secret, client_id = _a.client_id, redirect_uris = _a.redirect_uris;
    var oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err)
            return getNewToken(oAuth2Client, callback);
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
    var authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oAuth2Client.getToken(code, function (err, token) {
            if (err)
                return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), function (err) {
                if (err)
                    return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}
function getOAuthClient() {
    // Load client secrets from a local file.
    return new Promise(function (resolve, reject) {
        getCredentials()
            .then(function (credentialsStr) {
            return authorizePromise(JSON.parse(credentialsStr));
        })
            .then(function (oAuth2client) {
            resolve(oAuth2client);
        })
            // .then((spreadsheetData) => {
            // return getSpreadsheetData(oAuth2client, spreadsheetId);
            //   return spreadsheetData;
            // })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function getCredentials() {
    return new Promise(function (resolve, reject) {
        fs.readFile(CREDENTIALS_PATH, function (err, content) {
            if (err) {
                reject(new Error("Error loading client secret file: " + err));
            }
            else {
                resolve(content);
            }
        });
    });
}
function authorizePromise(credentials) {
    var _a = credentials.installed, client_secret = _a.client_secret, client_id = _a.client_id, redirect_uris = _a.redirect_uris;
    var oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    return new Promise(function (resolve, reject) {
        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, function (err, token) {
            // This script assumes you've already gone through the api verification song and dance
            // if (err) return getNewToken(oAuth2Client, callback);
            if (err) {
                reject(new Error("You must authorize the google sheets!"));
            }
            else {
                oAuth2Client.setCredentials(JSON.parse(token));
                resolve(oAuth2Client);
            }
        });
    });
}
function getSpreadsheetData(auth, spreadsheetId) {
    return new Promise(function (resolve, reject) {
        var sheets = google.sheets({ version: 'v4', auth: auth });
        sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId,
            ranges: [],
            includeGridData: true,
        }, function (err, res) {
            if (err) {
                reject(new Error('The API returned an error: ' + err));
            }
            else {
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
function getSpreadSheetIdFromUrl(url) {
    var split = url.split('/');
    return split[5];
}
function getScreenExperimentDataSheet(sheets) {
    return lodash_1.get(sheets, [1, 'data', 0, 'rowData']);
}
function getScreenExperimentDataHeaders(rowDataValues) {
    var headers = lodash_1.get(rowDataValues, [1, 'values']).map(function (column) {
        return column.formattedValue;
    });
    headers.push('rowIndex');
    return headers;
}
function getScreenExperimentDataRows(rowDataValues) {
    return getDataRows(rowDataValues);
}
/**
 * The first row is the same as the sheet name
 * The second are the headers
 * From there on down are the headers
 * @param rowDataValues
 */
function getDataRows(rowDataValues) {
    if (lodash_1.isArray(rowDataValues)) {
        return rowDataValues.slice(2, rowDataValues.length - 1).map(function (rowData, rowIndex) {
            var values = rowData.values;
            var isThereData = false;
            if (lodash_1.isArray(values)) {
                var formattedValues_1 = values.map(function (cell) {
                    if (cell.formattedValue) {
                        isThereData = true;
                    }
                    return cell.formattedValue;
                });
                formattedValues_1.push(rowIndex + 3);
                if (isThereData) {
                    //The first two rows are header rows
                    //And we need to add a + 1 because indexes are 0 based, whereas we want to display the row number to the user
                    //Check for empty strings - we need to make them null
                    //Sometimes people just press space in a cell, and it doesn't mean anything
                    formattedValues_1.map(function (str, index) {
                        if (lodash_1.isString(str)) {
                            str = lodash_1.trim(str);
                            if (!str.replace(/\s/g, '').length) {
                                //string is only whitespace, probably a typo
                                str = null;
                                formattedValues_1[index] = null;
                            }
                            else if (!str.match(/\w+/)) {
                                //if it doesn't have anything in there its probably also a typo
                                str = null;
                                formattedValues_1[index] = null;
                            }
                        }
                        //Also, gsheets reads in values as undefined, but I like null values
                        // if (isUndefined(str)) {
                        //   formattedValues[index] = null;
                        // }
                    });
                    return formattedValues_1;
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        }).filter(function (row) {
            return row;
        });
    }
    else {
        throw new Error('Unknown data type for ExperimentSheet data');
    }
}
/**
 * Take the rowDataValues and split to batches
 * Every time we see something in the batchId row
 * Create a new batchId Key
 * @param sheets
 */
ExpScreenUploadWorkflow.load.workflows.splitToBatches = function (sheets) {
    return new Promise(function (resolve, reject) {
        var sheet, headers, data;
        //Get the sheets
        app.winston.info('Getting the data from the google spreadsheet');
        try {
            sheet = getScreenExperimentDataSheet(sheets);
        }
        catch (error) {
            reject(new Error("Error getting ScreenExperimentSheet Data: " + error));
        }
        //Get the headers
        try {
            headers = getScreenExperimentDataHeaders(sheet);
        }
        catch (error) {
            reject(new Error("Error getting ScreenExperimentSheet Headers: " + error));
        }
        //Get the actual experiment data
        try {
            data = getScreenExperimentDataRows(sheet);
        }
        catch (error) {
            reject(new Error("Error formatting ScreenExperimentSheet Data Rows: " + error));
        }
        /**
         * Parse this into a more expected data structure for a csv
         * data is an array of arrays, where each element in the top array corresponds to a row
         * and each element in the array corresponds to a single cell
         * Most csvs are an array of objects, where each array is the row
         * and the object is { columnName: cellValue }
         */
        app.winston.info('Parsing data to array of objects data structure');
        var parsedData = data.map(function (row) {
            var rowObject = {};
            row.map(function (cell, index) {
                var headerValue = headers[index];
                if (!lodash_1.isUndefined(headerValue) && !lodash_1.isNull(headerValue)) {
                    rowObject[headerValue] = cell;
                }
            });
            rowObject['rowIndex'] = row[row.length - 1];
            return rowObject;
        });
        app.winston.info("parsedData: " + parsedData[0]);
        /**
         * This is what the lab calls a batch
         * which is a group of plates all imaged on the same day or range of days
         * They include L4440, L4440(E/S), RNAi(N2), RNAi(M/mel/mip)
         */
        app.winston.info('Parsing data to batches');
        var batches = {};
        var thisBatch = null;
        parsedData.map(function (row) {
            //Create the batch key list if it doesn't exist already
            if (!lodash_1.isUndefined(row.BatchID) && !lodash_1.isNull(row.BatchID) && !row.BatchID.match(/^#/)) {
                if (!lodash_1.get(batches, row.BatchID)) {
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
            .then(function (batches) {
            app.winston.info('Doing sanity checks');
            return sanityChecks(batches);
        })
            .then(function (batchObj) {
            // If there are errors just resolve the batchObj with the errors
            app.winston.info('Checking for errors');
            if (lodash_1.get(batchObj, 'hasErrors') && lodash_1.isEqual(lodash_1.get(batchObj, 'hasErrors'), true)) {
                app.winston.info('There are errors, not creating expWorkflows');
                resolve(batchObj);
            }
            else {
                //Carry on with making the batches
                app.winston.info('No errors! Creating the expWorkflows!');
                // resolve(batchObj);
                resolve(searchBatches(batchObj));
            }
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * Remove workflows that were previously processed / exist
 * @param batchObj
 */
function removeFoundWorkflows(batchObj) {
    var expWorkflows = [];
    batchObj['expWorkflows'].map(function (expWorkflow) {
        if (!lodash_1.includes(batchObj['foundWorkflows'], expWorkflow.name)) {
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
var fillInSparseData = function (batches) {
    return new Promise(function (resolve, reject) {
        try {
            batches = fillInCtrlBatches(batches);
        }
        catch (error) {
            reject(new Error("Error filling in ctrl batches: " + error));
        }
        try {
            batches = fillInScreenMoniker(batches);
        }
        catch (error) {
            reject(new Error("Error filling in screen monikers: " + error));
        }
        try {
            batches = fillInDates(batches);
        }
        catch (error) {
            reject(new Error("Error filling in dates: " + error));
        }
        try {
            batches = fillInTemperatures(batches);
        }
        catch (error) {
            reject(new Error("Error filling in temperatures: " + error));
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
var sanityChecks = function (batches) {
    //TODO Return errors
    var batchObj = { batches: batches, errors: {}, hasErrors: false };
    batchObj = sanityChecksInitializeErrors(batchObj);
    batchObj = sanityChecksAreDatesValid(batchObj);
    batchObj = sanityChecksDoControlBatchesExist(batchObj);
    return new Promise(function (resolve, reject) {
        sanityCheckDoScreenMonikersExistPlateSearchConfiguration(batchObj)
            .then(function (batchObj) {
            return sanityCheckEnsureStockPlateExists(batchObj);
        })
            .then(function (batchObj) {
            resolve(batchObj);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
var sanityChecksInitializeErrors = function (batchObj) {
    var batches = batchObj['batches'];
    Object.keys(batches).map(function (batchKey) {
        var batch = batches[batchKey];
        batch.map(function (row) {
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
var sanityChecksAreDatesValid = function (batchObj) {
    var batches = batchObj['batches'];
    var foundDateError = false;
    //TODO Permissive/Restrictive should be based on the screenMonikers
    // 'RestrictiveStartImageDate',
    //   'RestrictiveEndImageDate', 'PermissiveStartImageDate', 'PermissiveEndImageDate'];
    Object.keys(batches).map(function (batchKey) {
        var batch = batches[batchKey];
        batch.map(function (row) {
            var dateKeys = ['AssayDate', 'CultureDate', 'IPTG_InductionDate'];
            row['ScreenMonikerList'].map(function (screenMoniker) {
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
            dateKeys.map(function (dateKey) {
                if (row[dateKey] && !moment(row[dateKey]).isValid()) {
                    row['errors'].push("DateType: " + dateKey + " is not a valid date.");
                    foundDateError = true;
                    batchObj['hasErrors'] = true;
                    lodash_1.set(batchObj, ['errors', 'DateError'], true);
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
var sanityChecksDoControlBatchesExist = function (batchObj) {
    var batches = batchObj['batches'];
    var ctrlSets = ['CtrlNullSet', 'CtrlStrainSet', 'CtrlRNAiSet'];
    Object.keys(batches).map(function (batchKey) {
        var batch = batches[batchKey];
        batch.map(function (row) {
            ctrlSets.map(function (ctrlSet) {
                var ctrlSetBatchKey = row[ctrlSet];
                if (!lodash_1.get(batches, ctrlSetBatchKey)) {
                    row['errors'].push("CtrlSet " + ctrlSet + " has an invalid batch key identifier. " + ctrlSetBatchKey + " is not valid");
                    batchObj['hasErrors'] = true;
                    lodash_1.set(batchObj, ['errors', 'CtrlSetKeyError'], true);
                }
            });
        });
    });
    return batchObj;
};
var sanityCheckDoScreenMonikersExistPlateSearchConfiguration = function (batchObj) {
    var batches = batchObj['batches'];
    var screenMonikers = [];
    Object.keys(batches).map(function (batchKey) {
        var batch = batches[batchKey];
        batch.map(function (row) {
            var t = row['ScreenMonikerList'];
            t.map(function (tt) {
                screenMonikers.push(tt);
            });
        });
    });
    screenMonikers = lodash_1.uniq(screenMonikers);
    return new Promise(function (resolve, reject) {
        app.models.PlateSearchConfiguration
            .find({ where: { screenMoniker: { inq: screenMonikers } }, fields: { screenMoniker: true } })
            .then(function (plateSearchConfigs) {
            var foundMonikers = plateSearchConfigs.map(function (plateSearchConfig) {
                return plateSearchConfig.screenMoniker;
            });
            screenMonikers.map(function (screenMoniker) {
                if (!lodash_1.includes(foundMonikers, screenMoniker)) {
                    app.winston.info("ScreenMoniker: " + screenMoniker + " not found!");
                    batches = addScreenMonikersError(batches, screenMoniker);
                    lodash_1.set(batchObj, 'hasErrors', true);
                    lodash_1.set(batchObj, ['errors', 'ScreenMonikerError'], true);
                }
            });
            resolve(batchObj);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
var addScreenMonikersError = function (batches, screenMoniker) {
    Object.keys(batches).map(function (batchKey) {
        var batch = batches[batchKey];
        batch.map(function (row) {
            if (lodash_1.includes(row['ScreenMonikerList'], screenMoniker)) {
                row['errors'].push("ScreenMoniker: " + screenMoniker + " is not a valid Screen Moniker. Please ensure that there are no typos and that the screen moniker exists in the PlateSearchConfiguration collection.");
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
var sanityCheckEnsureStockPlateExists = function (batchObj) {
    var batches = batchObj['batches'];
    var stockPlates = [];
    Object.keys(batches).map(function (batchKey) {
        var batch = batches[batchKey];
        batch.map(function (row) {
            if (row['Chromosome']) {
                var stockPlate = row['Chromosome'] + "-" + row['Plate384'] + "-" + row['SectorID'];
                stockPlates.push(stockPlate);
                row['StockPlate'] = stockPlate;
            }
        });
    });
    stockPlates = lodash_1.uniq(stockPlates);
    return new Promise(function (resolve, reject) {
        Promise.map(stockPlates, function (stockPlate) {
            return app.models.RnaiLibrary
                .findOne({ where: { stockPlate: stockPlate }, fields: { stockPlate: true } })
                .then(function (results) {
                if (!results) {
                    batches = addStockPlateNotFoundError(batches, stockPlate);
                    batchObj['hasErrors'] = true;
                    lodash_1.set(batchObj, ['errors', 'StockPlateError'], true);
                    //ToDO Add Error
                }
                return;
            })
                .catch(function (error) {
                return new Error(error);
            });
        })
            .then(function () {
            resolve(batchObj);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
var addStockPlateNotFoundError = function (batches, stockPlate) {
    Object.keys(batches).map(function (batchKey) {
        var batch = batches[batchKey];
        batch.map(function (row) {
            if (lodash_1.isEqual(row['StockPlate'], stockPlate)) {
                row['errors'].push("Stock Plate: " + stockPlate + " is not a valid stock plate");
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
var fillInCtrlBatches = function (batches) {
    var ctrlSets = ['CtrlNullSet', 'CtrlStrainSet', 'CtrlRNAiSet'];
    Object.keys(batches).map(function (batchName) {
        var firstRow = batches[batchName][0];
        batches[batchName].map(function (row) {
            ctrlSets.map(function (ctrlSet) {
                if (lodash_1.isUndefined(row[ctrlSet]) || lodash_1.isNull(row[ctrlSet])) {
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
var fillInScreenMoniker = function (batches) {
    var splits = [" ", ","];
    Object.keys(batches).map(function (batchKey) {
        var screenMoniker = batches[batchKey][0]['ScreenMoniker'];
        if (!screenMoniker) {
            throw new Error("No screen moniker for " + batchKey);
        }
        else {
            var screenMonikerList_1 = [];
            splits.map(function (split) {
                screenMoniker.split(split).map(function (t) {
                    if (!lodash_1.isEqual(t, screenMoniker)) {
                        screenMonikerList_1.push(lodash_1.trim(t));
                    }
                });
            });
            screenMonikerList_1 = lodash_1.uniq(screenMonikerList_1);
            batches[batchKey].map(function (row) {
                row['ScreenMonikerList'] = screenMonikerList_1;
                row['ScreenMoniker'] = screenMoniker;
            });
        }
    });
    return batches;
};
/**
 * Dates are sticky to the previous date, not the first date in the batch (unlike ctrl dates)
 * @param batches
 */
var fillInDates = function (batches) {
    var dateKeys = ['AssayDate', 'CultureDate', 'IPTG_InductionDate', 'RestrictiveStartImageDate',
        'RestrictiveEndImageDate', 'PermissiveStartImageDate', 'PermissiveEndImageDate'];
    Object.keys(batches).map(function (batchKey) {
        var firstRow = batches[batchKey][0];
        //Sometimes the date has a comment in it, which is nearly always replicated in the actual comment section
        //So for now I'm just getting rid of it.
        ['PermissiveEndImageDate', 'RestrictiveEndImageDate', 'PermissiveStartImageDate', 'RestrictiveStartImageDate'].map(function (dateKey) {
            var tDate = firstRow[dateKey];
            tDate = lodash_1.trim(tDate);
            batches[batchKey][0][dateKey] = tDate;
            if (tDate.match(/\w+/)) {
                // let date = tDate.match(/(\w+)-(\w+)-(\w+)/);
                // firstRow[dateKey] = `${date[1]}-${date[2]}-${date[3]}`;
                firstRow[dateKey] = moment(tDate, "DD-MMM-YYYY");
            }
            else {
                batches[batchKey][0][dateKey] = null;
            }
        });
        //Make sure all the dates have some sort of character in them
        //If someone just typed in a space it will get screwed up down the line
        Object.keys(batches).map(function (batchKey) {
            batches[batchKey].map(function (row) {
                dateKeys.map(function (dateKey) {
                    if (lodash_1.isEmpty(row[dateKey])) {
                        row[dateKey] = null;
                    }
                });
            });
        });
        //If the EndDate is not filled in its just the start date
        var pKey = 'PermissiveEndImageDate';
        var rKey = 'RestrictiveEndImageDate';
        if (lodash_1.isNull(firstRow[pKey]) || lodash_1.isUndefined(firstRow[pKey])) {
            firstRow[pKey] = firstRow['PermissiveStartImageDate'];
        }
        if (lodash_1.isNull(firstRow[rKey]) || lodash_1.isUndefined(firstRow[rKey])) {
            firstRow[rKey] = firstRow['RestrictiveStartImageDate'];
        }
        //Turn these into actual dates
        dateKeys.map(function (dateKey) {
            if (firstRow[dateKey]) {
                try {
                    firstRow[dateKey] = moment(firstRow[dateKey], 'DD-MMM-YYYY');
                    console.log();
                }
                catch (error) {
                    console.log(error);
                }
            }
        });
        batches[batchKey].map(function (row, index) {
            dateKeys.map(function (dateKey) {
                if (!row[dateKey]) {
                    try {
                        var lastRow = lodash_1.get(batches[batchKey], index - 1);
                        if (lastRow) {
                            row[dateKey] = moment(lastRow[dateKey], "DD-MMM-YYYY");
                        }
                    }
                    catch (error) {
                        console.log(error);
                        // throw new Error(error);
                    }
                }
            });
        });
    });
    return batches;
};
var fillInTemperatures = function (batches) {
    var temperatureKeys = ['PermissiveTemp', 'RestrictiveTemp'];
    Object.keys(batches).map(function (batchKey) {
        batches[batchKey].map(function (row, index) {
            temperatureKeys.map(function (temperatureKey) {
                if (row[temperatureKey]) {
                    row[temperatureKey] = lodash_1.trim(row[temperatureKey]);
                }
                //Sometimes they add a star in to indicate there can be more than 1 temperature
                if (row[temperatureKey] && row[temperatureKey].match('\\*')) {
                    var temp = row[temperatureKey];
                    row[temperatureKey] = temp.replace('*', '');
                    row[temperatureKey] = lodash_1.trim(row[temperatureKey]);
                }
                if (row[temperatureKey] || lodash_1.isEmpty(row[temperatureKey])) {
                    try {
                        var lastRow = lodash_1.get(batches[batchKey], index - 1);
                        if (lastRow) {
                            row[temperatureKey] = lastRow[temperatureKey];
                        }
                    }
                    catch (error) {
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
var generateImageDateSearch = function (batch, screenType) {
    var imageStart = batch[0][screenType + "StartImageDate"];
    var last = batch[batch.length - 1];
    var imageEnd = last[screenType + "EndImageDate"];
    var startDate = moment(imageStart).format('YYYY-MM-DD');
    var endDate = moment(imageEnd).format('YYYY-MM-DD');
    return { creationdate: { between: [startDate, endDate] } };
};
var searchBatches = function (batchObj) {
    var batches = batchObj['batches'];
    lodash_1.set(batchObj, ['errors', 'createWorkflowErrors'], []);
    lodash_1.set(batchObj, ['expWorkflows'], []);
    lodash_1.set(batchObj, ['foundWorkflows'], []);
    var ctrlNullBatchKeys = [];
    var ctrlStrainBatchKeys = [];
    var ctrlReagentBatchKeys = [];
    var treatReagentBatchKeys = [];
    var screenMonikers = [];
    Object.keys(batches).map(function (batchKey) {
        var batch = batches[batchKey];
        batch.map(function (row) {
            ctrlNullBatchKeys.push(row['CtrlNullSet']);
            ctrlStrainBatchKeys.push(row['CtrlStrainSet']);
            ctrlReagentBatchKeys.push(row['CtrlRNAiSet']);
            row['ScreenMonikerList'].map(function (sm) {
                screenMonikers.push(sm);
            });
        });
        treatReagentBatchKeys.push(batchKey);
    });
    ctrlNullBatchKeys = lodash_1.uniq(ctrlNullBatchKeys);
    ctrlStrainBatchKeys = lodash_1.uniq(ctrlStrainBatchKeys);
    ctrlReagentBatchKeys = lodash_1.uniq(ctrlReagentBatchKeys);
    treatReagentBatchKeys = lodash_1.uniq(treatReagentBatchKeys);
    screenMonikers = lodash_1.uniq(screenMonikers);
    var blockKeys = {
        treatReagent: treatReagentBatchKeys,
        ctrlReagent: ctrlReagentBatchKeys,
        ctrlNull: ctrlNullBatchKeys,
        ctrlStrain: ctrlStrainBatchKeys,
    };
    var batchedPlateData = {};
    return new Promise(function (resolve, reject) {
        app.models.PlateSearchConfiguration
            .find()
            .then(function (plateSearchConfigurations) {
            return Promise.map(Object.keys(blockKeys), function (block) {
                //this loop searches the ctrlBatches
                return Promise.map(blockKeys[block], function (ctrlBatchKey) {
                    if (!lodash_1.get(batches, ctrlBatchKey)) {
                        batchObj['errors']['createWorkflowErrors'].push("No batch found for " + ctrlBatchKey + ". There is probably a typo somewhere");
                        return new Error("No batch found for " + ctrlBatchKey + ". There is probably a typo somewhere");
                    }
                    else {
                        var ctrlBatch_1 = batches[ctrlBatchKey];
                        //Get the barcode search pattern from the configuration
                        //These should be fairly standardized, but sometimes there is a custom search for the batch
                        //There is often a custom search when there is some form of error
                        //The microscope didn't cooperate, there were typos in the barcode, etc
                        return Promise.map(ctrlBatch_1[0]['ScreenMonikerList'], function (screenMoniker) {
                            //Check to ensure there is a barcode search configuration for this screenMoniker
                            if (!lodash_1.find(plateSearchConfigurations, { screenMoniker: screenMoniker })) {
                                batchObj['errors']['createWorkflowErrors'].push("No barcode search configuration found for ScreenMoniker: " + screenMoniker + ". Please ensure ScreenMoniker is typed EXACTLY as it is in the metadata form.");
                                batchObj['errors']['hasErrors'] = true;
                                return new Error("No barcode search configuration found for ScreenMoniker: " + screenMoniker + ". Please ensure ScreenMoniker is typed EXACTLY as it is in the metadata form.");
                            }
                            else {
                                var tsearch = lodash_1.cloneDeep(lodash_1.find(plateSearchConfigurations, { screenMoniker: screenMoniker }));
                                var barcodeSearches = tsearch['barcodeSearches'];
                                var search = barcodeSearches[block + "BarcodePattern"];
                                search.and.push(generateImageDateSearch(ctrlBatch_1, tsearch.screenType));
                                return searchPlates(screenMoniker, tsearch.screenType, ctrlBatchKey, block, search)
                                    .then(function (plates) {
                                    lodash_1.merge(batchedPlateData, plates);
                                    return;
                                })
                                    .catch(function (error) {
                                    //We don't want to just throw errors, but instead catch them
                                    //So we can return them to the users
                                    batchObj['errors']['hasErrors'] = true;
                                    batchObj['errors']['createWorkflowErrors'].push(error);
                                    return;
                                });
                            }
                        });
                    }
                });
            })
                .then(function () {
                app.winston.info('Creating expWorkflows from batched plate data');
                var expWorkflows = separateBatchedPlateDataIntoExpWorkflows(batches, batchedPlateData, plateSearchConfigurations);
                //TODO the updateExpWorkflowNames is just a cleanup
                //It will get removed at some point
                return updateExpWorkflowNames(expWorkflows)
                    .then(function () {
                    return findProcessedWorkflows(expWorkflows);
                })
                    .then(function (foundWorkflowNames) {
                    app.winston.info("These batches were already processed: " + foundWorkflowNames);
                    var t = { expWorkflows: expWorkflows, foundWorkflows: foundWorkflowNames };
                    batchObj['expWorkflows'].push(t['expWorkflows']);
                    batchObj['foundWorkflows'].push(foundWorkflowNames);
                    return t;
                });
            })
                .then(function () {
                return;
            })
                .catch(function (error) {
                app.winston.info("Found errors " + error);
                batchObj['errors']['hasErrors'] = true;
                batchObj['errors']['createWorkflowErrors'].push(error);
                resolve(batchObj);
            });
        })
            .then(function () {
            app.winston.info("Should be attaching batchedPlateData to batchObj");
            batchObj['expWorkflows'] = lodash_1.flattenDeep(batchObj['expWorkflows']);
            batchObj['foundWorkflows'] = lodash_1.flattenDeep(batchObj['foundWorkflows']);
            batchObj = removeFoundWorkflows(batchObj);
            //For now I am keeping the foundWorkflows, but they should really be deleted to save space
            resolve(batchObj);
        })
            .catch(function (error) {
            app.winston.error(error);
            batchObj['errors']['hasErrors'] = true;
            batchObj['errors']['createWorkflowErrors'].push(error);
            resolve(batchObj);
        });
    });
};
var findProcessedWorkflows = function (expWorkflows) {
    var where = {
        or: expWorkflows.map(function (expWorkflow) {
            return { name: expWorkflow['name'] };
        }),
    };
    return new Promise(function (resolve, reject) {
        app.models.ExpScreenUploadWorkflow
            .find({ where: where, fields: { name: true } })
            .then(function (results) {
            var names = results.map(function (r) {
                return r.name;
            });
            names = lodash_1.uniq(names);
            resolve(names);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * This is a (hopefully) one time update!
 * @param expWorkflows
 */
var updateExpWorkflowNames = function (expWorkflows) {
    return new Promise(function (resolve, reject) {
        app.models.ExpScreenUploadWorkflow
            .find({
            where: {
                or: expWorkflows.map(function (expWorkflow) {
                    return { name: new RegExp(expWorkflow['tmpSearchForThisName']) };
                }),
            },
        })
            .then(function (results) {
            return Promise.map(results, function (expWorkflow) {
                var tExpWorkflow = lodash_1.find(expWorkflows, function (newExpWorkflow) {
                    return expWorkflow.name.match(newExpWorkflow['tmpSearchForThisName']);
                });
                expWorkflow.name = tExpWorkflow.name;
                expWorkflow['assayDates'] = tExpWorkflow.assayDates;
                expWorkflow['stockPrepDate'] = tExpWorkflow.stockPrepDate;
                expWorkflow['cultureDate'] = tExpWorkflow['cultureDate'];
                return app.models.ExpScreenUploadWorkflow
                    .upsert(expWorkflow)
                    .then(function (r) {
                    return;
                })
                    .catch(function (error) {
                    return new Error(error);
                });
            });
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
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
var separateBatchedPlateDataIntoExpWorkflows = function (batches, batchedPlateData, plateSearchConfigurations) {
    var expWorkflows = [];
    var plateModelMapping = {
        ctrlNull: 'ctrl_null_plates',
        treatReagent: 'treat_rnai_plates',
        ctrlStrain: 'ctrl_strain_plates',
        ctrlReagent: 'ctrl_rnai_plates',
    };
    Object.keys(batches).map(function (treatReagentBatchKey) {
        var treatReagentBatch = batches[treatReagentBatchKey];
        treatReagentBatch.map(function (row) {
            var ctrlReagentBatchKey = row['CtrlRNAiSet'];
            var ctrlStrainBatchKey = row['CtrlStrainSet'];
            var ctrlNullBatchKey = row['CtrlNullSet'];
            var screenMonikers = row['ScreenMonikerList'];
            var batchNames = {
                ctrlNull: ctrlNullBatchKey,
                ctrlStrain: ctrlStrainBatchKey,
                ctrlReagent: ctrlReagentBatchKey,
                treatReagent: treatReagentBatchKey,
            };
            screenMonikers.map(function (screenMoniker) {
                if (!lodash_1.find(plateSearchConfigurations, { screenMoniker: screenMoniker })) {
                    console.log("there is no plate configuration for screenMoniker: " + screenMoniker);
                }
                else {
                    var plateConfiguration = lodash_1.find(plateSearchConfigurations, { screenMoniker: screenMoniker });
                    var screenType_1 = plateConfiguration['screenType'];
                    var temperature = row[screenType_1 + "Temp"];
                    var expBiosampleName = lodash_1.get(plateConfiguration, ['biosamples', 'experimentBiosample', 'name']);
                    var controlBiosampleName = lodash_1.get(plateConfiguration, ['biosamples', 'ctrlBiosample', 'name']);
                    var notFound_1 = false;
                    ['AssayDate', 'Chromosome', 'Plate384', 'SectorID'].map(function (key) {
                        if (!lodash_1.get(row, key)) {
                            //TODO Add to errors
                            notFound_1 = true;
                            // errors.push(`${key} not found for ${screenMoniker} ${treatReagentBatchKey}`);
                        }
                    });
                    if (lodash_1.isEqual(notFound_1, false)) {
                        var assayDate = moment(row['AssayDate']).format('YYYY-MM-DD');
                        var chrom_1 = row['Chromosome'];
                        var plate_1 = row['Plate384'];
                        var quadrant_1 = row['SectorID'];
                        var screenCode = 'E';
                        if (lodash_1.isEqual(screenType_1, 'Restrictive')) {
                            screenCode = 'S';
                        }
                        var batchName = "AD RNAi AHR " + assayDate + " " + expBiosampleName + " " + controlBiosampleName + " " + temperature + " " + screenCode + " Chr " + chrom_1 + " " + plate_1 + " " + quadrant_1;
                        var searchForThisName = expBiosampleName + " " + controlBiosampleName + " " + temperature + " " + screenCode + " Chr " + chrom_1 + " " + plate_1 + " " + quadrant_1;
                        var plateModel_1 = {};
                        var expDataModel = {
                            assayDates: [moment(row['AssayDate'])],
                            name: batchName, comment: row['Comments'],
                            expScreen: {
                                screenId: plateConfiguration['screenId'], screenName: plateConfiguration['screenName'],
                                screenType: plateConfiguration['screenType']
                            },
                            library: { libraryId: 1 },
                            temperature: temperature,
                        };
                        var expBiosampleModel = {
                            expBiosample: {
                                biosampleId: lodash_1.get(plateConfiguration, ['biosamples', 'experimentBiosample', 'id']),
                                biosampleName: lodash_1.get(plateConfiguration, ['biosamples', 'experimentBiosample', 'name']),
                            },
                            ctrlBiosample: {
                                biosampleId: lodash_1.get(plateConfiguration, ['biosamples', 'ctrlBiosample', 'id']),
                                biosampleName: lodash_1.get(plateConfiguration, ['biosamples', 'ctrlBiosample', 'name']),
                            },
                        };
                        ['treatReagent', 'ctrlReagent', 'ctrlNull', 'ctrlStrain'].map(function (setType) {
                            var batchKey = batchNames[setType];
                            var thisSetKeyAllBatches = lodash_1.get(batchedPlateData, [batchKey, screenType_1]);
                            var thisSetKeyPlates = null;
                            //Preferentially get ctrl batches with the same moniker
                            if (lodash_1.get(thisSetKeyAllBatches, [screenMoniker, setType])) {
                                thisSetKeyPlates = lodash_1.get(thisSetKeyAllBatches, [screenMoniker, setType]);
                            }
                            else if (lodash_1.isEqual(Object.keys(thisSetKeyAllBatches).length, 1)) {
                                var matchedScreenMoniker = Object.keys(thisSetKeyAllBatches)[0];
                                thisSetKeyPlates = lodash_1.get(thisSetKeyAllBatches, [matchedScreenMoniker, setType]);
                            }
                            else {
                                // errors.push('WTF');
                                console.log('Unknown error');
                            }
                            var matchedPlates = [];
                            if (setType.match('Reagent')) {
                                matchedPlates = thisSetKeyPlates.filter(function (plateObj) {
                                    return plateObj.name.match(chrom_1 + "." + plate_1 + quadrant_1);
                                });
                            }
                            else {
                                matchedPlates = thisSetKeyPlates;
                            }
                            matchedPlates = lodash_1.orderBy(matchedPlates, 'csPlateid');
                            var plateModelKey = lodash_1.get(plateModelMapping, setType);
                            lodash_1.set(plateModel_1, [plateModelKey], matchedPlates);
                        });
                        splitIntoReplicates(plateModel_1);
                        //Stupid import IS STUPID
                        var expWorkflow = setDefaults(plateModel_1, expDataModel, expBiosampleModel);
                        lodash_1.set(expWorkflow, ['assayDates'], [moment(row['AssayDate']).toISOString()]);
                        lodash_1.set(expWorkflow, ['stockPrepDate'], moment(row['CultureDate'].toISOString()));
                        lodash_1.set(expWorkflow, ['cultureDate'], moment(row['CultureDate'].toISOString()));
                        lodash_1.set(expWorkflow, ['search', 'rnaiLibrary', 'plate'], plate_1);
                        lodash_1.set(expWorkflow, ['search', 'rnaiLibrary', 'quadrant'], quadrant_1);
                        lodash_1.set(expWorkflow, ['search', 'rnaiLibrary', 'chrom'], chrom_1);
                        //I was a dummy and somehow have the date in there as the date it was uploaded instead of the assaydate
                        //So I am a dummy
                        //I am great big dummy
                        //Dummy dummy dummy
                        lodash_1.set(expWorkflow, ['tmpSearchForThisName'], searchForThisName);
                        expWorkflows.push(expWorkflow);
                    }
                }
            });
        });
    });
    return expWorkflows;
};
var searchPlates = function (screenMoniker, screenType, plateSearchKey, block, search) {
    return new Promise(function (resolve, reject) {
        var r = {};
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
            .then(function (plates) {
            //TODO Create global error object and stick this here
            var r = {};
            if (!plates.length) {
                console.log("There were no plates for " + screenMoniker + " " + block + " " + plateSearchKey);
            }
            plates.map(function (plate) {
                plate['instrumentPlateId'] = plate.csPlateid;
            });
            lodash_1.set(r, [plateSearchKey, screenType, screenMoniker, block], plates);
            resolve(r);
        })
            .catch(function (error) {
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
var splitIntoReplicates = function (plateModel) {
    plateModel['replicates'] = {};
    plateModel.treat_rnai_plates.map(function (plate, index) {
        pushReplicate(plateModel, plate, index);
    });
    plateModel.ctrl_rnai_plates.map(function (plate, index) {
        pushReplicate(plateModel, plate, index);
    });
    // Sometimes there is 1 L4440 per replicate, and sometimes 2
    // If its two we want the first half in the R1 replicates, and the second in the R2
    // Chunk each l4440 plate array into bins size of l4440_index
    var chunkSize = Math.ceil(plateModel.ctrl_strain_plates.length / plateModel.treat_rnai_plates.length);
    var chunked_treat_l4440 = lodash_1.chunk(plateModel.ctrl_strain_plates, chunkSize);
    var chunked_null_l4440 = lodash_1.chunk(plateModel.ctrl_null_plates, chunkSize);
    chunked_treat_l4440.map(function (chunk, index) {
        chunk.map(function (plate) {
            pushReplicate(plateModel, plate, index);
        });
    });
    chunked_null_l4440.map(function (chunk, index) {
        chunk.map(function (plate) {
            pushReplicate(plateModel, plate, index);
        });
    });
};
var pushReplicate = function (plateModel, plate, index) {
    if (!plateModel.replicates.hasOwnProperty(index + 1)) {
        plateModel.replicates[index + 1] = [];
    }
    plateModel.replicates[index + 1].push(plate.csPlateid);
};
function setDefaults(plateModel, expDataModel, expBiosampleModel) {
    var model = new models_1.ExpScreenUploadWorkflowResultSet();
    // These are just general model things
    model.name = expDataModel.name;
    model.comment = expDataModel.comment;
    model.screenId = expDataModel.expScreen.screenId;
    model.screenName = expDataModel.expScreen.screenName;
    model.screenType = expDataModel.expScreen.screenType;
    model.libraryId = expDataModel.library.libraryId;
    var biosamples = {
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
    expDataModel.assayDates.map(function (date) {
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
function validateWorkflowData(model, errorMessages) {
    if (lodash_1.isEmpty(model.name)) {
        errorMessages.push('You must enter a screen name!');
    }
    if (lodash_1.isEmpty(model.temperature)) {
        errorMessages.push('You must enter a temperature!');
    }
    if (lodash_1.isNull(model.screenId)) {
        errorMessages.push('You must choose a screen!');
    }
    if (lodash_1.isNull(model.libraryId)) {
        errorMessages.push('You must choose a library!');
    }
    if (lodash_1.isEmpty(model.experimentGroups.treat_rnai.plates)) {
        errorMessages.push('There must be one or more Mutant + RNAi plates!');
    }
    if (lodash_1.isEmpty(model.experimentGroups.ctrl_rnai.plates)) {
        errorMessages.push('There must be one or more N2 + RNAi plates!');
    }
    return errorMessages;
}
//# sourceMappingURL=ExpScreenUploadWorkflow.js.map