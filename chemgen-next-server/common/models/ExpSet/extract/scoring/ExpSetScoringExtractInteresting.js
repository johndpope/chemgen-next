"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var ExpSetTypes_1 = require("../../../../types/custom/ExpSetTypes");
var decamelize = require("decamelize");
var config = require("config");
var knex = config.get('knex');
var ExpSet = app.models.ExpSet;
/**
 * Get expSets that have a FIRST_PASS=1 and no HAS_MANUAL_SCORE
 * @param search
 */
ExpSet.extract.workflows.getInterestingExpSets = function (search) {
    app.winston.info('Should be getting interesting expsets');
    return new Promise(function (resolve, reject) {
        search = new ExpSetTypes_1.ExpSetSearch(search);
        var data = new ExpSetTypes_1.ExpSetSearchResults({});
        var sqlQuery = ExpSet.extract.buildNativeQueryGetInteresting(data, search, search.scoresExist);
        sqlQuery
            .then(function (rows) {
            var count = rows.length;
            var totalPages = Math.round(lodash_1.divide(Number(count), Number(search.pageSize)));
            data.currentPage = search.currentPage;
            data.pageSize = search.pageSize;
            data.skip = search.skip;
            data.totalPages = totalPages;
            var treatmentGroupIds = rows.map(function (expAssay2reagent) {
                return expAssay2reagent['treatment_group_id'];
            });
            search.expGroupSearch = treatmentGroupIds;
            return app.models.ExpAssay2reagent
                .find({
                where: {
                    treatmentGroupId: {
                        inq: treatmentGroupIds,
                    }
                }
            });
        })
            .then(function (expAssay2reagents) {
            // data.expAssay2reagents = shuffle(rowData).slice(0, data.pageSize + 1);
            data.expAssay2reagents = expAssay2reagents;
            return data;
        })
            .then(function (data) {
            app.winston.info('building expSets');
            return app.models.ExpSet.extract.buildExpSets(data, search);
        })
            .then(function (data) {
            app.winston.info('resolving data');
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error("Error getting interesting expsets: " + error);
            var totalPages = 0;
            data.totalPages = totalPages;
            resolve(data);
        });
    });
};
/**
 * The expPlates will have much fewer contactSheetResults, and so it will be faster to manualScoresAdvancedQuery,
 * and more possible to pull a random plate for scoring
 * @param data
 * @param search
 * @param hasManualScores
 */
ExpSet.extract.buildNativeQueryGetInteresting = function (data, search, hasManualScores) {
    var query = knex('exp_assay2reagent');
    query = query
        .distinct('treatment_group_id')
        .where('reagent_type', 'LIKE', 'treat%')
        .whereNot({ reagent_id: null });
    //Add Base experiment lookup
    ['screen', 'expWorkflow', 'plate', 'treatmentGroup', 'expGroup', 'assay'].map(function (searchType) {
        if (!lodash_1.isEmpty(search[searchType + "Search"])) {
            var sql_col = decamelize(searchType + "Id");
            var sql_values = search[searchType + "Search"];
            query = query.whereIn(sql_col, sql_values);
        }
    });
    /**
     * Filter By FIRST_PASS
     */
    query = query
        .whereExists(function () {
        this.select(1)
            .from('exp_manual_scores')
            .whereRaw('(exp_assay2reagent.assay_id = exp_manual_scores.assay_id ) AND (exp_manual_scores.manualscore_group = \'FIRST_PASS\') AND (exp_manual_scores.manualscore_value = 1)');
    });
    return query;
};
//# sourceMappingURL=ExpSetScoringExtractInteresting.js.map