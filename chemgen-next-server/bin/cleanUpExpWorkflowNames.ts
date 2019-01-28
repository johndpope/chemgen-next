#!/usr/bin/env node

import {ExpScreenUploadWorkflowResultSet} from "../common/types/sdk/models";

import app = require('../server/server');
import Promise = require('bluebird');
import {get, isObject, isEqual, find, filter, padStart} from 'lodash';


let search: any = {};
search = {
  screenStage: 'primary',
  screenName: /RNAi/,
};

const libraryCode = 'AHR';
const site = 'AD';
const reagentType = 'RNAi';

processWorkflows();

function processWorkflows() {
  app.models.ExpScreenUploadWorkflow
    .find({
      where: search,
      // limit: 10,
    })
    .then((results) => {

      // console.log(results);
      const names = results.map((expWorkflow: ExpScreenUploadWorkflowResultSet) => {
        const name =  createExpWorkflowName(expWorkflow);
        expWorkflow.name = name;
        return name;
        // console.log(name);
      });
      // console.log(names);
      return Promise.map(results, (expWorkflow: ExpScreenUploadWorkflowResultSet) =>{
        return app.models.ExpScreenUploadWorkflow
          .upsert(expWorkflow)
          .then((upsertResults) =>{
            return upsertResults;
          })
          .catch((error) =>{
            return new Error(error);
          })
      });

    })
    .then(() =>{
      console.log('DONE!');
      process.exit(0);
    })
    .catch((error) => {
      console.log(error);
      console.log('DONE WITH ERROR!');
      process.exit(1);
      return new Error(error);
    })
}

function createExpWorkflowName(expWorkflow: ExpScreenUploadWorkflowResultSet) {
  const date = new Date(expWorkflow.assayDates[0]);
  let year, month, day;
  try {
    year = date.getFullYear();
    month = padStart(String(date.getMonth() + 1), 2, '0');
    day = padStart(String(date.getDate()), 2, '0');
  } catch (error) {
    console.log('WTH');
    console.log(error);
  }

  let conditionCode = '';
  if (isEqual(expWorkflow.screenType, 'restrictive')) {
    conditionCode = 'S';
  } else {
    conditionCode = 'E';
  }
  // expWorkflow.site = site;
  let name = '';
  try {
    name = [`${site} ${reagentType} ${libraryCode} `,
      `${year}-${month}-${day} `,
      `${expWorkflow.biosamples.experimentBiosample.name} `,
      `${expWorkflow.biosamples.ctrlBiosample.name} `,
      `${getTemperature(expWorkflow)} `,
      `${conditionCode} Chr ${expWorkflow.search.rnaiLibrary.chrom} ${expWorkflow.search.rnaiLibrary.plate} ${expWorkflow.search.rnaiLibrary.quadrant} `].join('');
    return name;
  } catch (error) {
    console.log('error!');
  }
}

function getTemperature(expWorkflow) {
  if (isObject(expWorkflow.temperature)) {
    if (get(expWorkflow, ['temperature', '$numberDouble'])) {
      return get(expWorkflow, ['temperature', '$numberDouble']);
    }
  } else {
    return expWorkflow.temperature;
  }
}
