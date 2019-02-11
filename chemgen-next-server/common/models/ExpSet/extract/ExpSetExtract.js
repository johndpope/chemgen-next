"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var lodash_1 = require("lodash");
var Promise = require("bluebird");
var index_1 = require("../../../types/custom/ExpSetTypes/index");
var config = require("config");
var ExpSet = app.models.ExpSet;
/**
 * ExpSet.extract.workflows.getExpSets is a wrapper around a bunch of other api points
 * @param data
 * @param search
 */
ExpSet.extract.workflows.getExpSets = function (search) {
    return new Promise(function (resolve, reject) {
        search = new index_1.ExpSetSearch(search);
        app.winston.info('In getExpSets!!!');
        app.winston.info("A: Search : " + JSON.stringify(search));
        var data = new index_1.ExpSetSearchResults({});
        if (search.scoresQuery) {
            app.winston.info('Getting scores by scoresQuery');
            resolve(ExpSet.extract.workflows.filterByScores(search));
        }
        else if (lodash_1.isEqual(search.scoresExist, true)) {
            //search.scoresExist is a boolean value to say whether or not there exists an entry in the exp_manual_scores for a given treatmentGroupId
            //It does not do any further filtering
            //It uses the knex api, because it executes a nested select if exists, which is not possible through the loopback api
            app.winston.info('Get UnscoredExpSets');
            resolve(ExpSet.extract.workflows.getUnscoredExpSet(search));
        }
        else if (lodash_1.isEqual(search.scoresExist, false)) {
            app.winston.info('ScoresExistIsFalse!');
            resolve(ExpSet.extract.workflows.getUnscoredExpSetsByPlate(search));
        }
        else if (!lodash_1.isEmpty(search.rnaiSearch)) {
            //Search the RnaiLibrary Api
            app.winston.info('Getting ExpSets by RNAi List');
            resolve(app.models.RnaiExpSet.extract.workflows.getExpSetsByGeneList(search));
        }
        else if (lodash_1.isEqual(search.scoresExist, null) && !(lodash_1.isEmpty(search.chemicalSearch))) {
            //Place holder - I haven't written in this one yet
            resolve();
        }
        else if (search.expGroupSearch.length) {
            // ExpSet.extract.searchExpAssay2reagents = function (search: ExpSetSearch) {
            app.winston.info('Getting ExpSets by expGroupId');
            resolve(ExpSet.extract.searchExpAssay2reagents(search));
        }
        else {
            //Get all the expSets for a single expWorkflowId
            search.pageSize = 1;
            //Return the expSet
            app.winston.info('Getting the ExpSetsByWorkflowId');
            resolve(ExpSet.extract.workflows.getExpSetsByWorkflowId(search));
        }
    });
};
/**
 * Build the 'where' manualScoresAdvancedQuery against the ExpAssay2reagent table (the main experiment table)
 * You need to use this function if you are querying against a specific set of genes or chemicals
 * Otherwise use the ExpWorkflowFunctions
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 * @returns {any[]}
 */
