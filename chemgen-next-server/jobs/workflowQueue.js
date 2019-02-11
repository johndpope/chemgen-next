"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var app = require("../server/server");
var workflowQueue = function (job) {
    return new Promise(function (resolve, reject) {
        console.log("Starting workflowQueue " + new Date(Date.now()));
        app.models.ExpScreenUploadWorkflow.load.workflows.doWork(job.data.workflowData)
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
module.exports = workflowQueue;
//# sourceMappingURL=workflowQueue.js.map