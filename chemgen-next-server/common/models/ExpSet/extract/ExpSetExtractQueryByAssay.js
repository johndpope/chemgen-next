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
 *  ExpSetSearch the expAssay2reagents table given the expSetSearch contactSheetResults
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
ExpSet.extract.workflows.getRelatedExpSets = function (search) {
    return new Promise(function (resolve, reject) {
        search = new ExpSetTypes_1.ExpSetSearch(search);
        var data = new ExpSetTypes_1.ExpSetSearchResults({});
        var expAssay2reagentSearch = app.models.ExpSet.extract.buildExpAssay2reagentSearch(data, search);
        app.models.ExpAssay2reagent
            .find(expAssay2reagentSearch)
            .then(function (results) {
            app.winston.info("Got " + results.length + " expAssay2reagentResults");
            results = results.filter(function (result) {
                return !lodash_1.isNull(result.libraryId) && !lodash_1.isNull(result.reagentId);
            });
            var reagentSearch = { or: [] };
            results.map(function (result) {
                reagentSearch.or.push({ and: [{ libraryId: result.libraryId }, { reagentId: result.reagentId }] });
            });
            if (reagentSearch.or.length) {
                return app.models.ExpAssay2reagent
                    .find({ where: reagentSearch });
            }
            else {
                resolve(data);
            }
        })
            .then(function (results) {
            data.expAssay2reagents = results;
            if (results.length) {
                return app.models.ExpSet.extract.buildExpSets(data, search);
            }
            else {
                resolve(data);
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
/**
 * Given a set of libraryIds and reagentIds
 * Get all corresponding expSets
 * @param reagentSearch
 */
ExpSet.extract.getExpSetsByLibraryData = function (reagentSearch) {
    return new Promise(function (resolve, reject) {
        var data = new ExpSetTypes_1.ExpSetSearchResults({});
        var search = new ExpSetTypes_1.ExpSetSearch({});
        var expAssay2reagentSearch = { or: [] };
        if (lodash_1.isArray(reagentSearch) && reagentSearch.length) {
            reagentSearch.map(function (searchCriteria) {
                expAssay2reagentSearch.or.push({ and: [{ libraryId: searchCriteria.libraryId }, { reagentId: searchCriteria.reagentId }] });
            });
            app.models.ExpAssay2reagent
                .find({ where: expAssay2reagentSearch })
                .then(function (results) {
                data.expAssay2reagents = results;
                search.expGroupSearch = data.expAssay2reagents.map(function (expAssay2reagent) {
                    return expAssay2reagent.treatmentGroupId;
                });
                search.expGroupSearch = lodash_1.uniq(search.expGroupSearch);
                if (results.length) {
                    return app.models.ExpSet.extract.buildExpSets(data, search);
                }
                else {
                    resolve(data);
                }
            })
                .then(function (data) {
                resolve(data);
            })
                .catch(function (error) {
                app.winston.error(error);
                reject(new Error(error));
            });
        }
        else {
            resolve(data);
        }
    });
};
//# sourceMappingURL=ExpSetExtractQueryByAssay.js.map