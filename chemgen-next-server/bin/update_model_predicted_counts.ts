#!/usr/bin/env node

const app = require('../server/server');
// import {WorkflowModel} from "../../common/models";
import Promise = require('bluebird');
import {
  ExpAssayResultSet, ExpGroupResultSet,
  ModelPredictedCountsResultSet,
} from "../common/types/sdk/models";
import {isEmpty, find, range, isEqual, flatten, shuffle} from 'lodash';

const cluster = require('cluster');
const http = require('http');
let numCPUs = require('os').cpus().length;
numCPUs = 4;

const path = require('path');
const fs = require('fs');

let search = {
  or: [
    {expWorkflowId: null},
    {treatmentGroupId: null}
  ],
  and: [
    {expGroupType: {neq: 'ctrl_strain'}},
    {expGroupType: {neq: 'ctrl_null'}},
  ]
};


// countModelPredictedCounts()
//   .then((paginationResults) => {
//     return getPagedCounts(paginationResults)
//   })
//   .then(() => {
//     console.log('finished!');
//     process.exit(0)
//   })
//   .catch((error) => {
//     console.log(error);
//     process.exit(1);
//   });

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  console.log(`Worker ${process.pid} started`);
  updateModelPredictedCounts()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.log(error);
      process.exit(1);
    })
}

function updateModelPredictedCounts() {
  return new Promise((resolve, reject) => {
    countModelPredictedCounts()
      .then((paginationResults: {pages, limit}) => {
        let page = paginationResults.pages[0];
        let skip = Number(page) * Number(paginationResults.limit);
        console.log(`Page: ${page} Skip: ${skip}`);
        return app.models.ModelPredictedCounts
          .find({
            limit: paginationResults.limit,
            skip: skip,
            where: search
          })
      })
      .then((results: ModelPredictedCountsResultSet[]) => {
        return getExpAssays(results)
      })
      .then((results) => {
        if (results) {
          return updateModelPredictedCounts()
            .then(() => {
              resolve();
            })
            .catch((error) => {
              reject(new Error(error));
            })
        } else {
          resolve();
        }
      })
      .catch((error) => {
        return new Error(error);
      });

  })

}

function getPagedCounts(paginationResults) {
  return new Promise((resolve, reject) => {
    Promise.map(paginationResults.pages, (page) => {
      let skip = Number(page) * Number(paginationResults.limit);
      console.log(`Page: ${page} Skip: ${skip}`);
      return app.models.ModelPredictedCounts
        .find({
          limit: paginationResults.limit,
          skip: skip,
          where: search,
        })
        .then((results: ModelPredictedCountsResultSet[]) => {
          console.log(`Results Len : ${results.length}`);
          // console.log(JSON.stringify(contactSheetResults));
          return getExpAssays(results);
        })
        .catch((error) => {
          return new Error(error);
        })
    }, {concurrency: 1})
      .then(() => {
        app.winston.info('DONE');
        // console.log(JSON.stringify(paginationResults.count));
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

function getExpAssays(modelPredictedCounts: ModelPredictedCountsResultSet[]) {
  return new Promise((resolve, reject) => {
    if (isEmpty(modelPredictedCounts)) {
      resolve(false);
    } else {
      app.models.ExpAssay
        .find({
          where: {
            assayId: {
              inq: modelPredictedCounts.map((counts) => {
                return counts.assayId;
              })
            }
          }
        })
        .then((expAssays: ExpAssayResultSet[]) => {
          return Promise.map(modelPredictedCounts, (modelPredictedCount: ModelPredictedCountsResultSet) => {
            let expAssay = find(expAssays, (expAssay) => {
              return isEqual(expAssay.assayId, modelPredictedCount.assayId);
            });
            return app.models.ExpGroup
              .findOne({where: {expGroupId: expAssay.expGroupId}})
              .then((expGroup: ExpGroupResultSet) => {

                // app.winston.info(`Old Counts: ${JSON.stringify(modelPredictedCount)}`);
                modelPredictedCount.expWorkflowId = expAssay.expWorkflowId;
                modelPredictedCount.expGroupId = expAssay.expGroupId;
                modelPredictedCount.expGroupType = expGroup.expGroupType;
                if (expAssay.expGroupId) {
                  return app.models.ExpDesign.extract.workflows
                    .getExpSets([{expGroupId: expAssay.expGroupId}])
                    .then((results) => {
                      modelPredictedCount.treatmentGroupId = results.expDesigns[0][0].treatmentGroupId;
                      // app.winston.info(`New Counts: ${JSON.stringify(modelPredictedCount)}`);
                      return app.models.ModelPredictedCounts.upsert(modelPredictedCount)
                    })
                    .then((results) => {
                      return;
                    })
                    .catch((error) => {
                      app.winston.error(error);
                      reject(new Error(error));
                    });
                } else {
                  // app.winston.info(`New Counts: ${JSON.stringify(modelPredictedCount)}`);
                  return app.models.ModelPredictedCounts
                    .upsert(modelPredictedCount);
                }
              })
              .catch((error) => {
                return new Error(error);
              });
          });
        })
        .then((results: ModelPredictedCountsResultSet[]) => {
          // app.winston.info('got to final out');
          // contactSheetResults = flatten(contactSheetResults);
          resolve(true);
        })
        .catch((error) => {
          reject(new Error(error));
        })
    }
  });
}

function countModelPredictedCounts() {
  return new Promise((resolve, reject) => {
    app.models.ModelPredictedCounts
      .count(search)
      .then((count) => {
        let limit = 1000;
        let numPages = Math.round(count / limit);
        let pages = range(0, numPages + 2);
        pages = shuffle(pages);
        resolve({count: count, pages: pages, limit: limit});
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      })
  })
}
