#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var lodash_1 = require("lodash");
var Promise = require("bluebird");
var Papa = require("papaparse");
var deepcopy = require("deepcopy");
var models_1 = require("../../../../common/types/sdk/models");
var path = require('path');
var fs = require('fs');
var hash = require('object-hash');
var file = 'eegi-denorm-2012-all.csv';
var eegi = path.resolve(__dirname, file);
var wormStrains = path.resolve(__dirname, 'worm_strain_table_ny.csv');
var problemGroups = {};
// Image urls look like this - http://eegi.bio.nyu.edu/image/32412/Tile000006.bmp
// eegi.bio.nyu.edu/${plateId}/tileMappingWell.bmp
// parseCSVFile(eegi)
//   .then((eegiResults: EegiResults[]) => {
//     app.winston.info('Finished parsing csv');
//     // const groupedResults: any = createExpGroups(eegiResults);
//     let groupedResults = groupByPlatePlanHash(eegiResults);
//     return;
//   })
//   .catch((error) => {
//     return new Error(error);
//   });
parseCSVFile(eegi)
    .then(function (eegiResults) {
    app.winston.info('Finished parsing csv');
    // const groupedResults: any = createExpGroups(eegiResults);
    var groupedResults = groupByPlatePlanHash(eegiResults);
    app.winston.info('Finished Grouping Results');
    return extractPlates(groupedResults)
        .then(function (platePlans) {
        app.winston.info('Finishing extracting plates');
        return createScreens(groupedResults)
            .then(function (screens) {
            app.winston.info('Finished creating screens!');
            screens = lodash_1.uniqBy(screens, 'screenName');
            return createBiosamples(groupedResults)
                .then(function (biosamples) {
                app.winston.info('Finished creating biosamples');
                app.winston.info('Begin creating expScreenUploadWorkflows');
                return createExpScreenWorkflows(groupedResults, screens, biosamples, platePlans);
            })
                .then(function (results) {
                app.winston.info('Finished creating expScreenUploadWorkflows');
                // return results;
                //@ts-ignore
                return Promise.map(results, function (workflow) {
                    app.winston.info('Doing work...');
                    return app.models.ExpScreenUploadWorkflow.load.workflows.worms.doWork(workflow);
                    // return app.models.ExpScreenUploadWorkflow.findOrCreate({where: {name: workflow.name}}, workflow)
                }, { concurrency: 1 })
                    .then(function () {
                    return;
                })
                    .catch(function (error) {
                    return (new Error(error));
                });
            })
                .catch(function (error) {
                return (new Error(error));
            });
        })
            .catch(function (error) {
            return new Error(error);
        });
        // console.log('finished');
        // process.exit(0);
    })
        .catch(function (error) {
        console.log("Error: " + error);
        process.exit(1);
    });
})
    .catch(function (error) {
    console.log("Error: " + error);
    process.exit(1);
});
function parseCSVFile(csvFile) {
    return new Promise(function (resolve, reject) {
        Papa.parse(fs.createReadStream(csvFile), {
            header: true,
            complete: function (results) {
                resolve(results.data);
            },
        });
    });
}
/**
 * This returns a very nested group of group of groups
 * platePlanHash
 *    wormGene
 *        Temperature
 *            Barcode
 * @param eegiResults
 */
