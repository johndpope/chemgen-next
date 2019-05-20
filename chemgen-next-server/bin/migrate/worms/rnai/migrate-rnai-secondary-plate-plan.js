"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var app = require("../../../../server/server");
var lodash_1 = require("lodash");
var jsonfile = require('jsonfile');
var path = require('path');
var rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
var cols = ['01', '02', '03', '04', '05',
    '06', '07', '08', '09', '10', '11', '12'
];
var wells96 = [];
rows.map(function (row) {
    cols.map(function (col) {
        wells96.push(row + col);
    });
});
var getParentLibrary = function (workflowData) {
    console.log('in parent library!');
    return new Promise(function (resolve, reject) {
        parseCustomPlate(workflowData)
            .then(function (results) {
            return parseRows(workflowData, results);
        })
            .then(function (results) {
            return migrateToNewFormat(results);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            console.log(JSON.stringify(error));
            reject(new Error(error));
        });
    });
};
var findOtherGeneNames = function (taxTerm) {
    return new Promise(function (resolve, reject) {
        if (taxTerm) {
            app.models.RnaiWormbaseXrefs.findOne({
                where: { wbGeneSequenceId: taxTerm }
            })
                .then(function (results) {
                resolve(results);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
        else {
            resolve({});
        }
    });
};
var migrateToNewFormat = function (wellData) {
    var workflowData = {};
    return new Promise(function (resolve, reject) {
        wells96.map(function (well) {
            workflowData[well] = {};
            workflowData[well].isValid = true;
            workflowData[well].well = well;
            if (!lodash_1.isEmpty(well)) {
                try {
                    var wellRow = lodash_1.find(wellData, function (wellRow) {
                        if (!lodash_1.isEmpty(wellRow)) {
                            return lodash_1.isEqual(wellRow.well, well);
                        }
                        else {
                            return false;
                        }
                    });
                    if (wellRow) {
                        workflowData[well].taxTerm = wellRow.geneName;
                        workflowData[well].geneName = wellRow.geneName;
                        workflowData[well].lookUp = wellRow.lookUp;
                    }
                    if (wellRow && lodash_1.get(wellRow, 'rnaiId')) {
                        var parentLibrary = addToWorkflowData(workflowData, wellRow);
                        workflowData[well].parentLibrary = parentLibrary;
                    }
                    if (wellRow && lodash_1.get(wellRow, ['geneData', 'wbGeneSequenceId'])) {
                        workflowData[well].geneData = wellRow.geneData;
                    }
                    else {
                        workflowData[well].geneData = {};
                    }
                }
                catch (error) {
                    console.log("Received error " + error);
                    throw (new Error(error));
                }
            }
        });
        resolve(workflowData);
    });
};
var addToWorkflowData = function (workflowData, wellRow) {
    var parentLibrary = {};
    try {
        parentLibrary.rnaiId = wellRow.rnaiId;
        parentLibrary.libraryId = wellRow.libraryId;
        parentLibrary.rnaiType = wellRow.rnaiType;
        parentLibrary.plate = wellRow.plate;
        parentLibrary.well = wellRow.well;
        parentLibrary.chrom = wellRow.chrom;
        parentLibrary.geneName = wellRow.geneName;
        parentLibrary.fwdPrimer = wellRow.fwdPrimer;
        parentLibrary.revPrimer = wellRow.revPrimer;
        parentLibrary.bioloc = wellRow.bioloc;
        parentLibrary.stocktitle = wellRow.stocktitle;
        parentLibrary.stockloc = wellRow.stockloc;
    }
    catch (error) {
        console.log("Received error " + error);
        throw (new Error(error));
    }
    return parentLibrary;
};
var buildRnaiLibraryWhere = function (lookUp) {
    var where = {};
    var chrom = lookUp[0];
    var plateNo = lookUp[1];
    var well = '';
    // The well listed is from the parent library - not the stock
    if (lookUp.length === 3) {
        well = lookUp[2];
        var bioLoc = chrom + '-' + plateNo + well;
        where = {
            bioloc: bioLoc,
        };
        // The well is from the stock - it has a quadrant
    }
    else if (lookUp.length === 4) {
        var quad = lookUp[2];
        well = lookUp[3];
        where = {
            and: [{
                    stocktitle: chrom + '-' + plateNo + '--' + quad,
                },
                {
                    stockloc: quad + '-' + well,
                },
                {
                    well: well,
                },
                {
                    libraryId: 1,
                }
            ],
        };
    }
    else {
        return;
    }
    return where;
};
var parseWell = function (workflowData, wellData) {
    // let lookUpIndex = workflowData.expSetSearch.library.rnai.ahringer.lookUpIndex;
    // let commentIndex = workflowData.expSetSearch.library.rnai.ahringer.commentIndex;
    var lookUpIndex = 0;
    var commentIndex = 1;
    if (lodash_1.isEqual(wellData.splitLookUp.length, 1)) {
        lookUpIndex = 0;
    }
    else if (wellData.splitLookUp[0].split('-').length > 2) {
        lookUpIndex = 0;
        commentIndex = 1;
    }
    else {
        lookUpIndex = 1;
        commentIndex = 0;
    }
    return new Promise(function (resolve, reject) {
        var obj = {
            wellData: wellData,
        };
        // If its a control just return right here
        if (wellData.splitLookUp[0].match('L4440')) {
            obj.geneName = 'L4440';
            obj.lookUp = 'L4440';
            obj.well = wellData.assayWell;
            resolve(obj);
        }
        else {
            var data_1, comment_1;
            data_1 = wellData.splitLookUp[lookUpIndex];
            comment_1 = wellData.splitLookUp[commentIndex];
            var lookUp = data_1.split('-');
            var where = buildRnaiLibraryWhere(lookUp);
            if (!where) {
                reject(new Error('Not able to find a corresponding library well!'));
            }
            else {
                app.models.RnaiLibrary.findOne({
                    where: where,
                })
                    .then(function (results) {
                    if (!results || lodash_1.isEmpty(results)) {
                        resolve();
                    }
                    else {
                        results.wellData = wellData;
                        results.origWell = results.well;
                        results.well = wellData.assayWell;
                        results.comment = comment_1;
                        results.lookUp = data_1;
                        return findOtherGeneNames(results.geneName)
                            .then(function (otherTaxTerms) {
                            results.geneData = otherTaxTerms;
                            resolve(results);
                        });
                    }
                })
                    .catch(function (error) {
                    console.log("Received error " + error);
                    reject(new Error(error.stack));
                });
            }
        }
    });
};
var parseRows = function (workflowData, lists) {
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        Promise.map(lists, function (wellData) {
            return parseWell(workflowData, wellData);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
// This parses the custom Plate
// That exists as a json file the library data directory
// This is Ahringer Library Specific
var parseCustomPlate = function (workflowData) {
    var wellData = workflowData.data.library.wellData;
    var rows = app.etlWorkflow.helpers.rows;
    var list = [];
    return new Promise(function (resolve, reject) {
        rows.map(function (row) {
            var obj = wellData[row];
            for (var key in obj) {
                var dataObj = {};
                var lookUp = obj[key];
                var newKey = ('00' + key)
                    .slice(-2);
                if (lookUp) {
                    var splitLookUp = void 0;
                    try {
                        splitLookUp = lookUp.split('\n');
                        dataObj['splitLookUp'] = splitLookUp;
                        dataObj['row'] = row;
                        dataObj['origKey'] = key;
                        dataObj['assayWell'] = row + newKey;
                        list.push(dataObj);
                    }
                    catch (error) {
                        reject(new Error(error));
                    }
                }
            }
        });
        resolve(list);
    });
};
module.exports.getParentLibrary = getParentLibrary;
//# sourceMappingURL=migrate-rnai-secondary-plate-plan.js.map