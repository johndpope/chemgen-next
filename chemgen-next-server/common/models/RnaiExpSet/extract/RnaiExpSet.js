"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var lodash_1 = require("lodash");
var Promise = require("bluebird");
var index_1 = require("../../../types/custom/ExpSetTypes/index");
var RnaiExpSet = app.models.RnaiExpSet;
/**
 * Here be a few convenience methods to manualScoresAdvancedQuery for manualScoresAdvancedQuery RNAi sets
 * Most of the actual work is done over at app.models.ExpSet
 */
/**
 * Get ExpSets by GeneList
 * GeneList is an array of strings, with either the wormbase name of the cosmid name
 * Optionally, this also allows for searching by libraryId, screen, plate, expWorkflowId
 * If search.includeCounts == True, this will also fetch the includeCounts
 * @param {ExpSetSearch} search
 */
RnaiExpSet.extract.workflows.getExpSetsByGeneList = function (search) {
    return new Promise(function (resolve, reject) {
        search = new index_1.ExpSetSearch(search);
        var data = new index_1.ExpSetSearchResults({});
        app.models.RnaiLibrary.extract.workflows
            .getRnaiLibraryFromUserGeneList(search.rnaiSearch, search)
            .then(function (results) {
            if (lodash_1.isEmpty(results)) {
                resolve(data);
            }
            else {
                data.rnaisList = results;
                return app.models.ExpSet.extract.buildBasicPaginationData(data, search)
                    .then(function (data) {
                    return app.models.ExpSet.extract.searchExpAssay2reagents(data, search);
                })
                    .then(function (results) {
                    return app.models.ExpSet.extract.workflows.getReagentData(results, search);
                })
                    .then(function (results) {
                    resolve(results);
                })
                    .catch(function (error) {
                    reject(new Error(error));
                });
            }
        });
    });
};
//# sourceMappingURL=RnaiExpSet.js.map