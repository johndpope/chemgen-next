"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var ExpSetTypes_1 = require("../../../types/custom/ExpSetTypes");
var config = require('config');
var knex = config.get('knex');
var ExpManualScores = app.models.ExpManualScores;
/**
 * This gets the stats per screen and per workflow
 * Count All Exp Sets
 * Count Exp Sets that have gone through First Pass
 * Count Exp Sets that have gone through First Pass and are marked for further scoring
 * Count Exp Sets that have gone through detailed scoring
 * Returns an array of results
 * @param search
 */
ExpManualScores.extract.workflows.getScoresStatsPerScreen = function (search) {
    return new Promise(function (resolve, reject) {
        search = new ExpSetTypes_1.ExpSetSearch(search);
        var data = {};
        var expWorkflowWhere = {
            fields: {
                id: true,
                name: true,
                screenName: true,
                screenId: true,
                screenType: true,
                screenStage: true
            }, where: {}
        };
        if (!lodash_1.isEmpty(search.screenSearch)) {
            expWorkflowWhere.where.screenId = {
                inq: search.screenSearch,
            };
        }
        if (!lodash_1.isEmpty(search.expWorkflowSearch)) {
            expWorkflowWhere.where.id = {
                inq: search.expWorkflowSearch,
            };
        }
        app.models.ExpScreenUploadWorkflow
            .find(expWorkflowWhere)
            .then(function (expWorkflowResults) {
            data.expWorkflows = expWorkflowResults;
            return ExpManualScores.extract.getScoreStatsPerExpWorkflow(data);
        })
            .then(function (results) {
            // results = orderBy(results, ['screenId', 'expWorkflowName']);
            results = results.filter(function (res) {
                return res.screenName;
            });
            results = lodash_1.orderBy(results, 'screenId');
            resolve(results);
        })
            .catch(function (error) {
            return new Error(error);
        });
    });
};
ExpManualScores.extract.getScoreStatsPerExpWorkflow = function (data) {
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        Promise.map(data.expWorkflows, function (expWorkflow) {
            var queries = {
                allExpSets: ExpManualScores.extract.buildNativeQueryDistinctTreatmentIds(expWorkflow),
                allFirstPassExpSets: ExpManualScores.extract.buildNativeQueryWithFirstPassAll(expWorkflow),
                interestingFirstPassExpSets: ExpManualScores.extract.buildNativeQueryWithFirstPassTrue(expWorkflow),
                detailScoresExpSets: ExpManualScores.extract.buildNativeQueryWithDetailedScores(expWorkflow),
            };
            var results = {
                screenId: expWorkflow.screenId,
                expWorkflowId: String(expWorkflow.id),
                expWorkflowName: expWorkflow.name,
                screenName: expWorkflow.screenName,
            };
            //@ts-ignore
            return Promise.map(Object.keys(queries), function (queryKey) {
                return queries[queryKey]
                    .then(function (countResults) {
                    results[queryKey] = countResults[0]['count_treatment_group_id'];
                    return;
                })
                    .catch(function (error) {
                    app.winston.error(error);
                    return new Error(error);
                });
            })
                .then(function () {
                return results;
            })
                .catch(function (error) {
                app.winston.error(error);
                return new Error(error);
            });
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
/**
 * This returns the total number of expSets for a given workflow
 * @param expWorkflow
 */
ExpManualScores.extract.buildNativeQueryDistinctTreatmentIds = function (expWorkflow) {
    var query = knex('exp_assay2reagent')
        .countDistinct('treatment_group_id as count_treatment_group_id')
        .where('reagent_type', 'LIKE', 'treat%')
        .where('exp_workflow_id', String(expWorkflow.id));
    return query;
};
/**
 * This returns the total number of expSets for a given workflow
 * @param expWorkflow
 */
ExpManualScores.extract.buildNativeQueryDistinctTreatmentIdsGroupBy = function () {
    var query = knex('exp_assay2reagent')
        .select('exp_workflow_id')
        .countDistinct('treatment_group_id as count_treatment_group_id')
        .groupBy('exp_workflow_id')
        .where('reagent_type', 'LIKE', 'treat%');
    return query;
};
/**
 * Get all expSets count that have gone through the first pass
 * @param expWorkflow
 */
ExpManualScores.extract.buildNativeQueryWithFirstPassAll = function (expWorkflow) {
    var query = knex('exp_manual_scores')
        .countDistinct('treatment_group_id as count_treatment_group_id')
        .where('exp_workflow_id', String(expWorkflow.id))
        .where('manualscore_group', 'FIRST_PASS');
    return query;
};
/**
 * Get all expSets count that have gone through the first pass and been marked as interesting
 * @param expWorkflow
 */
ExpManualScores.extract.buildNativeQueryWithFirstPassTrue = function (expWorkflow) {
    var query = ExpManualScores.extract.buildNativeQueryWithFirstPassAll(expWorkflow);
    query = query
        .where('manualscore_value', 1);
    return query;
};
/**
 * Get all expSets counts that have a detailed score
 * @param expWorkflow
 */
ExpManualScores.extract.buildNativeQueryWithDetailedScores = function (expWorkflow) {
    var query = knex('exp_manual_scores')
        .countDistinct('treatment_group_id as count_treatment_group_id')
        .where('exp_workflow_id', String(expWorkflow.id))
        .where('manualscore_group', 'HAS_MANUAL_SCORE');
    return query;
};
//# sourceMappingURL=ExpManualScores.js.map