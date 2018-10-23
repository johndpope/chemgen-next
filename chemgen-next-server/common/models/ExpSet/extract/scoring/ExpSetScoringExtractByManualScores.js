"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var config = require("config");
var knex = config.get('knex');
var ExpSet = app.models.ExpSet;
/**
 * This uses the knex query to get different phenotypes, min, max, avg, order by, and multiple orderbys
 * @param search
 */
ExpSet.extract.workflows.orderByExpManualScores = function (search) {
    return new Promise(function (resolve, reject) {
        ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
            .whereNot('manualscore_group', 'FIRST_PASS')
            .whereNot('manualscore_group', 'HAS_MANUAL_SCORE')
            .groupBy('treatment_group_id')
            .groupBy('manualscore_group')
            .groupBy('manualscore_code')
            .orderBy('max_manualscore_value', 'desc')
            .limit(1000)
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.orderByExpManualScoresPrimaryPhenotypes = function (search) {
    return new Promise(function (resolve, reject) {
        ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
            .where('manualscore_group', 'M_EMB_LETH')
            .orWhere('manualscore_group', 'WT_EMB_LETH')
            .orWhere('manualscore_group', 'M_ENH_STE')
            .orWhere('manualscore_group', 'WT_ENH_STE')
            .groupBy('treatment_group_id')
            .groupBy('manualscore_code')
            .groupBy('manualscore_group')
            .orderBy('max_manualscore_value', 'desc')
            .limit(100000)
            .then(function (results) {
            results = lodash_1.groupBy(results, 'treatment_group_id');
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.orderByExpManualScoresEmbLeth = function (search) {
    return new Promise(function (resolve, reject) {
        ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
            .where('manualscore_group', 'M_EMB_LETH')
            .orWhere('manualscore_group', 'WT_EMB_LETH')
            .groupBy('treatment_group_id')
            .groupBy('manualscore_group')
            .groupBy('manualscore_code')
            .orderBy('max_manualscore_value', 'desc')
            .limit(1000)
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.orderByExpManualScoresEnhSte = function (search) {
    return new Promise(function (resolve, reject) {
        ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
            .where('manualscore_group', 'M_ENH_STE')
            .orWhere('manualscore_group', 'WT_ENH_STE')
            .groupBy('treatment_group_id')
            .groupBy('manualscore_group')
            .groupBy('manualscore_code')
            .orderBy('max_manualscore_value', 'desc')
            .limit(1000)
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.orderByExpManualScoresBaseQuery = function (search) {
    return knex('exp_manual_scores')
        .select('treatment_group_id')
        .select('manualscore_group')
        .select('manualscore_code')
        .max('manualscore_value as max_manualscore_value')
        .min('manualscore_value as min_manualscore_value')
        .avg('manualscore_value as avg_manualscore_value');
};
//# sourceMappingURL=ExpSetScoringExtractByManualScores.js.map