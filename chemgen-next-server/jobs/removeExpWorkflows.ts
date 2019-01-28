#!/usr/bin/env node

import {ExpPlateResultSet, ExpScreenUploadWorkflowResultSet} from "../common/types/sdk/models";

const program = require('commander');
import app = require('../server/server');
import Promise = require('bluebird');
import {isEqual, shuffle, find, filter} from 'lodash';


/**
 * Sometimes we need to remove improperly added workflows
 */

app.models.ExpScreenUploadWorkflow
  .find({
    where: {
      name: {
        like: /CHEM Primary/
      }
    },
  })
  .then((expWorkflows: ExpScreenUploadWorkflowResultSet[]) => {
    app.winston.info(`Removing ${expWorkflows.length} from the DB`);
    // return;
    return Promise.map(shuffle(expWorkflows), (expWorkflow: ExpScreenUploadWorkflowResultSet) => {
      app.winston.info(`Removing Name: ${expWorkflow.name} ID: ${expWorkflow.id}`);
      // return app.models.ExpScreenUploadWorkflow.load.removeWorkflowsFromDB(expWorkflow)
      // console.log(createSqlStatement(expWorkflow));
      return;
    }, {concurrency: 1});
  })
  .catch((error) => {
    app.winston.error(error);
  });

function createSqlStatement(expWorkflow: ExpScreenUploadWorkflowResultSet){
  const statements = [
    `DELETE FROM exp_plate where exp_workflow_id = '${String(expWorkflow.id)}';`,
    `DELETE FROM exp_assay2reagent where exp_workflow_id = '${String(expWorkflow.id)}';`,
    `DELETE FROM exp_assay where exp_workflow_id = '${String(expWorkflow.id)}';`,
    `DELETE FROM exp_group where exp_workflow_id = '${String(expWorkflow.id)}';`,
    `DELETE FROM exp_design where exp_workflow_id = '${String(expWorkflow.id)}';`,
    `DELETE FROM exp_manual_scores where exp_workflow_id = '${String(expWorkflow.id)}';`,
    `DELETE FROM model_predicted_counts where exp_workflow_id = '${String(expWorkflow.id)}';`,
  ];
  return statements.join("\n");
}
