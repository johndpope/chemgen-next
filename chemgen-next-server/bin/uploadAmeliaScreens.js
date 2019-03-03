#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../server/server');
// import {WorkflowModel} from "../../common/models";
var Promise = require("bluebird");
var appendFile = Promise.promisify(require("fs").appendFile);
var deepcopy = require("deepcopy");
var lodash_1 = require("lodash");
var Moment = require("moment");
var moment_range_1 = require("moment-range");
var Papa = require('papaparse');
var fs = require('fs');
var moment = moment_range_1.extendMoment(Moment);
var jsonfile = require('jsonfile');
var minimal = jsonfile.readFileSync('/Users/jillian/Dropbox/projects/NY/chemgen-next-all/chemgen-next-server/bin/migrate/worms/rnai/data/primary/minimal_primary.json');
var controlBiosampleId = 4;
var controlBiosampleName = 'N2';
var expBiosampleId = 7;
var expBiosampleName = 'lgl-1';
var temperature = 20;
var screenName = 'lgl-1 Primary RNAi Permissive Screen';
var screenNameCode = 'amelia-crb-primary-permissive';
var screenId = 12;
var screenType = 'Permissive';
var barcodeMutant = 'am';
/**
 * Screen Data
 */
// const screenName = 'Victoria crb Primary Permissive Screen';
//TODO Separate out barcode schemas as well
var quadRange = ['A1', 'A2', 'B1', 'B2'];
var seenChr = {};
var batchConfigs = [
    {
        chr: 'I',
        temperature: 20,
        quadRange: quadRange,
        dateRanges: [
            {
                start: moment('2018-11-01', 'YYYY-MM-DD'),
                end: moment('2018-12-30', 'YYYY-MM-DD'),
            },
            {
                start: moment('2017-12-10', 'YYYY-MM-DD'),
                end: moment('2017-12-30', 'YYYY-MM-DD'),
            },
            {
                start: moment('2018-01-10', 'YYYY-MM-DD'),
                end: moment('2018-01-30', 'YYYY-MM-DD'),
            },
        ],
        platesRange: lodash_1.range(1, 6),
    },
    {
        chr: 'I',
        temperature: 20,
        quadRange: quadRange,
        dateRanges: [
            {
                start: moment('2018-11-01', 'YYYY-MM-DD'),
                end: moment('2018-12-30', 'YYYY-MM-DD'),
            },
            {
                start: moment('2017-12-10', 'YYYY-MM-DD'),
                end: moment('2017-12-30', 'YYYY-MM-DD'),
            },
            {
                start: moment('2018-01-10', 'YYYY-MM-DD'),
                end: moment('2018-01-30', 'YYYY-MM-DD'),
            },
        ],
        platesRange: lodash_1.range(7, 11),
    },
    {
        //The 6A1 is different and doesn't need 2017 plates
        chr: 'I',
        temperature: 20,
        quadRange: ['A1'],
        dateRanges: [
            {
                start: moment('2018-11-01', 'YYYY-MM-DD'),
                end: moment('2018-12-30', 'YYYY-MM-DD'),
            },
            {
                start: moment('2018-01-10', 'YYYY-MM-DD'),
                end: moment('2018-01-30', 'YYYY-MM-DD'),
            },
        ],
        platesRange: [6],
    },
    {
        //The 6A1 is different and doesn't need 2017 plates
        chr: 'I',
        temperature: 20,
        quadRange: ['A2', 'B1', 'B2'],
        dateRanges: [
            {
                start: moment('2018-11-01', 'YYYY-MM-DD'),
                end: moment('2018-12-30', 'YYYY-MM-DD'),
            },
            {
                start: moment('2017-12-10', 'YYYY-MM-DD'),
                end: moment('2017-12-30', 'YYYY-MM-DD'),
            },
            {
                start: moment('2018-01-10', 'YYYY-MM-DD'),
                end: moment('2018-01-30', 'YYYY-MM-DD'),
            },
        ],
        platesRange: [6],
    },
    {
        chr: 'II',
        temperature: 20,
        quadRange: quadRange,
        dateRanges: [
            {
                start: moment('2018-11-01', 'YYYY-MM-DD'),
                end: moment('2018-12-30', 'YYYY-MM-DD'),
            }
        ],
        platesRange: lodash_1.range(1, 12),
    },
    {
        chr: 'III',
        temperature: 20,
        quadRange: quadRange,
        dateRanges: [
            {
                start: moment('2018-11-01', 'YYYY-MM-DD'),
                end: moment('2018-12-30', 'YYYY-MM-DD'),
            }
        ],
        platesRange: lodash_1.range(1, 10),
    },
    {
        chr: 'IV',
        temperature: 20,
        quadRange: quadRange,
        dateRanges: [
            {
                start: moment('2018-11-01', 'YYYY-MM-DD'),
                end: moment('2018-12-30', 'YYYY-MM-DD'),
            }
        ],
        platesRange: lodash_1.range(1, 12),
    },
    {
        chr: 'V',
        temperature: 20,
        quadRange: quadRange,
        dateRanges: [
            {
                start: moment('2018-11-01', 'YYYY-MM-DD'),
                end: moment('2018-12-30', 'YYYY-MM-DD'),
            }
        ],
        platesRange: lodash_1.range(1, 17),
    },
    {
        chr: 'X',
        temperature: 20,
        quadRange: quadRange,
        dateRanges: [
            {
                start: moment('2018-11-01', 'YYYY-MM-DD'),
                end: moment('2018-12-30', 'YYYY-MM-DD'),
            }
        ],
        platesRange: lodash_1.range(1, 9),
    }
];
var emptySpreadsheet = function (batchConfigs) {
    return new Promise(function (resolve, reject) {
        Promise.map(batchConfigs, function (batchConfig) {
            fs.writeFile("/Users/jillian/Dropbox/projects/NY/chemgen-next-all/chemgen-next-data/" + screenNameCode + "-" + batchConfig.chr + ".csv", '', function (error) {
                if (error) {
                    app.winston.error(error);
                    return (new Error(error));
                }
                else {
                    return;
                }
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
var createDateSearchFromDateRanges = function (batchConfig) {
    var searchObj = {
        or: [],
    };
    //@ts-ignore
    searchObj.or = batchConfig.dateRanges.map(function (dateRange) {
        return { creationdate: { between: [dateRange.start, dateRange.end] } };
    });
    return searchObj;
};
batchConfigs.map(function (batchConfig) {
    createDateSearchFromDateRanges(batchConfig);
});
emptySpreadsheet(batchConfigs)
    .then(function () {
    return Promise.map(batchConfigs, function (batchConfig) {
        return getChromosomePlateMappings(batchConfig);
    }, { concurrency: 1 });
})
    .then(function () {
    app.winston.info('Done!');
    process.exit(0);
})
    .catch(function (error) {
    app.winston.error(error);
    process.exit(1);
});
var spreadsheet = [];
//TODO Refactor this to search per treatment type (treat_rnai, ctrl_rnai, ctrl_strain, ctrl_null)
function getChromosomePlateMappings(batchConfig) {
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        spreadsheet = [];
        Promise.map(batchConfig.platesRange, function (plateNo) {
            return Promise.map(batchConfig.quadRange, function (quad) {
                return app.models.Plate
                    .find({
                    where: {
                        and: [
                            createDateSearchFromDateRanges(batchConfig),
                            // {
                            //   name: {nlike: 'L4440E_M'}
                            // },
                            // {
                            //   name: {nlike: 'L4440E_D_M'}
                            // },
                            // {
                            //   name: {nlike: 'RNAi%_M'}
                            // },
                            // {
                            //   name: {nlike: 'RNAi%_D_M'}
                            // },
                            {
                                or: [
                                    {
                                        name: { like: "RNAi" + batchConfig.chr + "." + plateNo + quad + "%E%" }
                                    },
                                    {
                                        name: { like: "RNAi" + batchConfig.chr + "." + plateNo + quad + "%_am" }
                                    },
                                    {
                                        name: { like: "RNAi" + batchConfig.chr + "." + plateNo + quad + "%_am%" }
                                    },
                                    {
                                        name: { like: "RNAi" + batchConfig.chr + plateNo + quad + "%_am" }
                                    },
                                    {
                                        name: { like: "RNAi" + batchConfig.chr + "." + plateNo + quad + "%am%" }
                                    },
                                    {
                                        name: { like: "RNAi" + batchConfig.chr + "." + plateNo + quad + "%_am%" }
                                    },
                                    {
                                        name: { like: "RNAi" + batchConfig.chr + "." + plateNo + quad + "%_am%" }
                                    },
                                    {
                                        name: { like: 'L4440E%' }
                                    },
                                    {
                                        name: { like: "L4440_" + barcodeMutant + "%" }
                                    },
                                ]
                            }
                        ]
                    },
                    fields: {
                        csPlateid: true,
                        creationdate: true,
                        name: true,
                        imagepath: true,
                    }
                })
                    .then(function (results) {
                    app.winston.info("Success Writing: " + batchConfig.chr + " " + plateNo + " " + quad);
                    results = results.filter(function (result) {
                        return !result.name.match('_M');
                    });
                    results = lodash_1.orderBy(results, 'name');
                    results = customRemovePlates(results);
                    // results.map((result: PlateResultSet) => {
                    // app.winston.info(`Plate Barcode: ${result.name} ${result.creationdate}`);
                    // });
                    if (results.length) {
                        //@ts-ignore
                        spreadsheet.push({
                            ScreenName: screenName,
                            Chromosome: batchConfig.chr,
                            Plate: plateNo,
                            Quadrant: quad,
                            condition: '',
                            barcode: '',
                            imageDate: '',
                            csPlateid: '',
                        });
                        var buckets = bucketBarcodes(results, batchConfig.chr, plateNo, quad);
                        if (lodash_1.isArray(buckets.treat_rnai) && buckets.treat_rnai.length) {
                            return mapOldWorkflow(buckets, batchConfig.chr, plateNo, quad);
                        }
                        else {
                            return null;
                        }
                    }
                    else {
                        return null;
                    }
                })
                    .catch(function (error) {
                    app.winston.error(error);
                    return error;
                });
            }, { concurrency: 1 })
                //@ts-ignore
                .then(function (workflows) {
                workflows = lodash_1.compact(workflows);
                // return createWorkflows(workflows);
                return workflows;
            })
                .catch(function (error) {
                app.winston.error(error);
                return new Error(error);
            });
        }, { concurrency: 1 })
            //@ts-ignore
            .then(function (workflows) {
            //@ts-ignore
            return Promise.mapSeries(batchConfig.platesRange, function (plate) {
                //@ts-ignore
                return Promise.mapSeries(batchConfig.quadRange, function (quad) {
                    var data = spreadsheet.filter(function (row) {
                        return lodash_1.isEqual(row.Chromosome, batchConfig.chr) && lodash_1.isEqual(row.Plate, plate) && lodash_1.isEqual(row.Quadrant, quad);
                    });
                    var header = true;
                    //@ts-ignore
                    if (lodash_1.get(seenChr, batchConfig.chr)) {
                        header = false;
                    }
                    var csv = Papa.unparse(data, {
                        columns: ['ScreenName', 'Chromosome', 'Plate', 'Quadrant', 'condition', 'barcode', 'csPlateid', 'imageDate'],
                        header: header
                    });
                    csv = csv + "\n";
                    seenChr[batchConfig.chr] = true;
                    //@ts-ignore
                    return appendFile("/Users/jillian/Dropbox/projects/NY/chemgen-next-all/chemgen-next-data/" + screenNameCode + "-" + batchConfig.chr + ".csv", csv)
                        .then(function () {
                        app.winston.info("Success Writing: " + batchConfig.chr + " " + plate + " " + quad);
                        return;
                    })
                        .catch(function (error) {
                        app.winston.error(error);
                        app.winston.info("Error Writing: " + batchConfig.chr + " " + plate + " " + quad);
                        return new Error(error);
                    });
                }, { concurrency: 1 });
            }, { concurrency: 1 });
        })
            .then(function () {
            spreadsheet = [];
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function customRemovePlates(plates) {
    plates = plates.filter(function (plate) {
        return !plate.name.match('_M');
    });
    //These plates are actual plates, but not associated to this screen
    //https://cbi.abudhabi.nyu.edu/jira/browse/WDT-106
    var notThesePlateIds = [12074, 12150, 12075, 12151];
    plates = plates.filter(function (plate) {
        return !lodash_1.includes(notThesePlateIds, plate.csPlateid);
    });
    return plates;
}
function createWorkflows(workflows) {
    return new Promise(function (resolve, reject) {
        Promise.map(workflows, function (workflow) {
            return app.models.ExpScreenUploadWorkflow
                .findOrCreate({ where: { name: workflow.name } }, workflow)
                .then(function (results) {
                var tWorkflow = results[0];
                return app.models.ExpScreenUploadWorkflow.upsert(tWorkflow);
                // return results;
            })
                .then(function (results) {
                return results;
            })
                .catch(function (error) {
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function (results) {
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function bucketBarcodes(plates, chromosome, plateNo, quad) {
    var buckets = {
        //RNAi_vi
        treat_rnai: [],
        //RNAiE
        ctrl_rnai: [],
        //L4440_vi
        ctrl_strain: [],
        //L4440E
        ctrl_null: [],
    };
    plates.map(function (plate) {
        if (barcodeIsRNAiMutant(plate)) {
            buckets.treat_rnai.push(plate);
        }
        else if (barcodeIsRNAiN2(plate)) {
            buckets.ctrl_rnai.push(plate);
        }
        else if (barcodeIsL4440Mutant(plate)) {
            buckets.ctrl_strain.push(plate);
        }
        else if (barcodeIsL4440N2(plate)) {
            buckets.ctrl_null.push(plate);
        }
        else {
            throw new Error('plate does not match any buckets!');
        }
    });
    buckets = filterL4440Plates(buckets, ['treat_rnai', 'ctrl_strain']);
    buckets = filterL4440Plates(buckets, ['ctrl_rnai', 'ctrl_null']);
    addTreatmentGroupsToSpreadSheet(buckets, chromosome, plateNo, quad);
    return buckets;
}
function addTreatmentGroupsToSpreadSheet(buckets, chromosome, plateNo, quad) {
    ['treat_rnai', 'ctrl_strain', 'ctrl_rnai', 'ctrl_null'].map(function (treatmentGroup) {
        buckets[treatmentGroup].map(function (plate) {
            //@ts-ignore
            spreadsheet.push({
                condition: treatmentGroup,
                barcode: plate.name,
                imageDate: plate.creationdate,
                ScreenName: screenName,
                Chromosome: chromosome,
                Plate: plateNo,
                Quadrant: quad,
                csPlateid: plate.csPlateid,
            });
        });
    });
}
function filterL4440Plates(buckets, conditions) {
    var l4440Plates = buckets[conditions[1]].filter(function (plate) {
        return lodash_1.find(buckets[conditions[0]], function (tPlate) {
            //OMG I HATE COMPARING DATES
            return lodash_1.isEqual(tPlate.creationdate, plate.creationdate);
        });
    });
    lodash_1.range(1, 8).map(function (numberOfDaysToSearch) {
        if (!l4440Plates.length || l4440Plates.length < buckets[conditions[0]].length) {
            buckets[conditions[1]].filter(function (plate) {
                return lodash_1.find(buckets[conditions[0]], function (tPlate) {
                    var thisPlateDate = moment(tPlate.creationdate).format('YYYY MM DD');
                    var mDateA1 = moment(plate.creationdate).add(numberOfDaysToSearch, 'days').format('YYYY MM DD');
                    return lodash_1.isEqual(thisPlateDate, mDateA1);
                });
            }).map(function (plate) {
                l4440Plates.push(plate);
            });
        }
    });
    lodash_1.range(1, 8).map(function (numberOfDaysToSearch) {
        if (!l4440Plates.length || l4440Plates.length < buckets[conditions[0]].length) {
            buckets[conditions[1]].filter(function (plate) {
                return lodash_1.find(buckets[conditions[0]], function (tPlate) {
                    var thisPlateDate = moment(tPlate.creationdate).format('YYYY MM DD');
                    var mDateS1 = moment(plate.creationdate).subtract(numberOfDaysToSearch, 'days').format('YYYY MM DD');
                    return lodash_1.isEqual(thisPlateDate, mDateS1);
                });
            }).map(function (plate) {
                l4440Plates.push(plate);
            });
        }
    });
    //For most things lodash can work its magic, but for more complex operations it won't deal with classes
    l4440Plates = JSON.parse(JSON.stringify(l4440Plates));
    l4440Plates = lodash_1.uniqWith(l4440Plates, lodash_1.isEqual);
    buckets[conditions[1]] = l4440Plates;
    return buckets;
}
function barcodeIsRNAiMutant(plate) {
    if (plate.name.match(/RNA/) && plate.name.match(/_am/)) {
        return true;
    }
    else {
        return false;
    }
}
function barcodeIsRNAiN2(plate) {
    if (plate.name.match(/RNA/) && plate.name.match(/E/)) {
        return true;
    }
    else {
        return false;
    }
}
function barcodeIsL4440Mutant(plate) {
    if (plate.name.match(/L4440/) && plate.name.match(/_am/)) {
        return true;
    }
    else {
        return false;
    }
}
function barcodeIsL4440N2(plate) {
    if (plate.name.match(/L4440/) && !plate.name.match(/_am/)) {
        return true;
    }
    else {
        return false;
    }
}
function mapOldWorkflow(buckets, chrom, plate, quadrant) {
    var primaryWorkflow = deepcopy(minimal);
    [quadrant, chrom, plate].map(function (thing) {
        if (lodash_1.isNull(thing)) {
            console.error('Things are missing that should not be missing!');
            // console.error(JSON.stringify(workflowData.search));
            process.exit(1);
        }
    });
    var dates = buckets.treat_rnai.map(function (plate) {
        return plate.creationdate;
    }).sort();
    primaryWorkflow.search.rnaiLibrary.plate = plate;
    primaryWorkflow.search.rnaiLibrary.quadrant = quadrant;
    primaryWorkflow.search.rnaiLibrary.chrom = chrom;
    primaryWorkflow.stockPrepDate = dates[0];
    primaryWorkflow.assayDates = dates;
    primaryWorkflow.replicates = {};
    buckets.treat_rnai.map(function (plate, index) {
        //@ts-ignore
        if (!lodash_1.has(primaryWorkflow.replicates, index + 1)) {
            primaryWorkflow.replicates[index + 1] = [];
        }
        try {
            primaryWorkflow.replicates[index + 1].push(plate.csPlateid);
        }
        catch (error) {
            return (new Error(error));
        }
    });
    buckets.ctrl_rnai.map(function (plate, index) {
        //@ts-ignore
        if (!lodash_1.has(primaryWorkflow.replicates, index + 1)) {
            primaryWorkflow.replicates[index + 1] = [];
        }
        primaryWorkflow.replicates[index + 1].push(plate.csPlateid);
    });
    primaryWorkflow.screenName = screenName;
    primaryWorkflow.screenId = screenId;
    primaryWorkflow.temperature = temperature;
    primaryWorkflow.name = "AHR2 " + moment(dates[0]).format('YYYY-MM-DD') + " " + expBiosampleName + " " + controlBiosampleName + " " + screenType + " Chr " + chrom + " Plate " + plate + " Q " + quadrant;
    primaryWorkflow.comment = "migration upload";
    primaryWorkflow.screenType = screenType;
    ['treat_rnai', 'ctrl_rnai', 'ctrl_strain', 'ctrl_null'].map(function (condition) {
        buckets[condition].map(function (plate) {
            //@ts-ignore
            plate.instrumentPlateId = plate.csPlateid;
            plate = JSON.parse(JSON.stringify(plate));
        });
    });
    primaryWorkflow.experimentGroups.treat_rnai.plates = buckets.treat_rnai;
    primaryWorkflow.experimentGroups.treat_rnai.biosampleId = expBiosampleId;
    primaryWorkflow.experimentGroups.ctrl_rnai.plates = buckets.ctrl_rnai;
    primaryWorkflow.experimentGroups.ctrl_rnai.biosampleId = controlBiosampleId;
    primaryWorkflow.experimentGroups.ctrl_strain.plates = buckets.ctrl_strain;
    primaryWorkflow.experimentGroups.ctrl_strain.biosampleId = expBiosampleId;
    primaryWorkflow.experimentGroups.ctrl_null.plates = buckets.ctrl_null;
    primaryWorkflow.experimentGroups.ctrl_null.biosampleId = controlBiosampleId;
    primaryWorkflow.biosamples = {
        "experimentBiosample": {
            "id": expBiosampleId,
            "name": expBiosampleName
        },
        "ctrlBiosample": {
            "id": controlBiosampleId,
            "name": controlBiosampleName,
        }
    };
    return primaryWorkflow;
}
//# sourceMappingURL=uploadAmeliaScreens.js.map