"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
//@ts-ignore
var ExpSet = app.models.ExpSet;
/**
 *  ExpSetSearch the expAssay2reagents table given the search contactSheetResults
 *  From there get assays, and get includeCounts
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.searchExpAssay2reagents = function (data, search) {
    return new Promise(function (resolve, reject) {
        var expAssay2reagentSearch = app.models.ExpSet.extract.buildExpAssay2reagentSearch(data, search);
        app.models.ExpAssay2reagent
            .find(expAssay2reagentSearch)
            .then(function (results) {
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