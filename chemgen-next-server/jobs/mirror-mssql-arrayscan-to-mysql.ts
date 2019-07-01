const app = require('../server/server');
import {PlateResultSet} from "../common/types/sdk/models";
import {ArrayScanPlateMirrorResultSet} from "../common/types/sdk/models";
import {range} from 'lodash';
import Promise = require('bluebird');

getPlateRecords()
  .then(() => {
    app.winston.info('migrated platerecords!');
  })
  .catch((error) => {
    app.winston.error(error);
  });

function getPlateRecords() {
  return new Promise((resolve, reject) => {
    countPlateRecords()
      .then((paginationResults: { count, pages, limit }) => {
        Promise.map(paginationResults.pages, (page) => {
          let skip = Number(page) * Number(paginationResults.limit);
          app.winston.info(`Querying for Skip: ${skip} Limit: ${paginationResults.limit}`);
          return app.models.Plate
            .find({
              limit: paginationResults.limit,
              skip: skip,
            })
            .then((results: PlateResultSet[]) => {
              return mirrorToMysqlDB(results);
            })
            .catch((error) => {
              return new Error(error);
            })
        }, {concurrency: 1})
          .then(() => {
            resolve();
          })
          .catch((error) => {
            console.log(error);
            reject(new Error(error));
          });
      })
  });
}

function mirrorToMysqlDB(plateResults: PlateResultSet[]) {
  return new Promise((resolve, reject) => {
    Promise.map(plateResults, (plateResult: PlateResultSet) => {
      return app.models.ArrayScanPlateMirror
        .findOrCreate({where: {id: plateResult.id}},
          JSON.parse(JSON.stringify(plateResult)))
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
}

function countPlateRecords() {
  return new Promise((resolve, reject) => {
    app.models.Plate
      .count()
      .then((count) => {
        let limit = 1000;
        let numPages = Math.round(count / limit);
        let pages = range(0, numPages + 2);
        console.log(`count is ${count}`);
        resolve({count: count, pages: pages, limit: limit});
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      })
  })
}

