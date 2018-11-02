"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var lodash_1 = require("lodash");
var Promise = require("bluebird");
var ExpSetTypes_1 = require("../../../types/custom/ExpSetTypes");
var config = require("config");
var redis = require("redis");
// @ts-ignore
Promise.promisifyAll(redis);
var redisClient = redis.createClient(config.get('redisUrl'));
//@ts-ignore
var ExpSet = app.models.ExpSet;
/**
 * Grab ExpSets by workflowId - this is the the most optimized function if there is no geneList/chemicalList
 * @param {ExpSetSearch} search
 */
ExpSet.extract.workflows.getExpSetsByWorkflowId = function (search) {
    return new Promise(function (resolve, reject) {
        //Since the result is already very large - the pageSize is 1
        search.pageSize = 1;
        search = new ExpSetTypes_1.ExpSetSearch(search);
        var data = new ExpSetTypes_1.ExpSetSearchResults({});
        app.winston.info("Search: " + JSON.stringify(search));
        var or = ExpSet.extract.buildQueryExpWorkflow(data, search);
        var searchQuery = {
            limit: search.pageSize,
            skip: search.skip,
        };
        if (or && or.length) {
            searchQuery.where = { or: or };
        }
        ExpSet.extract.buildExpWorkflowPaginationData(data, search)
            .then(function (data) {
            return app.models.ExpScreenUploadWorkflow
                .find(searchQuery);
        })
            .then(function (expWorkflows) {
            data.expWorkflows = expWorkflows;
            if (!data.expWorkflows || !data.expWorkflows.length) {
                resolve();
            }
            else {
                data.expWorkflows = lodash_1.compact(expWorkflows);
                return ExpSet.extract.fetchFromCache(data, search, String(data.expWorkflows[0].id));
            }
        })
            .then(function (data) {
            // Check to see if it was fetched from the cache
            if (!data.fetchedFromCache) {
                return ExpSet.extract.getExpDataByExpWorkflowId(data, search, String(data.expWorkflows[0].id));
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
            data = ExpSet.extract.insertCountsDataImageMeta(data);
            data = ExpSet.extract.insertExpManualScoresImageMeta(data);
            data = ExpSet.extract.cleanUp(data, search);
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.buildQueryExpWorkflow = function (data, search) {
    var expOr = ['screen', 'expWorkflow'].map(function (searchType) {
        if (!lodash_1.isEmpty(search[searchType + "Search"])) {
            var searchObject = {};
            if (searchType.match('expWorkflow')) {
                searchObject["id"] = { inq: search[searchType + "Search"] };
            }
            else {
                searchObject[searchType + "Id"] = { inq: search[searchType + "Search"] };
            }
            return searchObject;
        }
    }).filter(function (or) {
        return or;
    });
    return expOr;
};
/**
 * This builds pagination for the amount of expWorkflows
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.buildExpWorkflowPaginationData = function (data, search) {
    return new Promise(function (resolve, reject) {
        var or = app.models.ExpSet.extract.buildQueryExpWorkflow(data, search);
        var searchObj = {};
        if (or && or.lenth) {
            searchObj.or = or;
        }
        // data.pageSize = 1;
        // let expScreen :ExpScreenUploadWorkflowResultSet;
        app.paginateModel('ExpScreenUploadWorkflow', searchObj, 1)
            .then(function (pagination) {
            data.currentPage = search.currentPage;
            data.skip = search.skip;
            data.pageSize = search.pageSize;
            data.totalPages = pagination.totalPages;
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
ExpSet.extract.getModelPredictedCountsByExpWorkflowId = function (data, search) {
    return new Promise(function (resolve, reject) {
        app.models.ModelPredictedCounts
            .find({
            where: {
                expWorkflowId: data.expWorkflows[0].id,
            }
        })
            .then(function (modelPredictedCounts) {
            data.modelPredictedCounts = modelPredictedCounts;
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
ExpSet.extract.getExpManualScoresByExpWorkflowId = function (data, search) {
    return new Promise(function (resolve, reject) {
        app.models.ExpManualScores
            .find({
            where: {
                expWorkflowId: data.expWorkflows[0].id,
            }
        })
            .then(function (expManualScores) {
            data.expManualScores = expManualScores;
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
ExpSet.extract.getExpAssay2reagentsByExpWorkflowId = function (data, search) {
    return new Promise(function (resolve, reject) {
        if (!data.expAssay2reagents || !data.expAssay2reagents.length) {
            resolve(data);
        }
        else {
            app.models.ExpAssay2reagent
                .find({
                where: {
                    and: [{ expWorkflowId: data.expAssay2reagents[0].expWorkflowId },
                        { reagentId: { neq: null } },
                    ]
                },
                fields: {
                    treatmentGroupId: true,
                    assay2reagentId: true,
                    expGroupId: true,
                    assayId: true,
                    reagentId: true,
                    libraryId: true,
                    reagentType: true,
                    reagentTable: true,
                },
            })
                .then(function (expAssay2reagents) {
                var groups = lodash_1.groupBy(expAssay2reagents, 'reagent_type');
                //TODO Add preferentially get ctrls from the same plate
                ['ctrl_null', 'ctrl_strain'].map(function (expGroupType) {
                    groups[expGroupType] = lodash_1.shuffle(groups[expGroupType]);
                    groups[expGroupType] = groups[expGroupType].slice(0, search.ctrlLimit);
                });
                Object.keys(groups).map(function (expGroupType) {
                    groups[expGroupType].map(function (expAssay2reagent) {
                        data.expAssay2reagents.push(expAssay2reagent);
                    });
                });
                return data;
            })
                .catch(function (error) {
                app.winston.error(error);
                reject(new Error(error));
            });
        }
    });
};
/**
 * This is the main workflow to get the Data
 * It includes ExpPlates, ExpScreens, ExpScreenWorkflows
 * Counts and Scores are separate
 * @param data
 * @param search
 * @param expWorkflowId
 */
ExpSet.extract.getExpDataByExpWorkflowId = function (data, search, expWorkflowId) {
    return new Promise(function (resolve, reject) {
        app.models.ExpAssay2reagent
            .find({
            where: {
                and: [
                    { expWorkflowId: expWorkflowId },
                    { expGroupId: { neq: null } },
                ]
            },
            //This is the main exp table, so we include everything here
            fields: {
                treatmentGroupId: true,
                assay2reagentId: true,
                expGroupId: true,
                plateId: true,
                assayId: true,
                reagentId: true,
                libraryId: true,
                reagentType: true,
                screenId: true,
                reagentTable: true,
                expWorkflowId: true,
            },
        })
            .then(function (expAssay2reagents) {
            data.expAssay2reagents = expAssay2reagents;
            return data;
        })
            .then(function (data) {
            return app.models.ExpAssay
                .find({
                where: {
                    and: [
                        { expWorkflowId: expWorkflowId },
                        { expGroupId: { neq: null } },
                    ]
                },
                fields: {
                    assayWell: true,
                    assayId: true,
                    assayImagePath: true,
                    expGroupId: true,
                    plateId: true,
                    screenId: true,
                    expWorkflowId: true,
                },
            });
        })
            .then(function (expAssays) {
            data.expAssays = expAssays;
            return data;
        })
            .then(function (data) {
            return app.models.ExpPlate
                .find({
                where: {
                    expWorkflowId: expWorkflowId,
                }
            });
        })
            .then(function (expPlates) {
            data.expPlates = expPlates;
            return data;
        })
            .then(function (data) {
            return app.models.ModelPredictedCounts
                .find({
                where: {
                    expWorkflowId: expWorkflowId
                }
            });
        })
            .then(function (modelPredictedCounts) {
            data.modelPredictedCounts = modelPredictedCounts;
            return data;
        })
            .then(function (data) {
            return app.models.ExpScreen
                .findOne({
                where: { screenId: data.expAssay2reagents[0].screenId },
                fields: {
                    screenId: true,
                    screenName: true,
                    screenType: true,
                    screenStage: true,
                }
            });
        })
            .then(function (expScreens) {
            data.expScreens = [expScreens];
            return data;
        })
            .then(function (data) {
            return app.models.ExpScreenUploadWorkflow
                .findOne({
                where: { id: expWorkflowId },
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
            .then(function (expScreenWorkflow) {
            data.expWorkflows = [expScreenWorkflow];
            return ExpSet.extract.getExpDesignsByExpWorkflowId(data, search);
        })
            .then(function (data) {
            try {
                return ExpSet.extract.genExpSetAlbums(data, search);
            }
            catch (error) {
                app.winston.error("Error genExpSetAlbums");
                app.winston.error(error);
                return data;
            }
        })
            .then(function (data) {
            return ExpSet.extract.workflows.getReagentData(data, search);
        })
            .then(function (data) {
            data = ExpSet.extract.genExpGroupTypeAlbums(data, search);
            return ExpSet.extract.saveToCache(data, search);
        })
            .then(function (data) {
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error("Error in getExpDataByWorkflowId");
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
ExpSet.extract.fetchFromCache = function (data, search, expWorkflowId) {
    return new Promise(function (resolve, reject) {
        //TODO Should just pass ine ither the key or the expWorkflowId
        var key = "expSets-expWorkflowId-" + expWorkflowId;
        redisClient.getAsync(key)
            .then(function (obj) {
            if (obj) {
                data = JSON.parse(obj);
                data.fetchedFromCache = true;
                // data.fetchedFromCache = false;
                resolve(data);
            }
            else {
                data.fetchedFromCache = false;
                resolve(data);
            }
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
ExpSet.extract.saveToCache = function (data, search) {
    return new Promise(function (resolve, reject) {
        var key = "expSets-expWorkflowId-" + data.expWorkflows[0].id;
        redisClient.set(key, JSON.stringify(data), 'EX', 60 * 60 * 24, function (err, reply) {
            resolve(data);
        });
    });
};
ExpSet.extract.getExpDesignsByExpWorkflowId = function (data, search) {
    return new Promise(function (resolve, reject) {
        app.models.ExpDesign
            .find({ where: { expWorkflowId: data.expPlates[0].expWorkflowId } })
            .then(function (expDesigns) {
            var groups = lodash_1.groupBy(expDesigns, 'treatmentGroupId');
            data.expSets = Object.keys(groups).map(function (treatmentGroupId) {
                return groups[treatmentGroupId];
            });
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ExpSetExtractQueryByExpWorkflow.js.map