function groupByPlatePlanHash(eegiResults) {
    var dataCSV = [];
    eegiResults = filterForAhringerLibrary(eegiResults);
    var plates = lodash_1.groupBy(eegiResults, 'experiment.plate_id');
    eegiResults = [];
    Object.keys(plates).map(function (plateId) {
        var platePlanHash = hash(plates[plateId].map(function (eegiResult) {
            return eegiResult['clone.id'];
        }));
        plates[plateId].map(function (eegiResult) {
            // const libraryStock = eegiResult['experiment.library_stock_id'].replace(/_.*$/, '');
            var barcode = "RNAi--" + eegiResult['experimentplate.date'] + "--" + eegiResult['experimentplate.temperature'] + "--" + eegiResult['wormstrain.gene'] + "--" + eegiResult['librarystock.plate_id'] + "--" + eegiResult["experiment.plate_id"];
            eegiResult['platePlanHash'] = platePlanHash;
            eegiResult.barcode = barcode;
            eegiResults.push(eegiResult);
        });
    });
    var platePlanGroup = lodash_1.groupBy(eegiResults, 'platePlanHash');
    Object.keys(platePlanGroup).map(function (platePlanHash) {
        var wormGroup = lodash_1.groupBy(platePlanGroup[platePlanHash], 'wormstrain.gene');
        // platePlanGroup[platePlanHash] = wormGroup;
        Object.keys(wormGroup).map(function (wormGene) {
            var temperatureGroup = lodash_1.groupBy(wormGroup[wormGene], 'experimentplate.temperature');
            Object.keys(temperatureGroup).map(function (temp) {
                temperatureGroup[temp].map(function (eegiResult) {
                    var yearRegexp = new RegExp('\\d{4}');
                    var experimentDate = eegiResult['experimentplate.date'];
                    var year = yearRegexp.exec(experimentDate)[0];
                    eegiResult.group = "RNAi--Ahringer--" + year + "--" + wormGene + "--" + temp + "--" + eegiResult['librarystock.plate_id'] + "--" + platePlanHash;
                    eegiResult.name = "RNAi Ahringer " + year + " " + wormGene + " " + temp + " " + eegiResult['librarystock.plate_id'] + " " + platePlanHash;
                    if (!lodash_1.isEqual(eegiResult["experiment.worm_strain_id"], 'N2')) {
                        if (lodash_1.isEqual(eegiResult["experimentplate.temperature"], eegiResult['wormstrain.permissive_temperature'])) {
                            eegiResult.screenType = 'permissive';
                            eegiResult.screenStage = 'secondary';
                            eegiResult.screenName = "NY RNAi Ahringer Secondary " + eegiResult["wormstrain.genotype"] + " Permissive Screen";
                        }
                        else {
                            eegiResult.screenType = 'restrictive';
                            eegiResult.screenStage = 'secondary';
                            eegiResult.screenName = "NY RNAi Ahringer Secondary " + eegiResult["wormstrain.genotype"] + " Restrictive Screen";
                        }
                    }
                });
                var plateGroup = lodash_1.groupBy(temperatureGroup[temp], 'barcode');
                var replicates = Object.keys(plateGroup).length;
                Object.keys(plateGroup).map(function (barcode) {
                    dataCSV.push({
                        PlatePlanHash: platePlanHash,
                        barcode: barcode,
                        wormStrain: wormGene,
                        temperature: temp,
                        replicates: replicates
                    });
                });
                temperatureGroup[temp] = plateGroup;
                return;
            });
            wormGroup[wormGene] = temperatureGroup;
            return;
        });
        platePlanGroup[platePlanHash] = wormGroup;
        return;
    });
    fs.writeFileSync(path.join(__dirname, 'eeegi-denorm-2014-all-report.csv'), Papa.unparse(dataCSV));
    return platePlanGroup;
}
function filterForAhringerLibrary(eegiResults) {
    var plates = lodash_1.groupBy(eegiResults, 'experiment.plate_id');
    var teegiResults = [];
    Object.keys(plates).map(function (plateId) {
        if (lodash_1.find(plates[plateId], { 'clone.library': 'Ahringer' })) {
            plates[plateId].map(function (eegiResult) {
                teegiResults.push(eegiResult);
            });
        }
    });
    return teegiResults;
}
/**
 * Create the screens
 *   {
    "screenId": 0,
    "screenName": "string",
    "screenType": "string",
    "screenStage": "string",
    "screenDescription": "string",
    "screenProtocol": "string",
    "screenParentId": 0,
    "screenPerformedBy": "string",
    "screenMeta": "string"
  }
 * @param groupedResults
 */
