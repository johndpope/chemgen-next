import app  = require('../../../../server/server.js');
import Promise = require('bluebird');
import { ExpScreenUploadWorkflowResultSet} from "../../../types/sdk/models";
import {WorkflowModel} from "../../index";

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);

ExpScreenUploadWorkflow.load.workflows.doWork = function (workflowData: ExpScreenUploadWorkflowResultSet | ExpScreenUploadWorkflowResultSet[]) {
  console.log('Starting work');
  return new Promise((resolve, reject) => {
    if (workflowData instanceof Array) {
      Promise.map(workflowData, (data: ExpScreenUploadWorkflowResultSet) => {
        let biosampleType = `${data.biosampleType}s`;
        return ExpScreenUploadWorkflow.load.workflows[biosampleType].processWorkflow(data);
      })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          app.winston.error(error.stack);
          reject(new Error(error));
        });
    }
    else {
      let biosampleType = `${workflowData.biosampleType}s`;
      ExpScreenUploadWorkflow.load.workflows[biosampleType].processWorkflow(workflowData)
        .then(() => {
          resolve();
        })
        .catch((error) => {
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
app.models.ExpScreenUploadWorkflow.load.removeWorkflowsFromDB = function (result: ExpScreenUploadWorkflowResultSet) {
  return new Promise((resolve, reject) => {
    app.models.ExpPlate
      .destroyAll({expWorkflowId: String(result.id)})
      .then(() => {
        return app.models.ExpGroup.destroyAll({expWorkflowId: String(result.id)})
      })
      .then(() => {
        return app.models.ExpAssay2reagent.destroyAll({expWorkflowId: String(result.id)});
      })
      .then(() => {
        return app.models.ExpAssay.destroyAll({expWorkflowId: String(result.id)})
      })
      .then(() => {
        return app.models.ExpDesign.destroyAll({expWorkflowId: String(result.id)});
      })
      .then(() => {
        return app.models.ExpManualScores.destroyAll({expWorkflowId: String(result.id)};
      })
      .then(() => {
        return app.models.ModelPredictedCounts.destroyAll({expWorkflowId: String(result.id)});
      })
      .then(() => {
        return app.models.ExpScreenUploadWorkflow.destroyById(result.id);
      })
      .then((results) => {
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

