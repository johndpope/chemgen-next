#!/usr/bin/env node
import app = require('../server/server');
import Promise = require('bluebird');
import {isEqual, includes, shuffle, find, filter} from 'lodash';
import {ExpScreenUploadWorkflowResultSet} from "../common/types/sdk/models";

app.models.ExpScreenUploadWorkflow
  .find({fields: {id: true}})
  .then((expWorkflows: ExpScreenUploadWorkflowResultSet[]) => {
    app.winston.info(`There are ${expWorkflows.length} workflows total`);
    return app.models.ExpScreenUploadWorkflow
      .find({
        where: {
          id: {
            nin: expWorkflows.slice(0, 10).map((expWorkflow: ExpScreenUploadWorkflowResultSet) => {
              return String(expWorkflow.id);
            })
          }
        }
      })
      .then((filteredExpWorkflows: ExpScreenUploadWorkflowResultSet[]) => {
        app.winston.info(`There are ${filteredExpWorkflows.length} workflows after filtering`);
        // let expWorkflowFound = false;
        // filteredExpWorkflows.map((expWorkflow: ExpScreenUploadWorkflowResultSet) =>{
        //   if(find(expWorkflows, {id: String}))
        // });
        return;
      })
      .catch((error) => {
        return new Error(error);
      });
  })
  .catch((error) => {
    return new Error(error);
  });