ExpSet.extract.buildQuery = function (data, search) {
    var or = [];
    var expOr = ['screen', 'expWorkflow', 'plate', 'expGroup', 'assay'].map(function (searchType) {
        if (!lodash_1.isEmpty(search[searchType + "Search"])) {
            var searchObject = {};
            searchObject[searchType + "Id"] = { inq: search[searchType + "Search"] };
            return searchObject;
        }
    }).filter(function (or) {
        return or;
    });
    if (!lodash_1.isEmpty(data.rnaisList) && !lodash_1.isEmpty(data.compoundsList)) {
        var searchType = 'library';
        if (!lodash_1.isEmpty(search[searchType + "Search"])) {
            var searchObject = {};
            searchObject[searchType + "Id"] = { inq: search[searchType + "Search"] };
            expOr.push(searchObject);
        }
    }
    return ExpSet.extract.buildReagentQuery(data, or, expOr);
};
ExpSet.extract.buildAssayDataQuery = function (data, search) {
    var or = [];
    var expOr = ['plate', 'expGroup', 'assay'].map(function (searchType) {
        if (!lodash_1.isEmpty(search[searchType + "Search"])) {
            var searchObject = {};
            searchObject[searchType + "Id"] = { inq: search[searchType + "Search"] };
            return searchObject;
        }
    }).filter(function (or) {
        return or;
    });
    return or;
};
ExpSet.extract.buildScreenDataQuery = function (data, search) {
    var or = [];
    var expOr = ['screen', 'expWorkflow'].map(function (searchType) {
        if (!lodash_1.isEmpty(search[searchType + "Search"])) {
            var searchObject = {};
            searchObject[searchType + "Id"] = { inq: search[searchType + "Search"] };
            return searchObject;
        }
    }).filter(function (or) {
        return or;
    });
    return expOr;
};
ExpSet.extract.buildReagentQuery = function (data, or, expOr) {
    ['rnai', 'compounds'].map(function (reagentType) {
        if (!lodash_1.isEmpty(data[reagentType + "sList"])) {
            data[reagentType + "sList"].map(function (Row) {
                var obj = {
                    and: [
                        { reagentId: Row[reagentType + "Id"] },
                        { libraryId: Row.libraryId },
                    ]
                };
                expOr.map(function (exp) {
                    obj.and.push(exp);
                });
                or.push(obj);
            });
        }
        else {
            var obj_1 = {
                and: []
            };
            expOr.map(function (exp) {
                obj_1.and.push(exp);
            });
            or.push(obj_1);
        }
    });
    return or;
};
ExpSet.extract.buildExpAssay2reagentSearch = function (data, search) {
    var or = ExpSet.extract.buildQuery(data, search);
    return {
        where: { or: or, reagentId: { 'neq': null } },
        limit: data.pageSize,
        skip: data.skip,
        // skip: search.currentPage * search.pageSize,
        fields: {
            assay2reagentId: true,
            reagentType: true,
            expGroupId: true,
            plateId: true,
            assayId: true,
            reagentId: true,
            libraryId: true,
            reagentTable: true,
        },
    };
};
/**
 * ExpSet.extract.buildExpSetsByExpWorkflowId
 * Building the expSet with a single exp_workflow_id is much faster than using the individual assay_ids
 * So if there are no explicit criteria for returning a set of genes or chemicals, then this is the go to workflow
 * Also generate an expSet for use in the interface
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.buildExpSetsByExpWorkflowId = function (data, search, expWorkflowId) {
    return new Promise(function (resolve, reject) {
        if (!expWorkflowId) {
            resolve(data);
        }
        ExpSet.extract.fetchFromCache(data, search, expWorkflowId)
            .then(function (data) {
            // Check to see if it was fetched from the cache
            if (!data.fetchedFromCache && expWorkflowId) {
                return ExpSet.extract.getExpDataByExpWorkflowId(data, search, expWorkflowId);
            }
            else {
                return data;
            }
        })
            .then(function (data) {
            return ExpSet.extract.getExpManualScoresByExpWorkflowId(data, search);
        })
            .then(function (data) {
            if (!lodash_1.isEqual(data.modelPredictedCounts.length, data.expAssays.length)) {
                return ExpSet.extract.getModelPredictedCountsByExpWorkflowId(data, search);
            }
            else {
                return data;
            }
        })
            .then(function (data) {
            data = ExpSet.extract.genExpSetAlbums(data, search);
            data = ExpSet.extract.genExpGroupTypeAlbums(data, search);
            data = ExpSet.extract.insertCountsDataImageMeta(data);
            data = ExpSet.extract.insertExpManualScoresImageMeta(data);
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * This is the main workflow
 * Once we have a set of expAssay2reagents, get the corresponding expAssays, includeCounts, expPlates, expScreens, and expWorkflows
 * Also generate an expSet for use in the interface
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.buildExpSets = function (data, search) {
    return new Promise(function (resolve, reject) {
        //TODO Ensure there are expAssayIds!
        if (lodash_1.isEmpty(data.expAssay2reagents) || !lodash_1.isArray(data.expAssay2reagents)) {
            app.winston.error(JSON.stringify(data, null, 2));
            resolve(data);
        }
        // This ONLY returns the treat_rnai and ctrl_rnai  expGroups
        // ctrl_null and ctrl_strain are L4440s and don't have a reagentId
        app.models.ExpAssay
            .find({
            where: {
                assayId: {
                    inq: data.expAssay2reagents.map(function (expAssay2reagent) {
                        return expAssay2reagent.assayId;
                    })
                }
            },
            fields: {
                screenId: true,
                expWorkflowId: true,
                expGroupId: true,
                assayImagePath: true,
                plateId: true,
                assayId: true
            },
        })
            .then(function (results) {
            //TODO if returning includeCounts also return ExpAssay is redundent
            // data['expAssays'] = contactSheetResults;
            data.expAssays = results;
            var expGroupIds = results.map(function (expAssay) {
                return { expGroupId: expAssay.expGroupId };
            });
            return app.models.ExpDesign.extract.workflows.getExpSets(expGroupIds);
        })
            .then(function (results) {
            data.expSets = results.expDesigns;
            return ExpSet.extract.sanityChecks(data, search);
        })
            .then(function (results) {
            return ExpSet.extract.getCounts(results, search);
        })
            .then(function (results) {
            return ExpSet.extract.getExpManualScoresByExpGroupId(results, search);
        })
            .then(function (results) {
            return ExpSet.extract.workflows.getReagentData(results, search);
        })
            .then(function (results) {
            return ExpSet.extract.getExpData(results, search);
        })
            .then(function (data) {
            data = ExpSet.extract.genExpSetAlbums(data, search);
            data = ExpSet.extract.genExpGroupTypeAlbums(data, search);
            data = ExpSet.extract.insertCountsDataImageMeta(data);
            data = ExpSet.extract.insertExpManualScoresImageMeta(data);
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error('Error building expSets');
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
ExpSet.extract.getExpManualScoresByExpGroupId = function (data, search) {
    return new Promise(function (resolve, reject) {
        if (lodash_1.isArray(data.expAssay2reagents) && data.expAssay2reagents.length) {
            app.models.ExpManualScores
                .find({
                where: {
                    treatmentGroupId: {
                        inq: data.expAssay2reagents.map(function (expAssay2reagent) {
                            return expAssay2reagent.expGroupId;
                        }).filter(function (expGroupId) {
                            return expGroupId;
                        })
                    }
                }
            })
                .then(function (expManualScores) {
                data.expManualScores = expManualScores;
                resolve(data);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
        else {
            resolve(data);
        }
    });
};
/**
 * Depending on how the search is run (genes list, expGroup, etc)
 * We may be missing different pieces of data
 * For instance if we search by expGroup=1, up to here only expAssay2Reagent with expGroup=1 will be returned
 * Or if searching for genes we won't have any L4440s
 * So this is a very brute force approach to ensure there is no data missing
 * But we want the whole expSet
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.sanityChecks = function (data, search) {
    return new Promise(function (resolve, reject) {
        // This gets the ctrl_null and ctrl_strain includeCounts
        var ctrlExpGroupIds = [];
        var treatExpGroupIds = [];
        if (lodash_1.isArray(data.expSets)) {
            data.expSets.map(function (expSet) {
                expSet.map(function (expDesign) {
                    ctrlExpGroupIds.push({ expGroupId: expDesign.controlGroupId });
                    treatExpGroupIds.push({ expGroupId: expDesign.treatmentGroupId });
                });
            });
        }
        ctrlExpGroupIds = lodash_1.uniqBy(ctrlExpGroupIds, 'expGroupId');
        // @ts-ignore
        Promise.map(ctrlExpGroupIds, function (ctrlExpGroupId) {
            return app.models.ExpAssay
                .find({
                where: ctrlExpGroupId,
                limit: 10,
                fields: {
                    plateId: true,
                    screenId: true,
                    expWorkflowId: true,
                    expGroupId: true,
                    assayImagePath: true,
                    assayId: true
                },
            })
                .then(function (results) {
                results = lodash_1.shuffle(results);
                results = lodash_1.slice(results, 0, search.ctrlLimit);
                results.map(function (result) {
                    data.expAssays.push(result);
                });
                return;
            })
                .catch(function (error) {
                app.winston.error(error);
                return new Error(error);
            });
        })
            .then(function () {
            return app.models.ExpAssay
                .find({
                where: {
                    expGroupId: {
                        inq: treatExpGroupIds.map(function (expGroup) {
                            return expGroup.expGroupId;
                        }),
                    }
                }
            });
        })
            .then(function (expAssays) {
            expAssays.map(function (expAssay) {
                data.expAssays.push(expAssay);
            });
            data.expAssays = lodash_1.uniqBy(data.expAssays, 'assayId');
        })
            .then(function () {
            return app.models.ExpAssay2reagent
                .find({
                where: {
                    assayId: {
                        inq: data.expAssays.map(function (expAssay) {
                            return expAssay.assayId;
                        }),
                    },
                    reagentId: { 'neq': null }
                },
                fields: {
                    screenId: true,
                    expWorkflowId: true,
                    treatmentGroupId: true,
                    assay2reagentId: true,
                    expGroupId: true,
                    plateId: true,
                    assayId: true,
                    reagentId: true,
                    libraryId: true,
                    reagentType: true,
                    reagentTable: true,
                },
            });
        })
            .then(function (results) {
            results.map(function (result) {
                data.expAssay2reagents.push(result);
            });
            data.expAssay2reagents = lodash_1.uniqBy(data.expAssay2reagents, 'assay2reagentId');
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
/**
 * Get the experimental data for this
 * ExpPlate, expScreen, and batchName
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.getExpData = function (data, search) {
    return new Promise(function (resolve, reject) {
        app.models.ExpPlate
            .find({
            where: {
                plateId: {
                    inq: data.expAssays.map(function (expAssay) {
                        return expAssay.plateId;
                    }),
                }
            },
            fields: {
                plateId: true,
                instrumentPlateId: true,
                temperature: true,
                screenId: true,
                expWorkflowId: true,
                barcode: true,
            }
        })
            .then(function (expPlateResults) {
            data.expPlates = expPlateResults;
            return app.models.ExpScreen
                .find({
                where: {
                    screenId: {
                        inq: data.expPlates.map(function (expPlate) {
                            return expPlate.screenId;
                        })
                    }
                }
            });
        })
            .then(function (expScreenResults) {
            data.expScreens = expScreenResults;
            return app.models.ExpScreenUploadWorkflow
                .find({
                where: {
                    id: {
                        inq: data.expAssays.map(function (expAssay) {
                            return expAssay.expWorkflowId;
                        })
                    }
                },
                fields: {
                    id: true,
                    name: true,
                    screenId: true,
                    biosamples: true,
                    assayDates: true,
                    temperature: true,
                    screenType: true,
                    screenStage: true
                }
            });
        })
            .then(function (expWorkflowResults) {
            data.expWorkflows = expWorkflowResults;
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
ExpSet.extract.getCounts = function (data, search) {
    return new Promise(function (resolve, reject) {
        app.models.ModelPredictedCounts
            .find({
            where: {
                assayId: {
                    inq: data.expAssays.map(function (expAssay) {
                        return expAssay.assayId;
                    }),
                }
            }
        })
            .then(function (results) {
            data.modelPredictedCounts = results;
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
/**
 * TODO ADD in a function that will preferentially look for ctrls from the same plate
 * Then from the same date
 * Then just from the expSet
 * @param data
 * @param search
 */
