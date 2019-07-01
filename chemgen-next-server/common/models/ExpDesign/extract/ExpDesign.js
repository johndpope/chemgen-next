"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var _ = require("lodash");
var lodash_1 = require("lodash");
var ExpDesign = app.models.ExpDesign;
/**
 * An Experiment Set is the treatment + conditions
 * 3 rows - treat_rnai/ctrl_rnai, ctrl_rnai/ctrl_strain, treat_rnai/ctrl_null
 * Given a single expGroupId, get the set
 * If this is a part of the initial load workflow, these will probably be passed in as a parameter
 * Otherwise fetch them from the DB
 * TODO Add in some more error handling
 * TODO Add in more entrypoints to this method - ExpPlateId, ExpAssayId, reagentID
 * @param {number} expGroupId
 * @param {ExpDesignResultSet} expDesignRows
 */
ExpDesign.extract.workflows.getExpSetByExpGroupId = function (expGroupId, expDesignRows) {
    return new Promise(function (resolve, reject) {
        if (_.isEmpty(expDesignRows)) {
            ExpDesign.extract.workflows.getExpSetByExpGroupIdDB(expGroupId)
                .then(function (results) {
                resolve(results);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
        else {
            ExpDesign.extract.workflows.getExpSetByExpGroupIdMem(expGroupId, expDesignRows)
                .then(function (results) {
                resolve(results);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
    });
};
ExpDesign.extract.workflows.getExpSetByExpGroupIdMem = function (expGroupId, expDesignRows) {
    return new Promise(function (resolve) {
        var rows = _.filter(expDesignRows, function (expDesignRow) {
            return lodash_1.isEqual(expDesignRow.treatmentGroupId, expGroupId) || lodash_1.isEqual(expDesignRow.controlGroupId, expGroupId);
        });
        if (_.isEmpty(rows) || _.isNull(rows)) {
            resolve(null);
        }
        else {
            var treatmentId_1 = rows[0].treatmentGroupId;
            var expSet = _.filter(expDesignRows, function (expDesignRow) {
                return lodash_1.isEqual(expDesignRow.treatmentGroupId, treatmentId_1);
            });
            resolve(expSet);
        }
    });
};
ExpDesign.extract.workflows.getExpSetByExpGroupIdDB = function (expGroupId) {
    return new Promise(function (resolve, reject) {
        app.models.ExpDesign
            .find({
            where: { or: [{ treatmentGroupId: expGroupId }, { controlGroupId: expGroupId }] }
        })
            .then(function (results) {
            if (_.isEmpty(results) || _.isNull(results)) {
                //TODO Resolve an empty row or throw an error?
                //If this is empty there is something weird happening
                resolve();
            }
            else {
                return ExpDesign.extract.getTreatmentIdsDB(expGroupId, results);
            }
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpDesign.extract.getTreatmentIdsDB = function (expGroupId, expDesignRows) {
    return new Promise(function (resolve, reject) {
        if (ExpDesign.extract.isTreatmentId(expGroupId, expDesignRows)) {
            resolve(expDesignRows);
        }
        else {
            app.models.ExpDesign
                .find({ where: { treatmentGroupId: expDesignRows[0].treatmentGroupId } })
                .then(function (results) {
                resolve(results);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
    });
};
ExpDesign.extract.isTreatmentId = function (expGroupId, expDesignRows) {
    if (_.isEmpty(expDesignRows)) {
        return null;
    }
    else {
        return !_.isEmpty(_.find(expDesignRows, function (expDesignRow) {
            return _.isEqual(expDesignRow.treatmentGroupId, expGroupId);
        }));
    }
};
/**
 * Given an array of ExpDesignResultSets, get the ExpGroups
 * TODO Add condition to get this from PlateCollection
 * @param {ExpDesignResultSet[]} expDesignRows
 */
ExpDesign.extract.workflows.getExpGroup = function (expDesignRows) {
    return new Promise(function (resolve, reject) {
        var orCondition = [];
        _.map(expDesignRows, function (expDesignRow) {
            orCondition.push({ expGroupId: expDesignRow.treatmentGroupId }, { expGroupId: expDesignRow.controlGroupId });
        });
        app.models.ExpGroup
            .find({ where: { or: orCondition } })
            .then(function (results) {
            results = lodash_1.uniqBy(results, 'expGroupId');
            resolve({ expDesignList: expDesignRows, expGroupList: results });
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * Given an array of ExpGroupResultSets
 * Get all the Experiment Sets
 * ExperimentSets are a set of ExperimentDesigns grouped by TreatmentGroup
 * @param {ExpGroupResultSet[]} expGroups
 */
ExpDesign.extract.workflows.getExpSets = function (expGroups) {
    return new Promise(function (resolve, reject) {
        var or = [];
        expGroups = lodash_1.uniqBy(expGroups, 'expGroupId');
        expGroups.map(function (expGroup) {
            var obj = { treatmentGroupId: expGroup.expGroupId };
            or.push(obj);
            obj = { controlGroupId: expGroup.expGroupId };
            or.push(obj);
        });
        // First find some experimentGroups,
        app.models.ExpDesign
            .find({ where: { or: or } })
            .then(function (results) {
            // resolve(data);
            // contactSheetResults = uniqBy(contactSheetResults, 'controlGroupId');
            var or = [];
            results.map(function (result) {
                or.push({ treatmentGroupId: result.treatmentGroupId });
            });
            return app.models.ExpDesign
                .find({ where: { or: or } });
        })
            .then(function (results) {
            // contactSheetResults = uniqBy(contactSheetResults, 'controlGroupId');
            var groups = lodash_1.groupBy(results, 'treatmentGroupId');
            var expDesignSets = [];
            Object.keys(groups).map(function (group) {
                var t = [];
                groups[group].map(function (expDesignRow) {
                    t.push(expDesignRow);
                });
                expDesignSets.push(t);
            });
            resolve({ expGroups: expGroups, expDesigns: expDesignSets });
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ExpDesign.js.map