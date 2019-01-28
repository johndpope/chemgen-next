#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../server/server");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var config = require('config');
var knex = config.get('knex');
// processWorkflowsWithZeroExpSets()
//   .then(() => {
//     app.winston.info('DONE');
//     process.exit(0);
//   })
//   .catch((error) => {
//     app.winston.error('DONE WITH ERROR');
//     app.winston.error(error);
//     process.exit(1);
//   });
function processWorkflowsWithZeroExpSets() {
    return new Promise(function (resolve, reject) {
        app.models.ExpScreenUploadWorkflow
            .find({})
            .then(function (expWorkflows) {
            //TODO This should just get a distinct exp_workflow_ids from the exp_plate table
            return app.models.ExpManualScores.extract.buildNativeQueryDistinctTreatmentIdsGroupBy()
                .then(function (expWorkflowsWithExpSets) {
                var expWorkflowsWithZeroExpSets = lodash_1.filter(expWorkflows, function (expWorkflow) {
                    return !lodash_1.find(expWorkflowsWithExpSets, { exp_workflow_id: String(expWorkflow.id) });
                });
                app.winston.info("Found " + expWorkflowsWithZeroExpSets.length + " workflows with no corresponding entry in the DB");
                // return expWorkflowsWithZeroExpSets;
                // expWorkflowsWithZeroExpSets = shuffle(expWorkflowsWithZeroExpSets);
                return Promise.map(expWorkflowsWithZeroExpSets.slice(0, 100), function (expWorkflowWithZeroExpSets) {
                    expWorkflowWithZeroExpSets = JSON.parse(JSON.stringify(expWorkflowWithZeroExpSets));
                    app.winston.info("Queueing: " + expWorkflowWithZeroExpSets.name);
                    return app.models.ExpScreenUploadWorkflow.load.workflows.doWork(expWorkflowWithZeroExpSets)
                        .then(function () {
                        return;
                    })
                        .catch(function (error) {
                        return;
                    });
                }, { concurrency: 2 });
            })
                .then(function () {
                return;
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
var workflowQueueZeroExpSets = function (job) {
    return new Promise(function (resolve, reject) {
        console.log('Starting workflowQueueZeroExpSets');
        knex('exp_design')
            .distinct('exp_workflow_id')
            .select()
            .then(function (results) {
            var expWorkflowIds = results.map(function (result) {
                return result.exp_workflow_id;
            });
            return app.models.ExpScreenUploadWorkflow
                .find({
                where: {
                    expWorkflowId: { nin: expWorkflowIds }
                },
                limit: 5
            });
        })
            .then(function (expWorkflows) {
            app.winston.info("Queueing : " + expWorkflows.length);
            return Promise.map(expWorkflows, function (expWorkflowWithZeroExpSets) {
                expWorkflowWithZeroExpSets = JSON.parse(JSON.stringify(expWorkflowWithZeroExpSets));
                app.winston.info("Queueing: " + expWorkflowWithZeroExpSets.name);
                return app.models.ExpScreenUploadWorkflow.load.workflows.doWork(expWorkflowWithZeroExpSets)
                    .then(function () {
                    return;
                })
                    .catch(function (error) {
                    return;
                });
            }, { concurrency: 1 });
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
// workflowQueueZeroExpSets({});
module.exports = workflowQueueZeroExpSets;
//# sourceMappingURL=processExpWorkflowsZeroExpSets.js.map