ExpSet.extract.genExpSetAlbums = function (data, search) {
    if (lodash_1.isArray(data.expSets)) {
        data.expSets.map(function (expSet) {
            var album = {};
            album.expWorkflowId = expSet[0].expWorkflowId;
            album.treatmentReagentId = expSet[0].treatmentGroupId;
            album.treatmentGroupId = expSet[0].treatmentGroupId;
            var expWorkflow = lodash_1.find(data.expWorkflows, { id: String(expSet[0].expWorkflowId) });
            var site = lodash_1.get(expWorkflow, 'site') || config.get('site');
            try {
                album.ctrlReagentId = lodash_1.find(expSet, function (set) {
                    return lodash_1.isEqual(set.controlGroupReagentType, 'ctrl_rnai') || lodash_1.isEqual(set.controlGroupReagentType, 'ctrl_compound') || lodash_1.isEqual(set.controlGroupReagentType, 'ctrl_chemical');
                }).controlGroupId;
            }
            catch (error) {
                // app.winston.error('There is no ctrl for the reagent!');
            }
            try {
                album.ctrlStrainId = lodash_1.find(expSet, function (set) {
                    return lodash_1.isEqual(set.controlGroupReagentType, 'ctrl_strain');
                }).controlGroupId;
            }
            catch (error) {
                // app.winston.error('There is no ctrl strain');
            }
            try {
                album.ctrlNullId = lodash_1.find(expSet, function (set) {
                    return lodash_1.isEqual(set.controlGroupReagentType, 'ctrl_null');
                }).controlGroupId;
            }
            catch (error) {
                // app.winston.error('There is no ctrl null');
            }
            ['treatmentReagent', 'ctrlReagent', 'ctrlStrain', 'ctrlNull'].map(function (expGroupType) {
                album[expGroupType + "Images"] = data.expAssays.filter(function (expAssay) {
                    return lodash_1.isEqual(expAssay.expGroupId, album[expGroupType + "Id"]);
                }).map(function (expAssay) {
                    return ExpSet.extract["buildImageObj" + site](expAssay);
                });
                album[expGroupType + "Images"] = lodash_1.uniqBy(album[expGroupType + "Images"], 'assayImagePath');
            });
            ['ctrlNullImages', 'ctrlStrainImages'].map(function (ctrlKey) {
                if (lodash_1.get(album, ctrlKey)) {
                    album[ctrlKey] = lodash_1.shuffle(album[ctrlKey]).slice(0, 4);
                }
            });
            data.albums.push(album);
        });
    }
    return data;
};
/**
 * At the end of every workflow get all the reagent Data - RnaiLibrary or Chemical Library Data
 * @param data
 * @param search
 */
