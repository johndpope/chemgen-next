"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var lodash_1 = require("lodash");
var decamelize = require("decamelize");
var config = require("config");
var knex = config.get('knex');
/**
 * Most of the scoring workflows require more complex sql queries than we can get with loopback
 * Complex sql queries are built with knex and executed directly as SQL
 */
var ExpSet = app.models.ExpSet;
/**
 * The ExpSetSearch has filtering for basic exp data -
 * such as the screenId, libraryId, expWorkflowId, plateId, expGroupId, assayIdId
 * Example:
 * search = new ExpSetSearch({
 *   "screenSearch": [1,2]
 * })
 * Would filter the ExpAssay2Reagent score table to only those with a screenId of 1 or 2
 * @param query
 * @param search
 * @param fields
 */
ExpSet.extract.buildNativeQueryExpSearch = function (query, search, fields) {
    if (!lodash_1.isArray(fields) || lodash_1.isEmpty(fields)) {
        fields = ['screen', 'library', 'expWorkflow', 'plate', 'expGroup', 'assay'];
    }
    //Add Base experiment lookup
    fields.map(function (searchType) {
        if (!lodash_1.isEmpty(search[searchType + "Search"])) {
            var sql_col = decamelize(searchType + "Id");
            var sql_values = search[searchType + "Search"];
            query = query.whereIn(sql_col, sql_values);
        }
    });
    return query;
};
/**
 * ExpSet.extract.buildNativeQueryReagents is used in conjunction with the getByGenes or getByChemicals
 * First you need to know the ID of the reagents and their corresponding libraries
 * Then query for them
 * @param data
 * @param query
 * @param search
 */
ExpSet.extract.buildNativeQueryReagents = function (data, query, search) {
    //Add Rnai reagent Lookup
    if (!lodash_1.isEmpty(data.rnaisList)) {
        query = query
            .where(function () {
            var firstVal = data.rnaisList.shift();
            var firstWhere = this.orWhere({ 'reagent_id': firstVal.rnaiId, library_id: firstVal.libraryId });
            data.rnaisList.map(function (rnai) {
                firstWhere = firstWhere.orWhere({ reagent_id: rnai.rnaiId, library_id: firstVal.libraryId });
            });
            data.rnaisList.push(firstVal);
        });
    }
    //Add Chemical Lookup
    if (!lodash_1.isEmpty(data.compoundsList)) {
        query = query
            .where(function () {
            var firstVal = data.compoundsList.shift();
            var firstWhere = this.orWhere({ 'reagent_id': firstVal.compoundId, library_id: firstVal.libraryId });
            data.compoundsList.map(function (compound) {
                firstWhere = firstWhere.orWhere({ reagent_id: compound.compoundId, library_id: firstVal.libraryId });
            });
            data.compoundsList.push(firstVal);
        });
    }
    return query;
};
/**
 * ExpSet.extract.serializeNativeSqlToLoopbackModel
 * Loopback models are in camel case - screen_id in the DB becomes screenId in the model def
 * We can take the rows returned from knex, camelcase them, delete the extra keys, and then return them as regular loopback resultsets
 * @param rows
 * @param model
 */
ExpSet.extract.serializeNativeSqlToLoopbackModel = function (rows, model) {
    return rows.map(function (rawRowData) {
        Object.keys(rawRowData).map(function (rowKey) {
            rawRowData[lodash_1.camelCase(rowKey)] = rawRowData[rowKey];
            if (!lodash_1.isEqual(lodash_1.camelCase(rowKey), rowKey)) {
                delete rawRowData[rowKey];
            }
        });
        return new app.models[model](JSON.parse(JSON.stringify(rawRowData)));
    });
};
//# sourceMappingURL=ExpSetSearchSQLHelpers.js.map