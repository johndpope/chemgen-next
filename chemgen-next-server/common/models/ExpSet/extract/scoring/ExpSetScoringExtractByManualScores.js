"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var config = require("config");
var decamelize = require("decamelize");
var ExpSetTypes_1 = require("../../../../types/custom/ExpSetTypes");
var knex = config.get('knex');
var ExpSet = app.models.ExpSet;
/**
 * This uses the knex query to get different phenotypes, min, max, avg, order by, and multiple orderbys
 * @param search
 */
ExpSet.extract.workflows.orderByExpManualScores = function (search) {
    search = new ExpSetTypes_1.ExpSetSearch(search);
    var data = new ExpSetTypes_1.ExpSetSearchResults({});
    return new Promise(function (resolve, reject) {
        ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
            .whereNot('manualscore_group', 'FIRST_PASS')
            .whereNot('manualscore_group', 'HAS_MANUAL_SCORE')
            .groupBy('treatment_group_id')
            .groupBy('timestamp')
            .groupBy('manualscore_group')
            .groupBy('screen_id')
            .orderBy('max_manualscore_value', 'desc')
            .then(function (results) {
            return ExpSet.extract.getExpAssay2reagentsByTreatmentGroupId(data, search, results);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.orderByExpManualScoresPrimaryPhenotypes = function (search) {
    search = new ExpSetTypes_1.ExpSetSearch(search);
    var data = new ExpSetTypes_1.ExpSetSearchResults({});
    return new Promise(function (resolve, reject) {
        var phenos = ['M_EMB_LETH', 'WT_EMB_LETH', 'M_ENH_STE', 'WT_ENH_STE'];
        ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
            .orWhere('manualscore_group', 'M_EMB_LETH')
            .orWhere('manualscore_group', 'WT_EMB_LETH')
            .orWhere('manualscore_group', 'M_ENH_STE')
            .orWhere('manualscore_group', 'WT_ENH_STE')
            .groupBy('treatment_group_id')
            .groupBy('timestamp')
            .groupBy('manualscore_group')
            .groupBy('screen_id')
            .orderBy('max_manualscore_value', 'desc')
            .then(function (results) {
            return ExpSet.extract.getExpAssay2reagentsByTreatmentGroupId(data, search, results);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.orderByExpManualScoresEmbLeth = function (search) {
    search = new ExpSetTypes_1.ExpSetSearch(search);
    var data = new ExpSetTypes_1.ExpSetSearchResults({});
    return new Promise(function (resolve, reject) {
        ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
            .orWhere('manualscore_group', 'M_EMB_LETH')
            .orWhere('manualscore_group', 'WT_EMB_LETH')
            .groupBy('treatment_group_id')
            .groupBy('timestamp')
            .groupBy('manualscore_group')
            .groupBy('screen_id')
            .orderBy('max_manualscore_value', 'desc')
            .then(function (results) {
            return ExpSet.extract.getExpAssay2reagentsByTreatmentGroupId(data, search, results);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.getExpAssay2reagentsByTreatmentGroupId = function (data, search, results) {
    return new Promise(function (resolve, reject) {
        var treatmentGroupIds = results.map(function (row) {
            return row.treatment_group_id;
        });
        app.models.ExpAssay2reagent
            .find({
            where: {
                treatmentGroupId: {
                    inq: treatmentGroupIds,
                }
            }
        })
            .then(function (expAssay2reagents) {
            data.expAssay2reagents = expAssay2reagents;
            return ExpSet.extract.buildExpSets(data, search);
        })
            .then(function (data) {
            results = lodash_1.groupBy(results, 'treatment_group_id');
            results = { tableData: results, expSets: data };
            results = ExpSet.extract.workflows.createTrainPhenoExpSetDataFrameFromScores(results);
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * Given the score groupings map them back to counts
 * TODO - this is really only necessary for returning a dataframe to train with TF
 * @param results
 */
ExpSet.extract.workflows.createTrainPhenoExpSetDataFrameFromScores = function (results) {
    var data = results.expSets;
    var tableData = results.tableData;
    var expSetModule = new ExpSetTypes_1.ExpsetModule(data);
    var dataFrame = [];
    Object.keys(tableData).map(function (key) {
        var album = expSetModule.findAlbums(Number(key));
        tableData[key].map(function (scoreGroup) {
            //Its a treatmentGroup
            scoreGroup.treatmentGroupId = scoreGroup.treatment_group_id;
            if (scoreGroup.manualscore_group.match(new RegExp('^M_.*'))) {
                scoreGroup = ExpSet.extract.getExpSetCounts(expSetModule, album, scoreGroup, 'treatmentReagentImages', 'ctrlStrainImages');
                dataFrame.push(scoreGroup);
            }
            else if (scoreGroup.manualscore_group.match(new RegExp('^WT_.*'))) {
                scoreGroup = ExpSet.extract.getExpSetCounts(expSetModule, album, scoreGroup, 'ctrlReagentImages', 'ctrlNullImages');
                dataFrame.push(scoreGroup);
            }
        });
    });
    dataFrame = lodash_1.orderBy(dataFrame, 'max_manualscore_value', 'desc');
    results.dataFrame = dataFrame;
    return results;
};
ExpSet.extract.getExpSetCounts = function (expSetModule, album, scoreGroup, reagentGroup, ctrlGroup) {
    var expAssay2reagent = expSetModule.findExpAssay2reagents(Number(scoreGroup.treatmentGroupId));
    var expScreen = expSetModule.findExpScreen(expAssay2reagent[0].screenId);
    scoreGroup.screenId = expScreen.screenId;
    scoreGroup.screenName = expScreen.screenName;
    scoreGroup.screenStage = expScreen.screenStage;
    scoreGroup.expWorkflowId = expAssay2reagent[0].expWorkflowId;
    var treatReagentAssayIds = album[reagentGroup].map(function (assay) {
        return assay.assayId;
    });
    var ctrlStrainAssayIds = album[ctrlGroup].map(function (assay) {
        return assay.assayId;
    });
    var treatReagentCounts = expSetModule.expSets.modelPredictedCounts.filter(function (modelPredictedCounts) {
        return lodash_1.includes(treatReagentAssayIds, modelPredictedCounts.assayId);
    });
    var ctrlStrainCounts = expSetModule.expSets.modelPredictedCounts.filter(function (modelPredictedCounts) {
        return lodash_1.includes(ctrlStrainAssayIds, modelPredictedCounts.assayId);
    });
    treatReagentCounts.map(function (counts, index) {
        scoreGroup["reagentWormCountR" + index] = counts.wormCount;
        scoreGroup["reagentLarvaCountR" + index] = counts.larvaCount;
        scoreGroup["reagentEggCountR" + index] = counts.eggCount;
    });
    ctrlStrainCounts.map(function (counts, index) {
        scoreGroup["ctrlWormCountR" + index] = counts.wormCount;
        scoreGroup["ctrlLarvaCountR" + index] = counts.larvaCount;
        scoreGroup["ctrlEggCountR" + index] = counts.eggCount;
    });
    scoreGroup.predictedScore = scoreGroup.max_manualscore_value;
    if (scoreGroup.screenStage.match('primary')) {
        scoreGroup = new ExpSetTypes_1.PredictPrimaryPhenotypeExpSet(scoreGroup);
    }
    else if (scoreGroup.screenStage.match('secondary')) {
        scoreGroup = new ExpSetTypes_1.PredictSecondaryPhenotypeExpSet(scoreGroup);
    }
    return scoreGroup;
};
ExpSet.extract.workflows.orderByExpManualScoresEnhSte = function (search) {
    search = new ExpSetTypes_1.ExpSetSearch(search);
    var data = new ExpSetTypes_1.ExpSetSearchResults({});
    return new Promise(function (resolve, reject) {
        ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
            .where('manualscore_group', 'M_ENH_STE')
            .orWhere('manualscore_group', 'WT_ENH_STE')
            .groupBy('treatment_group_id')
            .groupBy('timestamp')
            .groupBy('manualscore_group')
            .groupBy('screen_id')
            .orderBy('max_manualscore_value', 'desc')
            .then(function (results) {
            return ExpSet.extract.getExpAssay2reagentsByTreatmentGroupId(data, search, results);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.orderByExpManualScoresBaseQuery = function (search) {
    search = new ExpSetTypes_1.ExpSetSearch(search);
    var query = knex('exp_manual_scores');
    ['screen', 'expWorkflow', 'treatmentGroup', 'assay'].map(function (searchType) {
        if (!lodash_1.isEmpty(search[searchType + "Search"])) {
            var sql_col = decamelize(searchType + "Id");
            var sql_values = search[searchType + "Search"];
            query = query.whereIn(sql_col, sql_values);
        }
    });
    return knex('exp_manual_scores')
        .select('timestamp')
        .select('treatment_group_id')
        .select('manualscore_group')
        .select('screen_id')
        .max('manualscore_value as max_manualscore_value')
        .min('manualscore_value as min_manualscore_value')
        .avg('manualscore_value as avg_manualscore_value');
};
//# sourceMappingURL=ExpSetScoringExtractByManualScores.js.map