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
            .groupBy('manualscore_group')
            .groupBy('manualscore_code')
            .groupBy('timestamp')
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
        ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
            .where('manualscore_group', 'M_EMB_LETH')
            .orWhere('manualscore_group', 'WT_EMB_LETH')
            .orWhere('manualscore_group', 'M_ENH_STE')
            .orWhere('manualscore_group', 'WT_ENH_STE')
            .groupBy('treatment_group_id')
            .groupBy('manualscore_code')
            .groupBy('manualscore_group')
            .groupBy('timestamp')
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
            .where('manualscore_group', 'M_EMB_LETH')
            .orWhere('manualscore_group', 'WT_EMB_LETH')
            .groupBy('treatment_group_id')
            .groupBy('manualscore_group')
            .groupBy('manualscore_code')
            .groupBy('timestamp')
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
            resolve({ tableData: results, expSetSearchResults: data });
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.orderByExpManualScoresEnhSte = function (search) {
    search = new ExpSetTypes_1.ExpSetSearch(search);
    var data = new ExpSetTypes_1.ExpSetSearchResults({});
    return new Promise(function (resolve, reject) {
        ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
            .where('manualscore_group', 'M_ENH_STE')
            .orWhere('manualscore_group', 'WT_ENH_STE')
            .groupBy('treatment_group_id')
            .groupBy('manualscore_group')
            .groupBy('manualscore_code')
            .groupBy('timestamp')
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
        .select('treatment_group_id')
        .select('manualscore_group')
        .select('manualscore_code')
        .select('timestamp')
        .max('manualscore_value as max_manualscore_value')
        .min('manualscore_value as min_manualscore_value')
        .avg('manualscore_value as avg_manualscore_value');
};
//# sourceMappingURL=ExpSetScoringExtractByManualScores.js.map