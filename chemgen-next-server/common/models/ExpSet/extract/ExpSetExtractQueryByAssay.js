"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var ExpSetTypes_1 = require("../../../types/custom/ExpSetTypes");
var lodash_1 = require("lodash");
var config = require("config");
var knex = config.get('knex');
//@ts-ignore
var ExpSet = app.models.ExpSet;
/**
 *  ExpSetSearch the expAssay2reagents table given the search contactSheetResults
 *  From there get assays, and get includeCounts
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.searchExpAssay2reagents = function (search) {
    return new Promise(function (resolve, reject) {
        search = new ExpSetTypes_1.ExpSetSearch(search);
        var data = new ExpSetTypes_1.ExpSetSearchResults({});
        var expAssay2reagentSearch = app.models.ExpSet.extract.buildExpAssay2reagentSearch(data, search);
        app.winston.info("ExpAssay2reagentSearch: " + JSON.stringify(expAssay2reagentSearch, null, 2));
        app.models.ExpAssay2reagent
            .find(expAssay2reagentSearch)
            .then(function (results) {
            app.winston.info("Got " + results.length + " expAssay2reagentResults");
            var expWorkflowIds = results.map(function (expAssay2reagent) {
                return expAssay2reagent.expWorkflowId;
            });
            expWorkflowIds = lodash_1.uniq(expWorkflowIds);
            app.winston.info("From " + JSON.stringify(expWorkflowIds));
            data.expAssay2reagents = results;
            return app.models.ExpSet.extract.buildExpSets(data, search);
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
//# sourceMappingURL=ExpSetExtractQueryByAssay.js.map