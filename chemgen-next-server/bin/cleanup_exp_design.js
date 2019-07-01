#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var findDuplicateExpGroupsWithCounts = "\nSELECT exp_group_type, COUNT( exp_group_type ) , screen_id, COUNT( screen_id ) , exp_workflow_id, COUNT( exp_workflow_id ) , library_id, COUNT( library_id ) , biosample_id, COUNT( biosample_id ) , well, COUNT( well ) , screen_id, COUNT( screen_id )\nFROM exp_group\nGROUP BY exp_group_type, screen_id, library_id, biosample_id, well, exp_workflow_id\nHAVING COUNT( screen_id ) >1\nAND COUNT( exp_group_type ) >1\nAND COUNT( library_id ) >1\nAND COUNT( biosample_id ) >1\nAND COUNT( well ) >1\n";
var findDuplicateExpGroups = "\nSELECT exp_group_type , screen_id, exp_workflow_id,  library_id,  biosample_id,  well,  screen_id\nFROM exp_group\nGROUP BY exp_group_type, screen_id, library_id, biosample_id, well, exp_workflow_id\nHAVING COUNT( screen_id ) >1\nAND COUNT( exp_group_type ) >1\nAND COUNT( library_id ) >1\nAND COUNT( biosample_id ) >1\nAND COUNT( well ) >1\n";
var app = require('../server/server');
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var path = require('path');
var fs = require('fs');
countExpDesigns()
    .then(function (paginationResults) {
    return getPagedExpDesigns(paginationResults);
})
    .then(function () {
    console.log('finished!');
    process.exit(0);
})
    .catch(function (error) {
    console.log(error);
    process.exit(1);
});
function getPagedExpDesigns(paginationResults) {
    return new Promise(function (resolve, reject) {
        Promise.map(paginationResults.pages, function (page) {
            var skip = Number(page) * Number(paginationResults.limit);
            // console.log(`Page: ${page} Skip: ${skip}`);
            return app.models.ExpDesign
                .find({
                limit: paginationResults.limit,
                skip: skip,
            })
                .then(function (results) {
                // console.log(`Results Len : ${contactSheetResults.length}`);
                // console.log(JSON.stringify(contactSheetResults));
                // return getExpDesign(contactSheetResults);
                return getExpDesignsByTreatment(results);
            })
                .catch(function (error) {
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function () {
            // console.log(JSON.stringify(paginationResults.count));
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function getExpDesignsByTreatment(expDesignRows) {
    return new Promise(function (resolve, reject) {
        expDesignRows = lodash_1.uniqBy(expDesignRows, 'treatmentGroupId');
        Promise.map(expDesignRows, function (expDesign) {
            return app.models.ExpDesign
                .find({ where: { treatmentGroupId: expDesign.treatmentGroupId } })
                .then(function (results) {
                return parseExpDesigns(results);
            })
                .then(function () {
                return;
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function parseExpDesigns(expDesignRows) {
    return new Promise(function (resolve, reject) {
        expDesignRows = lodash_1.uniqBy(expDesignRows, 'controlGroupId');
        var groups = lodash_1.groupBy(expDesignRows, 'treatmentGroupId');
        var expDesignSets = [];
        Object.keys(groups).map(function (group) {
            var t = [];
            groups[group].map(function (expDesignRow) {
                t.push(expDesignRow);
            });
            expDesignSets.push(t);
        });
        var messedUpExpSets = [];
        expDesignSets.map(function (expSet) {
            if (expSet.length > 3) {
                messedUpExpSets.push(expSet);
            }
        });
        console.log("Got " + messedUpExpSets.length + " sets");
        if (messedUpExpSets.length > 1) {
            console.log(JSON.stringify(messedUpExpSets[0]));
        }
        Promise.map(messedUpExpSets, function (expSet) {
            return cleanUpExpSets(expSet);
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function cleanUpExpSets(expSet) {
    return new Promise(function (resolve, reject) {
        var ctrlNullExpGroupIds = [];
        var ctrlStrainExpGroupIds = [];
        var ctrlRnaiExpGroupIds = [];
        expSet.map(function (expDesignRow) {
            if (lodash_1.isEqual(expDesignRow.controlGroupReagentType, 'ctrl_null')) {
                ctrlNullExpGroupIds.push(expDesignRow.controlGroupId);
            }
            else if (lodash_1.isEqual(expDesignRow.controlGroupReagentType, 'ctrl_strain')) {
                ctrlStrainExpGroupIds.push(expDesignRow.controlGroupId);
            }
            else if (lodash_1.isEqual(expDesignRow.controlGroupReagentType, 'ctrl_rnai') || lodash_1.isEqual(expDesignRow.controlGroupReagentType, 'ctrl_chemical')) {
                ctrlRnaiExpGroupIds.push(expDesignRow.controlGroupId);
            }
        });
        [ctrlNullExpGroupIds, ctrlRnaiExpGroupIds, ctrlStrainExpGroupIds].map(function (ctrlIds) {
            if (ctrlIds.length < 2) {
                console.log("Truncating ctrlids " + JSON.stringify(ctrlIds));
                ctrlIds = [];
            }
        });
        Promise.map([ctrlNullExpGroupIds, ctrlRnaiExpGroupIds, ctrlStrainExpGroupIds], function (ctrlIds) {
            return updateExpAssays('ExpAssay', ctrlIds)
                .then(function () {
                return updateExpAssays('ExpAssay2reagent', ctrlIds);
            })
                .then(function () {
                return deleteExpDesigns(ctrlIds);
            })
                .then(function () {
                return deleteExpGroups(ctrlIds);
            })
                .catch(function (error) {
                return new Error(error);
            });
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function deleteExpGroups(expGroupIds) {
    return new Promise(function (resolve, reject) {
        if (!lodash_1.isEmpty(expGroupIds)) {
            var masterId_1 = expGroupIds.shift();
            Promise.map(expGroupIds, function (expGroupId) {
                console.log("Should be deleting " + expGroupId);
                return app.models.ExpGroups
                    .destroyAll({ expGroupId: expGroupId });
            })
                .then(function (results) {
                expGroupIds.unshift(masterId_1);
                resolve();
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
        else {
            resolve();
        }
    });
}
function deleteExpDesigns(expGroupIds) {
    return new Promise(function (resolve, reject) {
        if (lodash_1.isEmpty(expGroupIds)) {
            resolve();
        }
        else {
            var masterId_2 = expGroupIds.shift();
            Promise.map(expGroupIds, function (expGroupId) {
                console.log("Should be deleting " + expGroupId);
                return app.models.ExpDesign
                    .destroyAll({ controlGroupId: expGroupId });
            })
                .then(function (results) {
                expGroupIds.unshift(masterId_2);
                resolve();
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
    });
}
function updateExpAssays(model, expGroupIds) {
    return new Promise(function (resolve, reject) {
        if (lodash_1.isEmpty(expGroupIds)) {
            resolve();
        }
        else {
            var masterId_3 = expGroupIds.shift();
            Promise.map(expGroupIds, function (expGroupId) {
                // console.log(`Should be updating ${expGroupId} with ${masterId}`);
                return app.models[model]
                    .find({ where: { expGroupId: expGroupId } })
                    .then(function (results) {
                    Promise.map(results, function (row) {
                        console.log("Old Row: " + JSON.stringify(row));
                        //@ts-ignore
                        row.expGroupId = masterId_3;
                        app.models[model]
                            .upsert(row)
                            .then(function (results) {
                            console.log("New Row: " + JSON.stringify(results));
                            console.log('Done');
                            return;
                        })
                            .catch(function (error) {
                            return new Error(error);
                        });
                    })
                        .then(function () {
                        return;
                    })
                        .catch(function (error) {
                        return new Error(error);
                    });
                })
                    .then(function () {
                    return;
                })
                    .catch(function (error) {
                    return new Error(error);
                });
            })
                .then(function (results) {
                expGroupIds.unshift(masterId_3);
                resolve();
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
    });
}
function countExpDesigns() {
    return new Promise(function (resolve, reject) {
        app.models.ExpGroup
            .count()
            .then(function (count) {
            var limit = 10000;
            var numPages = Math.round(count / limit);
            var pages = lodash_1.range(0, numPages + 2);
            // pages = shuffle(pages);
            console.log("count is " + count);
            // pagination(1, count, 50);
            // console.log(`Pages: ${Math.round(count / 50)}`);
            // console.log(JSON.stringify(pages));
            resolve({ count: count, pages: pages, limit: limit });
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
//# sourceMappingURL=cleanup_exp_design.js.map