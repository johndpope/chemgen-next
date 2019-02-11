#!/usr/bin/env node

import {ExpScreenUploadWorkflowResultSet} from "../common/types/sdk/models";

import app = require('../server/server');
import jobQueues = require('./defineQueues');
import Promise = require('bluebird');
import {isEqual, includes, shuffle, find, filter} from 'lodash';

const config = require('config');
const knex = config.get('knex');

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
  return new Promise((resolve, reject) => {
    app.models.ExpScreenUploadWorkflow
      .find({})
      .then((expWorkflows: ExpScreenUploadWorkflowResultSet[]) => {
        //TODO This should just get a distinct exp_workflow_ids from the exp_plate table
        return app.models.ExpManualScores.extract.buildNativeQueryDistinctTreatmentIdsGroupBy()
          .then((expWorkflowsWithExpSets: Array<{ exp_workflow_id, count_treatment_group_id }>) => {
            let expWorkflowsWithZeroExpSets: ExpScreenUploadWorkflowResultSet[] = filter(expWorkflows, (expWorkflow) => {
              return !find(expWorkflowsWithExpSets, {exp_workflow_id: String(expWorkflow.id)});
            });
            app.winston.info(`Found ${expWorkflowsWithZeroExpSets.length} workflows with no corresponding entry in the DB`);
            // return expWorkflowsWithZeroExpSets;
            // expWorkflowsWithZeroExpSets = shuffle(expWorkflowsWithZeroExpSets);
            return Promise.map(expWorkflowsWithZeroExpSets.slice(0, 100), (expWorkflowWithZeroExpSets: ExpScreenUploadWorkflowResultSet) => {
              expWorkflowWithZeroExpSets = JSON.parse(JSON.stringify(expWorkflowWithZeroExpSets));
              app.winston.info(`Queueing: ${expWorkflowWithZeroExpSets.name}`);
              return app.models.ExpScreenUploadWorkflow.load.workflows.doWork(expWorkflowWithZeroExpSets)
                .then(() => {
                  return;
                })
                .catch((error) => {
                  return;
                })
            }, {concurrency: 2});
          })
          .then(() => {
            return;
          })
          .catch((error) => {
            return new Error(error);
          });
      })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
}

const workflowQueueZeroExpSets = function (job) {
  return new Promise((resolve, reject) => {
    console.log('Starting workflowQueueZeroExpSets');
    knex('exp_design')
      .distinct('exp_workflow_id')
      .select()
      .then((results: Array<{ exp_workflow_id }>) => {
        const expWorkflowIds = results.map((result) => {
          return result.exp_workflow_id;
        });
        app.winston.info(`There are ${expWorkflowIds.length} distinct expWorkflowIds in the ExpDesign Table`);
        return app.models.ExpScreenUploadWorkflow
          .count({
            id: {nin: expWorkflowIds}
          })
          .then((count) => {
            app.winston.info(`There are ${JSON.stringify(count)} workflows left`);
            return app.models.ExpScreenUploadWorkflow
              .find({
                where:
                  {
                    id: {nin: expWorkflowIds}
                  },
                // limit: 5
              });
          })
      })
      .then((expWorkflows: ExpScreenUploadWorkflowResultSet[]) => {
        app.winston.info(`Found: ${JSON.stringify(expWorkflows.length)}`);
        expWorkflows = shuffle(expWorkflows).slice(0, 5);
        app.winston.info(`Queueing : ${expWorkflows.length}`);
        return Promise.map(expWorkflows, (expWorkflowWithZeroExpSets: ExpScreenUploadWorkflowResultSet) => {
          expWorkflowWithZeroExpSets = JSON.parse(JSON.stringify(expWorkflowWithZeroExpSets));
          app.winston.info(`Queueing: ${expWorkflowWithZeroExpSets.name}`);
          return app.models.ExpScreenUploadWorkflow.load.workflows.doWork(expWorkflowWithZeroExpSets)
            .then(() => {
              return;
            })
            .catch((error) => {
              return;
            })
        }, {concurrency: 4});
      })
      .then(() => {
        process.exit(0);
        resolve();
      })
      .catch((error) => {
        process.exit(1);
        reject(new Error(error));
      });
  });
};

workflowQueueZeroExpSets({});

module.exports = workflowQueueZeroExpSets;

