"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var search_1 = require("../types/custom/search");
// import assert = require('assert');
if (!lodash_1.isEqual(process.env.NODE_ENV, 'dev')) {
    process.exit(0);
}
function addWorkflowGetReagents() {
    return new Promise(function (resolve, reject) {
        // let search = new ExpSetSearch({});
        var search = new search_1.ReagentDataCriteria();
        app.models.ExpScreenUploadWorkflow
            .findOne({ where: { and: [{ name: /RNA/ }] } })
            .then(function (expWorkflow) {
            expWorkflow = JSON.parse(JSON.stringify(expWorkflow));
            return app.models.ExpPlate
                .find({ where: { expWorkflowId: expWorkflow.id, fields: { plateId: true } } })
                .then(function (expPlateResults) {
                return app.models.RnaiLibraryStock
                    .find({
                    where: {
                        plateId: {
                            inq: expPlateResults.map(function (expPlateResult) {
                                return expPlateResult.plateId;
                            })
                        }
                    },
                    fields: {
                        rnaiId: true,
                        libraryId: true,
                    }
                });
            })
                .then(function (rnaiLibraryStockResults) {
                rnaiLibraryStockResults = rnaiLibraryStockResults.filter(function (rnaiLibraryStockResult) {
                    return !lodash_1.isNull(rnaiLibraryStockResult.rnaiId);
                });
                return app.models.RnaiLibrary
                    .find({
                    where: {
                        or: rnaiLibraryStockResults.map(function (rnaiLibraryStockResult) {
                            return {
                                and: [
                                    {
                                        rnaiId: rnaiLibraryStockResult.rnaiId,
                                        libraryId: rnaiLibraryStockResult.libraryId
                                    }
                                ]
                            };
                        }),
                    }
                });
            })
                .then(function (rnaiLibraryResults) {
                search.rnaiList = rnaiLibraryResults.map(function (rnaiLibraryResult) {
                    return rnaiLibraryResult.geneName;
                });
                // search.expWorkflowSearch = [expWorkflow.id];
                return search;
            })
                .catch(function (error) {
                return new Error(error);
            });
        })
            .then(function () {
            resolve(search);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
describe('ExpSetSearchByExpWorkflow.test.ts', function () {
    before(function (done) {
        app.models.ExpScreenUploadWorkflow
            .findOne({ where: { and: [{ name: /RNA/ }] } })
            .then(function (expWorkflow) {
            expWorkflow = JSON.parse(JSON.stringify(expWorkflow));
            return app.models.ExpScreenUploadWorkflow.load.workflows.doWork(expWorkflow);
        })
            .then(function () {
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('Should return correct query for RnaiList', function (done) {
        addWorkflowGetReagents()
            .then(function (search) {
            return app.models.ExpSet.extract.getExpWorkflowsByRNAiReagentData(search);
        })
            .then(function (expWorkflowIds) {
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('Should return correct expGroupIds', function (done) {
        addWorkflowGetReagents()
            .then(function (search) {
            return app.models.ExpSet.extract.getExpSetsByRNAiReagentData(search);
        })
            .then(function (expWorkflowIds) {
            console.log(expWorkflowIds);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
});
//# sourceMappingURL=ExpSetSearchByExpWorkflow.test.js.map