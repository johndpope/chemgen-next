"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var ExpSetTypes_1 = require("../../../../types/custom/ExpSetTypes");
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
    search = new ExpSetTypes_1.ExpSetSearch(search);
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
            if (workflowIds.length) {
                var commonWorkflowIds = getCommonElements(workflowIds);
                resolve(commonWorkflowIds);
            }
            else {
                resolve([]);
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
ExpSet.extract.getAllTemperatures = function (search) {
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
        if (!lodash_1.get(search, 'screenSearch')) {
            resolve(null);
        }
        else if (lodash_1.isArray(search.screenSearch) && lodash_1.isEmpty(search.screenSearch)) {
            resolve(null);
        }
        else {
            app.models.ExpScreenUploadWorkflow
                .find({
                where: {
                    screenId: { inq: search.screenSearch }
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
        if (!lodash_1.get(search.expWorkflowDeepSearch, 'temperature')) {
            resolve(null);
        }
        else {
            var temp = search.expWorkflowDeepSearch.temperature;
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
            app.models.ExpScreenUploadWorkflow.getDataSource()
                .connector.connect(function (error, db) {
                var collection = db.collection('ExpScreenUploadWorkflow');
                collection.find({ "temperature.$numberDouble": String(search.expWorkflowDeepSearch.temperature) }, function (error, results) {
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
 * Search by a range of temperatures
 * @param search
 */
ExpSet.extract.searchByTemperatureRange = function (search) {
    return new Promise(function (resolve, reject) {
        if (!lodash_1.get(search.expWorkflowDeepSearch, 'temperatureRange')) {
            resolve(null);
        }
        else {
            app.models.ExpScreenUploadWorkflow.getDataSource()
                .connector.connect(function (error, db) {
                var collection = db.collection('ExpScreenUploadWorkflow');
                var range = search.expWorkflowDeepSearch.temperatureRange.sort();
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
        if (!lodash_1.get(search.expWorkflowDeepSearch, 'wormStrains')) {
            resolve(null);
        }
        else {
            search.expWorkflowDeepSearch.wormStrains.map(function (wormStrain) {
                search.expWorkflowDeepSearch.wormStrains.push(String(wormStrain));
                search.expWorkflowDeepSearch.wormStrains.push(Number(wormStrain));
            });
            search.expWorkflowDeepSearch.wormStrains = lodash_1.uniq(search.expWorkflowDeepSearch.wormStrains);
            app.models.ExpScreenUploadWorkflow
                .find({
                where: {
                    'biosamples.experimentBiosample.id': { inq: search.expWorkflowDeepSearch.wormStrains }
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
 * Screen Stage is Primary or Secondary
 * @param search
 */
ExpSet.extract.searchByScreenStage = function (search) {
    return new Promise(function (resolve, reject) {
        if (!lodash_1.get(search.expWorkflowDeepSearch, 'screenStage')) {
            resolve(null);
        }
        else {
            app.winston.info("Searching for screenStage: " + search.expWorkflowDeepSearch.screenStage);
            app.models.ExpScreenUploadWorkflow
                .find({ where: { 'screenStage': search.expWorkflowDeepSearch.screenStage } })
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
    return new Promise(function (resolve, reject) {
        if (!lodash_1.get(search.expWorkflowDeepSearch, 'screenType')) {
            resolve(null);
        }
        else {
            app.models.ExpScreenUploadWorkflow
                .find({ where: { 'screenType': search.expWorkflowDeepSearch.screenType } })
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
ExpSet.extract.searchByInstrumentPlateIds = function (search) {
    return new Promise(function (resolve, reject) {
        if (!lodash_1.get(search.expWorkflowDeepSearch, 'instrumentPlateIds')) {
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
                                    "instrumentPlateId": { "$in": search.expWorkflowDeepSearch.instrumentPlateIds },
                                }
                            }
                        },
                        {
                            "experimentGroups.ctrl_rnai.plates": {
                                "$elemMatch": {
                                    "instrumentPlateId": { "$in": search.expWorkflowDeepSearch.instrumentPlateIds },
                                }
                            }
                        },
                        {
                            "experimentGroups.ctrl_strain.plates": {
                                "$elemMatch": {
                                    "instrumentPlateId": { "$in": search.expWorkflowDeepSearch.instrumentPlateIds },
                                }
                            }
                        },
                        {
                            "experimentGroups.ctrl_null.plates": {
                                "$elemMatch": {
                                    "instrumentPlateId": { "$in": search.expWorkflowDeepSearch.instrumentPlateIds },
                                }
                            }
                        },
                        {
                            "experimentGroups.treat_rnai.plates": {
                                "$elemMatch": {
                                    "platebarcode": { "$in": search.expWorkflowDeepSearch.instrumentPlateIds },
                                }
                            }
                        },
                        {
                            "experimentGroups.ctrl_rnai.plates": {
                                "$elemMatch": {
                                    "platebarcode": { "$in": search.expWorkflowDeepSearch.instrumentPlateIds },
                                }
                            }
                        },
                        {
                            "experimentGroups.ctrl_strain.plates": {
                                "$elemMatch": {
                                    "platebarcode": { "$in": search.expWorkflowDeepSearch.instrumentPlateIds },
                                }
                            }
                        },
                        {
                            "experimentGroups.ctrl_null.plates": {
                                "$elemMatch": {
                                    "platebarcode": { "$in": search.expWorkflowDeepSearch.instrumentPlateIds },
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
        search.rnaiSearch = lodash_1.compact(search.rnaiSearch);
        if (search.rnaiSearch.length) {
            app.models.RnaiLibrary.extract.workflows
                .getRnaiLibraryFromUserGeneList(search.rnaiSearch, search)
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
        search.rnaiSearch = lodash_1.compact(search.rnaiSearch);
        if (search.rnaiSearch.length) {
            app.models.RnaiLibrary.extract.workflows
                .getRnaiLibraryFromUserGeneList(search.rnaiSearch, search)
                .then(function (rnaiLibraryResults) {
                var query = knex('exp_assay2reagent')
                    .distinct('treatment_group_id');
                rnaiLibraryResults.map(function (rnaiLibraryResult) {
                    query
                        .orWhere({ library_id: rnaiLibraryResult.libraryId, reagent_id: rnaiLibraryResult.rnaiId });
                });
                query.andWhere({ reagent_type: 'treat_rnai' });
                query.select('exp_workflow_id');
                return query;
            })
                .then(function (expAssay2ReagentResults) {
                resolve(expAssay2ReagentResults);
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