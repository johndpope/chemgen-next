"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
ExpScreenUploadWorkflow.load.workflows.doWork = function (workflowData) {
    console.log('Starting work');
    return new Promise(function (resolve, reject) {
        if (workflowData instanceof Array) {
            Promise.map(workflowData, function (data) {
                var biosampleType = data.biosampleType + "s";
                return ExpScreenUploadWorkflow.load.workflows[biosampleType].processWorkflow(data);
            })
                .then(function () {
                resolve();
            })
                .catch(function (error) {
                app.winston.error(error.stack);
                reject(new Error(error));
            });
        }
        else {
            var biosampleType = workflowData.biosampleType + "s";
            ExpScreenUploadWorkflow.load.workflows[biosampleType].processWorkflow(workflowData)
                .then(function () {
                resolve();
            })
                .catch(function (error) {
                console.log(error);
                reject(new Error(error));
            });
        }
    });
};
/**
 * THIS IS A DANGEROUS FUNCTION
 * IT REMOVES WORKFLOWS FROM THE DB
 * ONLY USE WITH EXTREME CAUTION
 * THERE IS NO WAY TO GET THIS DATA BACK ONCE ITS DELETED, EXCEPT BY RESTORING A BACKUP
 */
app.models.ExpScreenUploadWorkflow.load.removeWorkflowsFromDB = function (result) {
    return new Promise(function (resolve, reject) {
        app.models.ExpPlate
            .destroyAll({ expWorkflowId: String(result.id) })
            .then(function () {
            return app.models.ExpAssay2reagent.destroyAll({ expWorkflowId: String(result.id) });
        })
            .then(function () {
            return app.models.ExpGroup.destroyAll({ expWorkflowId: String(result.id) });
        })
            .then(function () {
            return app.models.ExpAssay.destroyAll({ expWorkflowId: String(result.id) });
        })
            .then(function () {
            return app.models.ExpDesign.destroyAll({ expWorkflowId: String(result.id) });
        })
            .then(function () {
            return app.models.ExpManualScores.destroyAll({ expWorkflowId: String(result.id) });
        })
            .then(function () {
            return app.models.ModelPredictedCounts.destroyAll({ expWorkflowId: String(result.id) });
        })
            .then(function () {
            return app.models.ExpScreenUploadWorkflow.destroyById(result.id);
        })
            .then(function (results) {
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ExpScreenUploadWorkflow.js.map