function createScreens(groupedResults) {
    var createScreens = [];
    return new Promise(function (resolve, reject) {
        Object.keys(groupedResults).map(function (platePlanHash) {
            Object.keys(groupedResults[platePlanHash]).map(function (wormStrain) {
                Object.keys(groupedResults[platePlanHash][wormStrain]).map(function (temperatureKey) {
                    var plateR1Key = Object.keys(groupedResults[platePlanHash][wormStrain][temperatureKey])[0];
                    var firstWell = groupedResults[platePlanHash][wormStrain][temperatureKey][plateR1Key][0];
                    if (!lodash_1.find(createScreens, { screeName: firstWell['screenName'] })) {
                        var screen_1 = new models_1.ExpScreenResultSet({
                            screenName: firstWell.screenName,
                            screenStage: firstWell.screenStage,
                            screenType: firstWell.screenType,
                        });
                        createScreens.push(screen_1);
                    }
                });
            });
        });
        createScreens = lodash_1.uniqWith(createScreens, lodash_1.isEqual);
        createScreens = lodash_1.compact(createScreens);
        // @ts-ignore
        Promise.map(createScreens, function (screen) {
            return app.models.ExpScreen
                .findOrCreate({ where: app.etlWorkflow.helpers.findOrCreateObj(screen) }, screen)
                .then(function (results) {
                return results[0];
            })
                .catch(function (error) {
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
/**
 * Create the biosamples
 * {
    "biosampleId": 0,
    "biosampleName": "string",
    "biosampleType": "string",
    "biosampleSpecies": "string",
    "biosampleStrain": "string",
    "biosampleGene": "string",
    "biosampleAllele": "string",
    "biosampleMeta": "string"
  }
 * @param groupedResults
 */
function createBiosamples(groupedResults) {
    var createThese = [];
    Object.keys(groupedResults).map(function (platePlanHash) {
        Object.keys(groupedResults[platePlanHash]).map(function (wormStrain) {
            Object.keys(groupedResults[platePlanHash][wormStrain]).map(function (temperatureKey) {
                var plateR1Key = Object.keys(groupedResults[platePlanHash][wormStrain][temperatureKey])[0];
                var plateR1 = groupedResults[platePlanHash][wormStrain][temperatureKey][plateR1Key][0];
                if (!lodash_1.find(createThese, { biosampleGene: plateR1['wormstrain.gene'] })) {
                    var biosample = new models_1.ExpBiosampleResultSet({
                        biosampleType: 'worm',
                        biosampleAllele: plateR1['wormstrain.allele'],
                        biosampleGene: plateR1['wormstrain.gene'],
                        biosampleStrain: plateR1['wormstrain.id'],
                        biosampleName: plateR1['wormstrain.allele'] || 'N2',
                        biosampleMeta: JSON.stringify({
                            allele: plateR1['wormstrain.allele'],
                            gene: plateR1['wormstrain.gene'],
                            id: plateR1['wormstrain.id'],
                            permissiveTemp: plateR1['wormstrain.permissive_temperature'],
                            restrictiveTemp: plateR1['wormstrain.restrictive_temperature'],
                            genotype: plateR1['wormstrain.genotype'],
                        }),
                    });
                    createThese.push(biosample);
                }
            });
        });
    });
    createThese = lodash_1.uniqBy(createThese, 'biosampleStrain');
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        Promise.map(createThese, function (biosample) {
            return app.models.ExpBiosample
                .findOrCreate({ where: app.etlWorkflow.helpers.findOrCreateObj(biosample) }, biosample)
                .then(function (results) {
                return results[0];
            })
                .catch(function (error) {
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
/**
 * {
 *     RNAi--2012-01-18--22.5--universal-F2: {
 *         AR1: {
 *             Replicate1: [wells],
 *             Replicate2: [wells]
 *             Replicate3: [wells],
 *             Replicate4: [wells]
 *         },
 *         EU856: {
 *             Replicate1: [wells],
 *             Replicate2: [wells]
 *             Replicate3: [wells],
 *             Replicate4: [wells]
 *         },
 *         N2: {
 *             Replicate1: [wells],
 *             Replicate2: [wells]
 *         }
 *     }
 * }
 * @param groupedResults
 * @param screens
 * @param biosamples
 */
function createExpScreenWorkflows(groupedResults, screens, biosamples, platePlans) {
    var workflows = [];
    Object.keys(groupedResults).map(function (platePlanHash) {
        //Top Level is the Experiment Group Key
        var N2 = null;
        if (lodash_1.get(groupedResults[platePlanHash], 'N2')) {
            N2 = deepcopy(groupedResults[platePlanHash].N2);
            delete groupedResults[platePlanHash].N2;
        }
        try {
            Object.keys(groupedResults[platePlanHash]).map(function (mutantWormStrain) {
                var wormGroup = groupedResults[platePlanHash][mutantWormStrain];
                Object.keys(wormGroup).map(function (temperature) {
                    //Begin actual workflow creation
                    var plateR1 = Object.keys(groupedResults[platePlanHash][mutantWormStrain][temperature])[0];
                    var firstWell = groupedResults[platePlanHash][mutantWormStrain][temperature][plateR1][0];
                    if (!lodash_1.isObject(firstWell)) {
                        console.log("Results malformed. No First Well!");
                        return;
                    }
                    else {
                        var wormRecord = lodash_1.find(biosamples, { biosampleGene: firstWell['wormstrain.gene'] });
                        var screenRecord = lodash_1.find(screens, { screenName: firstWell.screenName });
                        var yearRegexp = new RegExp('\\d{4}');
                        var experimentDate = firstWell['experimentplate.date'];
                        var year = yearRegexp.exec(experimentDate)[0];
                        var platePlan = lodash_1.find(platePlans, { platePlanName: "NY " + year + " " + firstWell['platePlanHash'] });
                        if (!wormRecord) {
                            throw new Error("No worm record found!");
                        }
                        if (!screenRecord) {
                            throw new Error("No ScreenRecord Found!");
                        }
                        if (!platePlan) {
                            throw new Error("No PlatePlan Found!");
                        }
                        var thisWorkflow_1 = deepcopy(minimalWorkflow);
                        thisWorkflow_1['site'] = 'NY';
                        thisWorkflow_1.name = firstWell.name;
                        thisWorkflow_1.screenName = firstWell.screenName;
                        thisWorkflow_1.screenStage = firstWell.screenStage;
                        thisWorkflow_1.screenType = firstWell.screenType;
                        thisWorkflow_1.temperature = firstWell['experimentplate.temperature'];
                        try {
                            thisWorkflow_1.screenId = screenRecord.screenId;
                        }
                        catch (error) {
                            throw new Error("Error with screen data in workflow! " + error);
                        }
                        thisWorkflow_1.instrumentId = 3;
                        thisWorkflow_1.libraryId = 1;
                        thisWorkflow_1.librarycode = 'ahringer2';
                        thisWorkflow_1.assayViewType = "exp_assay_ahringer2";
                        thisWorkflow_1.plateViewType = "exp_plate_ahringer2";
                        thisWorkflow_1.biosamples = {
                            "experimentBiosample": {
                                "id": wormRecord.biosampleId,
                                "name": wormRecord.biosampleGene
                            }, "ctrlBiosample": { "id": "4", "name": "N2" }
                        };
                        try {
                            // Add Plates
                            thisWorkflow_1.experimentGroups = {};
                            thisWorkflow_1.experimentGroups.treat_rnai = {};
                            thisWorkflow_1.experimentGroups.treat_rnai.plates = [];
                            thisWorkflow_1.experimentGroups.treat_rnai.biosampleId = wormRecord.biosampleId;
                        }
                        catch (error) {
                            throw new Error("Something went wrong initializing wormRecords! " + error);
                        }
                        var mutantWormStrainImageDates_1 = [];
                        Object.keys(groupedResults[platePlanHash][mutantWormStrain][temperature]).map(function (plateId) {
                            try {
                                var firstWell_1 = groupedResults[platePlanHash][mutantWormStrain][temperature][plateId][0];
                                var plateRecord = {
                                    "csPlateid": firstWell_1["experiment.plate_id"],
                                    "id": firstWell_1["experiment.plate_id"],
                                    "name": firstWell_1.barcode,
                                    "creationdate": firstWell_1["experimentplate.date"],
                                    "imagepath": firstWell_1['experiment.plate_id'],
                                    "platebarcode": firstWell_1.barcode,
                                    "instrumentPlateId": firstWell_1['experiment.plate_id']
                                };
                                mutantWormStrainImageDates_1.push(plateRecord.creationdate);
                                thisWorkflow_1.experimentGroups.treat_rnai.plates.push(plateRecord);
                            }
                            catch (error) {
                                throw new Error("Something went wrong adding treatRNAi plates! " + error);
                            }
                        });
                        mutantWormStrainImageDates_1 = lodash_1.uniq(mutantWormStrainImageDates_1);
                        thisWorkflow_1.experimentGroups.ctrl_rnai = {};
                        thisWorkflow_1.experimentGroups.ctrl_rnai.plates = [];
                        thisWorkflow_1.experimentGroups.ctrl_rnai.biosampleId = 4;
                        if (N2 && lodash_1.get(N2, temperature)) {
                            Object.keys(N2[temperature]).map(function (plateId) {
                                try {
                                    var firstWell_2;
                                    if (lodash_1.get(N2, [temperature, plateId, 0])) {
                                        firstWell_2 = N2[temperature][plateId][0];
                                    }
                                    var plateRecord = {
                                        "csPlateid": firstWell_2["experiment.plate_id"],
                                        "id": firstWell_2["experiment.plate_id"],
                                        "name": firstWell_2.barcode,
                                        "creationdate": firstWell_2["experimentplate.date"],
                                        "imagepath": firstWell_2['experiment.plate_id'],
                                        "platebarcode": firstWell_2.barcode,
                                        "instrumentPlateId": firstWell_2['experiment.plate_id']
                                    };
                                    if (lodash_1.includes(mutantWormStrainImageDates_1, plateRecord.creationdate)) {
                                        thisWorkflow_1.experimentGroups.ctrl_rnai.plates.push(plateRecord);
                                    }
                                }
                                catch (error) {
                                    throw new Error("Something went wrong adding N2 plates! " + error);
                                }
                            });
                        }
                        try {
                            thisWorkflow_1.replicates = [];
                            thisWorkflow_1.experimentGroups.treat_rnai.plates.map(function (plate) {
                                thisWorkflow_1.replicates.push([plate.id]);
                            });
                            thisWorkflow_1.experimentGroups.ctrl_rnai.plates.map(function (plate, index) {
                                if (index < thisWorkflow_1.experimentGroups.treat_rnai.plates.length) {
                                    thisWorkflow_1.replicates[index].push(plate.id);
                                }
                                else {
                                    thisWorkflow_1.replicates[thisWorkflow_1.replicates.length - 1].push(plate.id);
                                }
                            });
                            thisWorkflow_1.platePlanId = String(platePlan.id);
                            thisWorkflow_1.platePlan = platePlan;
                            thisWorkflow_1.instrumentLookUp = 'nyMicroscope';
                        }
                        catch (error) {
                            throw new Error("There was an error with the last piece! " + error);
                        }
                        workflows.push(thisWorkflow_1);
                    }
                });
            });
        }
        catch (error) {
            console.log(error);
        }
    });
    return new Promise(function (resolve, reject) {
        workflows = lodash_1.compact(workflows);
        //@ts-ignore
        Promise.map(workflows, function (workflow) {
            return app.models.ExpScreenUploadWorkflow
                .findOrCreate({ where: { name: workflow.name } }, JSON.parse(JSON.stringify(workflow)))
                .then(function (results) {
                results[0].platePlanId = workflow.platePlanId;
                results[0].instrumentLookUp = workflow.instrumentLookUp;
                return app.models.ExpScreenUploadWorkflow.upsert(results[0]);
                // return contactSheetResults[0];
            })
                .catch(function (error) {
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function extractPlates(groupedResults) {
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        Promise.map(Object.keys(groupedResults), function (platePlanHash) {
            var wormStrain = Object.keys(groupedResults[platePlanHash])[0];
            var temperature = Object.keys(groupedResults[platePlanHash][wormStrain])[0];
            var plateKey = Object.keys(groupedResults[platePlanHash][wormStrain][temperature])[0];
            var plate = groupedResults[platePlanHash][wormStrain][temperature][plateKey];
            return createPlatePlan(plate, platePlanHash);
        }, { concurrency: 1 })
            .then(function (platePlans) {
            return createPlatePlans(platePlans);
        })
            .then(function (platePlans) {
            resolve(platePlans);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function createPlatePlan(plate, group) {
    return new Promise(function (resolve, reject) {
        if (lodash_1.isArray(plate)) {
            var geneNames_1 = plate.map(function (well) {
                return well['clone.id'].replace('sjj_', '');
            });
            //@ts-ignore
            var growthHormones = plate.filter(function (well) {
                var match = well['clone.id'].match('GHR-');
                return match;
            });
            var growthHormoneRecords = growthHormones.map(function (ghr) {
                return {
                    libraryId: 1,
                    geneName: ghr,
                    plate: 'G',
                    bioloc: 'G',
                    stocktitle: 'G',
                    well: 'GHR',
                    fwdPrimer: 'GHR',
                    revPrimer: 'GHR',
                    chrom: 'GHR',
                    rnaiType: 'GHR',
                    stockloc: 'GHR'
                };
            });
            var platePlan_1 = new models_1.PlatePlan96ResultSet();
            //@ts-ignore
            Promise.map(growthHormoneRecords, function (growthHormones) {
                return app.models.RnaiLibrary
                    //@ts-ignore
                    .findOrCreate({ where: { geneName: growthHormones.geneName } }, growthHormones);
            }, { concurrency: 1 })
                .then(function (growthResults) {
                return app.models.RnaiLibrary
                    .find({
                    where: {
                        and: [
                            {
                                geneName: {
                                    inq: geneNames_1,
                                }
                            },
                            {
                                plate: {
                                    nlike: 'S%',
                                },
                            }
                        ]
                    }
                });
            })
                .then(function (rnaiLibaryResults) {
                return app.models.RnaiWormbaseXrefs
                    .find({
                    where: {
                        wbGeneSequenceId: {
                            inq: rnaiLibaryResults.map(function (rnaiLibraryResult) {
                                return rnaiLibraryResult.geneName;
                            })
                        },
                    }
                })
                    .then(function (rnaiXrefs) {
                    //JOIN
                    plate.map(function (eegiResult) {
                        platePlan_1[eegiResult['experiment.well']] = {};
                        if (lodash_1.isEqual(eegiResult['clone.id'], 'L4440')) {
                            //Its an L4440 Well
                            platePlan_1[eegiResult['experiment.well']] = {
                                "isValid": true,
                                "well": eegiResult['experiment.well'],
                                "taxTerm": "L4440",
                                "geneName": "L4440",
                                "lookUp": "L4440",
                                "geneData": {}
                            };
                        }
                        else {
                            // Theres a gene
                            var rnaiResult = lodash_1.find(rnaiLibaryResults, { 'geneName': eegiResult['clone.id'].replace('sjj_', '') });
                            if (rnaiResult) {
                                var rnaiXref = lodash_1.find(rnaiXrefs, { wbGeneSequenceId: String(rnaiResult.geneName) });
                                platePlan_1[eegiResult['experiment.well']] = {
                                    "isValid": true,
                                    "well": eegiResult['experiment.well'],
                                    "taxTerm": eegiResult['clone.id'].replace('sjj_', ''),
                                    "geneName": eegiResult['clone.id'].replace('sjj_', ''),
                                    "lookUp": rnaiResult.bioloc,
                                    "geneData": rnaiXref,
                                    "parentLibrary": rnaiResult,
                                };
                            }
                            else {
                                // Its an empty well
                                platePlan_1[eegiResult['experiment.well']] = {
                                    "isValid": true,
                                    "well": eegiResult['experiment.well'],
                                    geneData: {},
                                };
                            }
                        }
                    });
                    // @ts-ignore
                    platePlan_1.platePlanUploadDate = new Date();
                    var yearRegexp = new RegExp('\\d{4}');
                    var experimentDate = plate[0]['experimentplate.date'];
                    var year = yearRegexp.exec(experimentDate)[0];
                    platePlan_1.platePlanName = "NY " + year + " " + plate[0]['platePlanHash'];
                    platePlan_1.site = 'NY';
                    return platePlan_1;
                })
                    .catch(function (error) {
                    return new Error(error);
                });
            })
                .then(function (platePlan) {
                resolve(platePlan);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
        else {
            resolve(null);
        }
    });
}
function createPlatePlans(platePlans) {
    return new Promise(function (resolve, reject) {
        platePlans = lodash_1.compact(platePlans);
        //@ts-ignore
        Promise.map(platePlans, function (platePlan) {
            return app.models.PlatePlan96
                .findOrCreate({ where: { platePlanName: platePlan.platePlanName } }, JSON.parse(JSON.stringify(platePlan)))
                .then(function (results) {
                return results[0];
            })
                .catch(function (error) {
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
var WormStrains = /** @class */ (function () {
    function WormStrains(data) {
        Object.assign(this, data);
    }
    return WormStrains;
}());
exports.WormStrains = WormStrains;
var EegiResults = /** @class */ (function () {
    function EegiResults(data) {
        Object.assign(this, data);
    }
    return EegiResults;
}());
exports.EegiResults = EegiResults;
var minimalWorkflow = {
    "name": "AHR2 2018-04 mip-1;mip-2 Restrictive 25",
    "comment": "reupload",
    platePlan: {},
    "platePlanId": "5af2d2db91f1d80107d9689b",
    "assayViewType": "exp_assay_ahringer2",
    "plateViewType": "exp_plate_ahringer2",
    "instrumentPlateIdLookup": "csPlateid",
    "wells": ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10", "A11", "A12", "B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09", "B10", "B11", "B12", "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C12", "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11", "D12", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12", "G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10", "G11", "G12", "H01", "H02", "H03", "H04", "H05", "H06", "H07", "H08", "H09", "H10", "H11", "H12"],
    "screenId": 7,
    "instrumentId": 1,
    "libraryId": 1,
    "screenStage": "secondary",
    "screenType": "restrictive",
    "biosamples": { "experimentBiosample": { "id": "6", "name": "mip-1;mip-2" }, "ctrlBiosample": { "id": "4", "name": "N2" } },
    "libraryModel": "RnaiLibrary",
    "libraryStockModel": "RnaiLibraryStock",
    "reagentLookUp": "rnaiId",
    "instrumentLookUp": "arrayScan",
    "biosampleType": "worm",
    "replicates": [["9807", "9799"], ["9808", "9800"], ["9809", "9801"], ["9810", "9802"], ["9811", "9803"], ["9812", "9804"], ["9813", "9805"], ["9814", "9806"]],
    "conditions": ["treat_rnai", "ctrl_rnai", "ctrl_null", "ctrl_strain"],
    "controlConditions": ["ctrl_strain", "ctrl_null"],
    "experimentConditions": ["treat_rnai", "ctrl_rnai"],
    "biosampleMatchConditions": { "treat_rnai": "ctrl_strain", "ctrl_rnai": "ctrl_null" },
    "experimentMatchConditions": { "treat_rnai": "ctrl_rnai" },
    "experimentDesign": { "treat_rnai": ["ctrl_rnai", "ctrl_strain", "ctrl_null"] },
    "experimentGroups": {
        "treat_rnai": {
            "plates": [{
                    "csPlateid": "9814",
                    "id": "cx5-pc180429150006",
                    "name": "RNAi_Rescreen_Apr_mip_25_8",
                    "creationdate": "2018-04-29T00:00:00.000Z",
                    "imagepath": "\\\\aduae120-wap\\CS_DATA_SHARE\\2018Apr23\\cx5-pc180429150006\\",
                    "platebarcode": "CX5-PC15:28:46",
                    "instrumentPlateId": 9814
                }], "biosampleId": "6"
        },
        "ctrl_rnai": {
            "plates": [{
                    "csPlateid": "9806",
                    "id": "cx5-pc180429140008",
                    "name": "RNAi_Rescreen_Apr_N2_25_8",
                    "creationdate": "2018-04-29T00:00:00.000Z",
                    "imagepath": "\\\\aduae120-wap\\CS_DATA_SHARE\\2018Apr23\\cx5-pc180429140008\\",
                    "platebarcode": "CX5-PC14:44:38",
                    "instrumentPlateId": 9806
                }], "biosampleId": "4"
        },
        "ctrl_strain": { "biosampleId": "6", "plates": [] },
        "ctrl_null": { "biosampleId": "4", "plates": [] }
    },
    "temperature": 25,
    "librarycode": "ahringer2",
    "screenName": "mip-1;mip-2 Secondary RNAi Restrictive Screen"
};
//# sourceMappingURL=parse_eegi_denorm.js.map