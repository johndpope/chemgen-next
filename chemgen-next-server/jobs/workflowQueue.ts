import Promise = require('bluebird');
import app = require('../server/server');

const workflowQueue = function (job) {
  return new Promise((resolve, reject) => {
    console.log(`Starting workflowQueue ${new Date(Date.now())}`);
    app.models.ExpScreenUploadWorkflow.load.workflows.doWork(job.data.workflowData)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};

module.exports = workflowQueue;