ExpSet.extract.workflows.getReagentData = function (data, search) {
    var reagentTypes = lodash_1.groupBy(data.expAssay2reagents, 'reagentTable');
    delete reagentTypes['undefined'];
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        Promise.map(Object.keys(reagentTypes), function (reagentType) {
            if (reagentType) {
                return ExpSet.extract.workflows["getReagentData" + reagentType](data, reagentTypes[reagentType]);
            }
            else {
                return;
            }
        })
            .then(function () {
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.getReagentDataChemicalLibraryStock = function (data, expAssay2reagents) {
    return new Promise(function (resolve, reject) {
        var orSearch = {};
        var or = [];
        if (lodash_1.isArray(expAssay2reagents)) {
            expAssay2reagents.map(function (expAssay2reagent) {
                if (expAssay2reagent.reagentId) {
                    //TODO There is a bug in some of these uploads that the libraryId is 1 instead of whatever it should be
                    //But the reagentId is uniqueue anyways
                    or.push({ and: [{ compoundId: expAssay2reagent.reagentId }] });
                }
            });
            orSearch = { or: or };
        }
        else {
            orSearch = {};
        }
        app.models.ChemicalLibrary
            .find({
            where: orSearch,
        })
            .then(function (results) {
            data.compoundsList = results;
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.getReagentDataRnaiLibraryStock = function (data, expAssay2reagents) {
    return new Promise(function (resolve, reject) {
        var orSearch = {};
        var or = [];
        if (lodash_1.isArray(expAssay2reagents)) {
            or = expAssay2reagents.map(function (expAssay2reagent) {
                return { and: [{ rnaiId: expAssay2reagent.reagentId }, { libraryId: expAssay2reagent.libraryId }] };
            });
            orSearch = { or: or };
        }
        app.models.RnaiLibrary
            .find({
            where: orSearch,
        })
            .then(function (results) {
            data.rnaisList = results;
            return app.models.RnaiWormbaseXrefs
                .find({
                where: {
                    wbGeneSequenceId: {
                        inq: data.rnaisList.map(function (rnai) {
                            return rnai.geneName;
                        })
                    }
                },
                fields: {
                    wbGeneSequenceId: true,
                    wbGeneAccession: true,
                    wbGeneCgcName: true,
                },
                limit: 1000,
            });
        })
            .then(function (results) {
            data.rnaisXrefs = results;
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * Build the image URLS based on the site
 * By default the
 * @param expAssay
 */
ExpSet.extract.buildImageObjDEV = function (expAssay) {
    return {
        assayImagePath: expAssay.assayImagePath,
        src: config.get('sites')['DEV']['imageUrl'] + "/" + expAssay.assayImagePath + "-autolevel.jpeg",
        caption: "Image " + expAssay.assayImagePath + " caption here",
        thumb: config.get('sites')['DEV']['imageUrl'] + "/" + expAssay.assayImagePath + "-autolevel.jpeg",
        assayId: expAssay.assayId,
        plateId: expAssay.plateId,
    };
};
ExpSet.extract.buildImageObjAD = function (expAssay) {
    return {
        assayImagePath: expAssay.assayImagePath,
        src: config.get('sites')['AD']['imageUrl'] + "/" + expAssay.assayImagePath + "-autolevel.jpeg",
        caption: "Image " + expAssay.assayImagePath + " caption here",
        thumb: config.get('sites')['DEV']['imageUrl'] + "/" + expAssay.assayImagePath + "-autolevel.jpeg",
        assayId: expAssay.assayId,
        plateId: expAssay.plateId,
    };
};
ExpSet.extract.buildImageObjNY = function (expAssay) {
    return {
        assayImagePath: expAssay.assayImagePath,
        src: config.get('sites')['NY']['imageUrl'] + "/" + expAssay.assayImagePath + ".jpeg",
        caption: "Image " + expAssay.assayImagePath + " caption here",
        thumb: config.get('sites')['NY']['imageUrl'] + "/" + expAssay.assayImagePath + ".jpeg",
        assayId: expAssay.assayId,
        plateId: expAssay.plateId,
    };
};
//# sourceMappingURL=ExpSetExtract.js.map