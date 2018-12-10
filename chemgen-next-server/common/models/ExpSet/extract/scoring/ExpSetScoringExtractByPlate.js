"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var ExpSetTypes_1 = require("../../../../types/custom/ExpSetTypes");
var config = require("config");
var knex = config.get('knex');
var redis = require("redis");
// @ts-ignore
Promise.promisifyAll(redis);
var redisClient = redis.createClient(config.get('redisUrl'));
var ExpSet = app.models.ExpSet;
/**
 * This is the API used by the contact-sheet
 * Grab ExpSets that do not have a manual score and organize by plate
 * This one is a little different from the other ExpSet function, which assume that the user wants to see all the replicates together
 * Instead the user independently scores each plate
 * So we can just use the expWorkflowId to do all the lookups
 * This is not same as the others - where we may be searching for a gene/chemical across all the screens
 * @param {ExpSetSearch} search
 */
ExpSet.extract.workflows.getUnscoredExpSetsByPlate = function (search) {
    return new Promise(function (resolve, reject) {
        app.winston.info("B: " + JSON.stringify(search));
        search = new ExpSetTypes_1.ExpSetSearch(search);
        app.winston.info("A: " + JSON.stringify(search));
        var data = new ExpSetTypes_1.ExpSetSearchResults({});
        data.pageSize = 1;
        var sqlQuery = ExpSet.extract.buildNativeQueryExpWorkflowId(data, search, false);
        sqlQuery = sqlQuery.count();
        app.winston.info("SqlQuery Count: " + sqlQuery.toString());
        ExpSet.extract.buildUnscoredPaginationData(data, search, sqlQuery.toString())
            .then(function (data) {
            //TODO Should preferentially get plates, and if no plates are found THEN look for assays
            if (!data.totalPages) {
                app.winston.info("No total pages!");
                resolve(data);
            }
            else {
                return ExpSet.extract.workflows.getExpPlatesByScores(data, search, search.scoresExist)
                    .then(function (data) {
                    if (!data.expPlates || !data.expPlates.length) {
                        resolve(data);
                    }
                    else {
                        return ExpSet.extract.buildExpSetsByExpWorkflowId(data, search, data.expPlates[0].expWorkflowId);
                    }
                })
                    .then(function (data) {
                    try {
                        data = ExpSet.extract.insertExpManualScoresImageMeta(data);
                    }
                    catch (error) {
                        app.winston.error(error);
                    }
                    data = ExpSet.extract.genAlbumsByPlate(data, search);
                    data = ExpSet.extract.cleanUp(data, search);
                    return data;
                });
            }
        })
            .then(function (data) {
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.getExpPlatesByScores = function (data, search, scoresExist) {
    return new Promise(function (resolve, reject) {
        var sqlQuery = ExpSet.extract.buildNativeQueryExpWorkflowId(data, search, scoresExist);
        sqlQuery = sqlQuery
            .limit(1000);
        var ds = app.datasources.chemgenDS;
        app.winston.info(JSON.stringify(sqlQuery.toString()));
        ds.connector.execute(sqlQuery.toString(), [], function (error, rows) {
            if (error) {
                app.winston.error(error);
                return reject(new Error(error));
            }
            else {
                rows.map(function (rawRowData) {
                    Object.keys(rawRowData).map(function (rowKey) {
                        rawRowData[lodash_1.camelCase(rowKey)] = rawRowData[rowKey];
                        delete rawRowData[rowKey];
                    });
                });
                data.skip = data.skip + data.pageSize;
                // rowData = compact(rowData);
                // app.winston.info(JSON.stringify(rowData));
                if (rows.length) {
                    data.expPlates = [lodash_1.shuffle(rows)[0]];
                }
                else {
                    data.expPlates = [];
                }
                return resolve(data);
            }
        });
    });
};
//TODO Add in preferentially choose ctrls from the same plate , then same date
ExpSet.extract.genExpGroupTypeAlbums = function (data, search) {
    //For the expSet albums limit to 4
    var map = {
        'ctrlNullImages': 'ctrlReagentImages',
        'ctrlStrainImages': 'treatReagentImages',
    };
    data.albums.map(function (album) {
        ['ctrlNullImages', 'ctrlStrainImages'].map(function (albumType) {
            // expSet[albumType] = shuffle(expSet[albumType].slice(0, search.ctrlLimit));
        });
    });
    var expGroupTypes = lodash_1.groupBy(data.expAssay2reagents, 'reagentType');
    Object.keys(expGroupTypes).map(function (expGroup) {
        var mappedExpGroup = ExpSet.extract.mapExpGroupTypes(expGroup);
        // app.winston.info(`MappedExpGroup: ${mappedExpGroup} ExpGroupType: ${expGroup}`);
        expGroupTypes[mappedExpGroup] = ExpSet.extract.genImageMeta(data, expGroupTypes[expGroup]);
        if (lodash_1.isEqual(mappedExpGroup, 'ctrlNull') || lodash_1.isEqual(mappedExpGroup, 'ctrlStrain')) {
            expGroupTypes[mappedExpGroup].map(function (imageMeta) {
                imageMeta.treatmentGroupId = null;
            });
        }
        delete expGroupTypes[expGroup];
    });
    data.expGroupTypeAlbums = expGroupTypes;
    app.winston.info("Complete: genExpGroupTypeAlbums");
    return data;
};
ExpSet.extract.genAlbumsByPlate = function (data, search) {
    ['treatReagent', 'ctrlReagent'].map(function (mappedExpGroup) {
        data.expGroupTypeAlbums[mappedExpGroup] = lodash_1.groupBy(data.expGroupTypeAlbums[mappedExpGroup], 'plateId');
    });
    data = ExpSet.extract.extractPlatesNoScore(data, search);
    return data;
};
/**
 * Find the first set of plates that has no score
 * This seems like a stupidly complex way of doing this
 * TODO Think of a better way to do this
 * @param data
 * @param search
 */
ExpSet.extract.extractPlatesNoScore = function (data, search) {
    var scoredPlateIds = [];
    var unScoredPlateIds = [];
    Object.keys(data.expGroupTypeAlbums.treatReagent).map(function (tplateId) {
        var foundAssay = lodash_1.find(data.expGroupTypeAlbums.treatReagent[tplateId], { manualScoreByAssay: null });
        // This plate was already scored!
        if (!foundAssay) {
            scoredPlateIds.push(tplateId);
        }
        else {
            unScoredPlateIds.push(tplateId);
        }
    });
    // let treatReagentPlateIds = Object.keys(data.expGroupTypeAlbums.treatReagent);
    var ctrlReagentPlateIds = Object.keys(data.expGroupTypeAlbums.ctrlReagent);
    // TODO Add condition for all plates scores (which shouldn't happen)
    // Get a single plate to score
    var scoreThisPlate = unScoredPlateIds.shift();
    var treatI = Object.keys(data.expGroupTypeAlbums.treatReagent).indexOf(scoreThisPlate);
    // Most of the time N2s have the same number of replicates as the mel-28
    // But sometimes they don't
    // If they don't just get the last n2 plate and call it a day
    var ctrlPlateId = null;
    if (treatI < ctrlReagentPlateIds.length) {
        ctrlPlateId = ctrlReagentPlateIds[treatI];
    }
    else {
        ctrlPlateId = ctrlReagentPlateIds.pop();
    }
    data.expGroupTypeAlbums.treatReagent = data.expGroupTypeAlbums.treatReagent[scoreThisPlate];
    data.expGroupTypeAlbums.ctrlReagent = data.expGroupTypeAlbums.ctrlReagent[ctrlPlateId];
    data.expGroupTypeAlbums.treatReagent = lodash_1.orderBy(data.expGroupTypeAlbums.treatReagent, 'well');
    data.expGroupTypeAlbums.ctrlReagent = lodash_1.orderBy(data.expGroupTypeAlbums.ctrlReagent, 'well');
    data = ExpSet.extract.preferentiallyChooseScoresSamePlate(data, search);
    return data;
};
/**
 * For all secondary screens, and some primary, the ctrls are on the same plate
 * So a plate will have mel-28 + RNAis and mel-28 + L4440
 * This is true (so far) of all RNAi secondary screens and Chembridge primary screens
 * @param data
 * @param search
 */
ExpSet.extract.preferentiallyChooseScoresSamePlate = function (data, search) {
    if (lodash_1.has(data.expGroupTypeAlbums, 'ctrlStrain')) {
        var treatPlateId = data.expGroupTypeAlbums.treatReagent[0].plateId;
        var ctrlStrainSamePlate = lodash_1.filter(data.expGroupTypeAlbums.ctrlStrain, { plateId: treatPlateId });
        if (lodash_1.isArray(ctrlStrainSamePlate) && ctrlStrainSamePlate.length) {
            data.expGroupTypeAlbums.ctrlStrain = ctrlStrainSamePlate;
        }
    }
    if (lodash_1.has(data.expGroupTypeAlbums, 'ctrlNull')) {
        var ctrlReagentPlateId = data.expGroupTypeAlbums.ctrlReagent[0].plateId;
        var ctrlNullSamePlate = lodash_1.filter(data.expGroupTypeAlbums.ctrlNull, { plateId: ctrlReagentPlateId });
        if (lodash_1.isArray(ctrlNullSamePlate) && ctrlNullSamePlate.length) {
            data.expGroupTypeAlbums.ctrlNull = ctrlNullSamePlate;
        }
    }
    return data;
};
//# sourceMappingURL=ExpSetScoringExtractByPlate.js.map