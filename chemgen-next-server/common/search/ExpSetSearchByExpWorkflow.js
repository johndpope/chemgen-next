"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var search_1 = require("../types/custom/search");
var config = require("config");
var knex = config.get('knex');
var ExpSet = app.models.ExpSet;
/**
 * ExpScreenUploadWorkflow is a config that can then be casted into the database,
 * but on its own it has a lot of metadata about the experiment itself
 * So when search for :
 * wormStrains, temperatures, temperatureRanges, instrumentPlateIds
 */
/**
 * For now this is exposed as its own API endpoint for more complex forms
 * Use a mix of the mongoose ORM and loopback ORM to deeply query the expWorkflow configuration
 * Get the expWorkflowIds, and return them to the frontEnd
 * @param search
 */
ExpSet.extract.searchByExpWorkflowData = function (search) {
    app.winston.info('Searching for expWorkflowData');
    search = new search_1.ScreenMetaDataCriteria(search);
    app.winston.info("Search : " + JSON.stringify(search));
    return new Promise(function (resolve, reject) {
        Promise.all([
            app.models.ExpSet.extract.searchByScreenStage(search),
            app.models.ExpSet.extract.searchByScreenType(search),
            app.models.ExpSet.extract.searchByInstrumentPlateIds(search),
            app.models.ExpSet.extract.searchByTemperature(search),
            app.models.ExpSet.extract.searchByTemperatureRange(search),
            app.models.ExpSet.extract.searchByWormStrains(search),
        ])
            .then(function (workflowIds) {
            workflowIds = lodash_1.compact(workflowIds);
            var idResults = new search_1.IdResults();
            idResults.expWorkflowIds = idResults.getCommonResults(workflowIds);
            if (workflowIds.length) {
                resolve(idResults);
            }
            else {
                resolve(null);
            }
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * Get a distinct set of temperatures from the expWorkflows
 * @param search
 */
ExpSet.extract.getAllTemperatures = function () {
    return new Promise(function (resolve, reject) {
        app.models.ExpScreenUploadWorkflow.getDataSource()
            .connector.connect(function (error, db) {
            var collection = db.collection('ExpScreenUploadWorkflow');
            collection.distinct("temperature", function (error, results) {
                var temperature = results.map(function (expWorkflow) {
                    if (lodash_1.isObject(expWorkflow) && lodash_1.get(expWorkflow, '$numberDouble')) {
                        return lodash_1.get(expWorkflow, '$numberDouble');
                    }
                    else {
                        return expWorkflow;
                    }
                }).map(function (v) {
                    return Number(v);
                });
                resolve(lodash_1.uniq(temperature));
            });
        });
    });
};
/**
 * Search by the screenId
 * This is also implemented as the 'screenSearch', but we are reimplementing it here
 * @param search
 */
ExpSet.extract.searchByScreen = function (search) {
    return new Promise(function (resolve, reject) {
        if (!lodash_1.get(search, 'screenId')) {
            resolve(null);
        }
        else {
            app.models.ExpScreenUploadWorkflow
                .find({
                where: {
                    screenId: search.screenId
                }
            })
                .then(function (results) {
                var ids = results.map(function (expWorkflow) {
                    return String(expWorkflow.id);
                });
                resolve(ids);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
    });
};
/**
 * There is something weird about using the loopback API to search for temperature,
 * so we are using the mongoose api instead
 * @param search
 */
ExpSet.extract.searchByTemperature = function (search) {
    return new Promise(function (resolve, reject) {
        if (!lodash_1.get(search, 'temperature')) {
            resolve(null);
        }
        else {
            var temp = search.temperature;
            app.models.ExpScreenUploadWorkflow
                .find({
                where: {
                    or: [{ 'temperature.$numberDouble': String(temp) }, { 'temperature': String(temp) }, { temperature: Number(temp) }]
                }, fields: { 'id': true }
            })
                .then(function (results) {
                console.log(results);
                var ids = results.map(function (expWorkflow) {
                    return String(expWorkflow.id);
                });
                resolve(ids);
            })
                .catch(function (error) {
                console.log(error);
            });
            // app.models.ExpScreenUploadWorkflow.getDataSource()
            //   .connector.connect(function (error, db) {
            //   const collection = db.collection('ExpScreenUploadWorkflow');
            //   collection.find(
            //     {"temperature.$numberDouble": String(search.temperature)},
            //     function (error, results) {
            //       results.toArray().then((t) => {
            //         const ids = t.map((expWorkflow: ExpScreenUploadWorkflowResultSet) => {
            //           return String(expWorkflow.id);
            //         });
            //         resolve(ids);
            //       });
            //     });
            // });
            //
        }
    });
};
/**
 * Search by a range of temperatures
 * @param search
 */
ExpSet.extract.searchByTemperatureRange = function (search) {
    return new Promise(function (resolve, reject) {
        if (!lodash_1.get(search, 'temperatureRange')) {
            resolve(null);
        }
        else {
            app.models.ExpScreenUploadWorkflow.getDataSource()
                .connector.connect(function (error, db) {
                var collection = db.collection('ExpScreenUploadWorkflow');
                var range = search.temperatureRange.sort();
                collection.find({ "temperature.$numberDouble": { "$gt": range[0], "$lt": range[1] } }, function (error, results) {
                    results.toArray().then(function (t) {
                        var ids = t.map(function (expWorkflow) {
                            return String(expWorkflow.id);
                        });
                        resolve(ids);
                    });
                });
            });
        }
    });
};
/**
 * Search by exp worm strains
 * This accepts wormStrain IDs
 * These don't include N2s, since N2s are all over the place
 * @param search
 */
ExpSet.extract.searchByWormStrains = function (search) {
    return new Promise(function (resolve, reject) {
        var wormStrains = [];
        if (!lodash_1.get(search, 'wormStrainId')) {
            resolve(null);
        }
        else if (lodash_1.isArray(search.wormStrainId)) {
            search.wormStrainId.map(function (wormStrainId) {
                wormStrains.push(String(wormStrainId));
                wormStrains.push(Number(wormStrainId));
            });
            wormStrains = lodash_1.uniq(wormStrains);
        }
        else {
            wormStrains.push(String(search.wormStrainId));
            wormStrains.push(Number(search.wormStrainId));
            wormStrains = lodash_1.uniq(wormStrains);
        }
        if (lodash_1.get(search, 'wormStrainId')) {
            app.models.ExpScreenUploadWorkflow
                .find({
                where: {
                    'biosamples.experimentBiosample.id': { inq: wormStrains }
                }
            })
                .then(function (results) {
                var ids = results.map(function (expWorkflow) {
                    return String(expWorkflow.id);
                });
                resolve(ids);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
        else {
            resolve(null);
        }
    });
};
/**
 * Screen Stage is Primary or Secondary
 * @param search
 */
ExpSet.extract.searchByScreenStage = function (search) {
    app.winston.info("Getting the screenStage");
    return new Promise(function (resolve, reject) {
        if (!lodash_1.get(search, 'screenStage')) {
            app.winston.info('No Screen Stage');
            resolve(null);
        }
        else {
            app.winston.info("Searching for screenStage: " + search.screenStage);
            app.models.ExpScreenUploadWorkflow
                .find({ where: { 'screenStage': search.screenStage } })
                .then(function (results) {
                var ids = results.map(function (expWorkflow) {
                    return String(expWorkflow.id);
                });
                resolve(ids);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
    });
};
/**
 * Screen Type - Permissive, Restrictive
 * @param search
 */
ExpSet.extract.searchByScreenType = function (search) {
    app.winston.info('Searching for screenType');
    return new Promise(function (resolve, reject) {
        if (!lodash_1.get(search, 'screenType')) {
            resolve(null);
        }
        else {
            app.models.ExpScreenUploadWorkflow
                .find({ where: { 'screenType': search.screenType } })
                .then(function (results) {
                var ids = results.map(function (expWorkflow) {
                    return String(expWorkflow.id);
                });
                app.winston.info("There are " + ids.length + " expWorkflows with screenType: " + search.screenType);
                resolve(ids);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
    });
};
ExpSet.extract.searchByInstrumentPlateIds = function (search) {
    return new Promise(function (resolve, reject) {
        if (!lodash_1.get(search, 'instrumentPlateIds')) {
            resolve(null);
        }
        else {
            app.models.ExpScreenUploadWorkflow.getDataSource()
                .connector.connect(function (error, db) {
                var collection = db.collection('ExpScreenUploadWorkflow');
                collection.find({
                    $or: [
                        {
                            "experimentGroups.treat_rnai.plates": {
                                "$elemMatch": {
                                    "instrumentPlateId": { "$in": search.plateIds },
                                }
                            }
                        },
                        {
                            "experimentGroups.ctrl_rnai.plates": {
                                "$elemMatch": {
                                    "instrumentPlateId": { "$in": search.plateIds },
                                }
                            }
                        },
                        {
                            "experimentGroups.ctrl_strain.plates": {
                                "$elemMatch": {
                                    "instrumentPlateId": { "$in": search.plateIds },
                                }
                            }
                        },
                        {
                            "experimentGroups.ctrl_null.plates": {
                                "$elemMatch": {
                                    "instrumentPlateId": { "$in": search.plateIds },
                                }
                            }
                        },
                        {
                            "experimentGroups.treat_rnai.plates": {
                                "$elemMatch": {
                                    "platebarcode": { "$in": search.plateIds },
                                }
                            }
                        },
                        {
                            "experimentGroups.ctrl_rnai.plates": {
                                "$elemMatch": {
                                    "platebarcode": { "$in": search.plateIds },
                                }
                            }
                        },
                        {
                            "experimentGroups.ctrl_strain.plates": {
                                "$elemMatch": {
                                    "platebarcode": { "$in": search.plateIds },
                                }
                            }
                        },
                        {
                            "experimentGroups.ctrl_null.plates": {
                                "$elemMatch": {
                                    "platebarcode": { "$in": search.plateIds },
                                }
                            }
                        },
                    ]
                }, function (error, results) {
                    results.toArray()
                        .then(function (t) {
                        var ids = t.map(function (expWorkflow) {
                            return String(expWorkflow.id);
                        });
                        resolve(ids);
                    });
                });
            });
        }
    });
};
/**
 * This resolves the expWorkflows that has a given gene name -
 * Gene name can be the gene name, cosmid ID, or wormbase ID
 * @param search
 */
ExpSet.extract.getExpWorkflowsByRNAiReagentData = function (search) {
    return new Promise(function (resolve, reject) {
        //Get the RNAiLibrary Results
        //Search stocks for plates
        //Search Plates for ExpWorkflowIds
        //But this is stupid, the exp_workflow_id should be in the stock tables
        //It would also be nice if everything was in the plate plan, and then could search there directly
        search.rnaiList = lodash_1.compact(search.rnaiList);
        if (search.rnaiList.length) {
            app.models.RnaiLibrary.extract.workflows
                .getRnaiLibraryFromUserGeneList(search.rnaiList, search)
                .then(function (rnaiLibraryResults) {
                var query = knex('rnai_library_stock')
                    .distinct('plate_id');
                rnaiLibraryResults.map(function (rnaiLibraryResult) {
                    query
                        .orWhere({ library_id: rnaiLibraryResult.libraryId, rnai_id: rnaiLibraryResult.rnaiId });
                });
                query.select();
                return query;
            })
                .then(function (plateIds) {
                // return;
                return app.models.ExpPlate
                    .find({
                    where: {
                        plateId: {
                            inq: plateIds.map(function (plateId) {
                                return plateId.plate_id;
                            })
                        }
                    },
                    fields: {
                        expWorkflowId: true,
                    }
                });
            })
                .then(function (expPlateResults) {
                resolve(lodash_1.uniq(expPlateResults.map(function (expPlate) {
                    return expPlate.expWorkflowId;
                })));
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
        else {
            resolve(null);
        }
    });
};
/**
 * TODO - If we are ONLY searching for RNAi (no other values), then just return the expSet list
 * TODO - BUT if we are searching for RNAis in permissive blahblahblah
 * THEN we need to combine those
 * This resolves the expSets that has a given gene name -
 * Gene name can be the gene name, cosmid ID, or wormbase ID
 * @param search
 */
ExpSet.extract.getExpSetsByRNAiReagentData = function (search) {
    return new Promise(function (resolve, reject) {
        search.rnaiList = lodash_1.compact(search.rnaiList);
        console.log("Search is : " + JSON.stringify(search));
        if (search.rnaiList.length) {
            app.models.RnaiLibrary.extract.workflows
                .getRnaiLibraryFromUserGeneList(search.rnaiList, search)
                .then(function (rnaiLibraryResults) {
                app.winston.info('Got RNAILibrary Results!');
                app.winston.info(JSON.stringify(rnaiLibraryResults));
                if (rnaiLibraryResults.length) {
                    var query_1 = knex('exp_assay2reagent')
                        .distinct('treatment_group_id');
                    rnaiLibraryResults.map(function (rnaiLibraryResult) {
                        query_1
                            .orWhere({ library_id: rnaiLibraryResult.libraryId, reagent_id: rnaiLibraryResult.rnaiId });
                    });
                    query_1.andWhere({ reagent_type: 'treat_rnai' });
                    query_1.select('exp_workflow_id');
                    return query_1;
                }
                else {
                    return [];
                }
            })
                .then(function (expAssay2ReagentResults) {
                var results = { expWorkflowIds: [], expGroupIds: [], expGroups: [] };
                expAssay2ReagentResults.map(function (expAssay) {
                    results.expWorkflowIds.push(expAssay.exp_workflow_id);
                    results.expGroupIds.push(expAssay.treatment_group_id);
                    results.expGroups.push({ expWorkflowId: expAssay.exp_workflow_id, expGroupId: expAssay.treatment_group_id });
                });
                resolve(results);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
        else {
            resolve(null);
        }
    });
};
/**
 * Thank you stack overflow!
 * Find values that are in all arrays
 * In this case we run a bunch of searches on the expWorkflows
 * Then get Ids that are in common across all
 * @param arrays
 */
function getCommonElements(arrays) {
    var currentValues = {};
    var commonValues = {};
    for (var i = arrays[0].length - 1; i >= 0; i--) { //Iterating backwards for efficiency
        currentValues[arrays[0][i]] = 1; //Doesn't really matter what we set it to
    }
    for (var i = arrays.length - 1; i > 0; i--) {
        var currentArray = arrays[i];
        for (var j = currentArray.length - 1; j >= 0; j--) {
            if (currentArray[j] in currentValues) {
                commonValues[currentArray[j]] = 1; //Once again, the `1` doesn't matter
            }
        }
        currentValues = commonValues;
        commonValues = {};
    }
    return Object.keys(currentValues).map(function (value) {
        // return parseInt(value);
        return value;
    });
}
//# sourceMappingURL=ExpSetSearchByExpWorkflow.js.map