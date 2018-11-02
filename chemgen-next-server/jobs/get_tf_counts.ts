#!/usr/bin/env node

import {ExpAssay2reagentResultSet} from "../common/types/sdk";

const app = require('../server/server');
const axios = require('axios');
import Promise = require('bluebird');
import {
  ExpAssayResultSet, ExpGroupResultSet, ExpPlateResultSet,
  ModelPredictedCountsResultSet
} from "../common/types/sdk/models/index";
import {isFinite, isNaN, isNull, find, shuffle, isEqual, range, isUndefined} from 'lodash';
import {round, add, divide} from 'lodash';

let glob = require("glob-promise");
import Papa = require('papaparse');

const fs = require('fs');

// const search =  {or: [{screenId: 3}, {screenId: 4}]};
// const search = {screenId: 1};
const search = {};

countExpPlates()
  .then((paginationResults) => {
    return getPagedExpPlates(paginationResults)
  })
  .then(() => {
    console.log('finished!');
    process.exit(0)
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

function getPagedExpPlates(paginationResults) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    Promise.map(paginationResults.pages, (page) => {
      let skip = Number(page) * Number(paginationResults.limit);
      console.log(`Page: ${page} Skip: ${skip}`);
      let data = {};
      return app.models.ExpPlate
        .find({
          limit: paginationResults.limit,
          skip: skip,
          where: search,
        })
        .then((results: ExpPlateResultSet[]) => {
          app.winston.info(`First Plate ScreenId: ${results[0].screenId} Barcode: ${results[0].barcode}`);
          data['expPlates'] = results;
          //@ts-ignore
          return Promise.map(data.expPlates, (expPlate) => {
            return getCountsApi(expPlate);
          }, {concurrency: 1});
        })
        .then(() => {
          return;
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
  });
}

function getCountsApi(expPlate?: ExpPlateResultSet) {
  app.winston.info(`Getting counts for ${expPlate.plateImagePath}`);
  return new Promise((resolve, reject) => {
    let imagePath = `/mnt/image/${expPlate.plateImagePath}`;
    let counts = [
      `/mnt/image/${expPlate.plateImagePath}/${expPlate.instrumentPlateId}-tf-counts.csv`,
      `/mnt/image/${expPlate.plateImagePath}/${expPlate.instrumentPlateId}-tfcounts.csv`,
      `/mnt/image/${expPlate.plateImagePath}/${expPlate.instrumentPlateId}-tf_counts.csv`,
    ];
    //@ts-ignore
    Promise.map(counts, (countsFile: string) => {
      return axios.post('http://pyrite.abudhabi.nyu.edu:3005/tf_counts/1.0/api/get_counts', {
        image_path: imagePath,
        counts: countsFile,
      })
        .then((results: any) => {
          app.winston.info(`Found Counts ${countsFile}`);
          // console.log(contactSheetResults.data);
          return getAssays(results.data.counts);
          // return;
        })
        .then(() => {
          return;
        })
        .catch((error) => {
          //TODO The TF API throws an internal service error instead of just an empty result - which is stupid
          return;
        });
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function getAssays(counts) {
  return new Promise((resolve, reject) => {
    let or = [];
    counts.map((count) => {
      let imagePath = count.image_path;
      imagePath = imagePath.replace('/mnt/image/', '');
      imagePath = imagePath.replace('-autolevel.bmp', '');
      imagePath = imagePath.replace('-autolevel.png', '');
      count.imagePathModified = imagePath;
      or.push({assayImagePath: count.imagePathModified});
    });
    app.models.ModelPredictedCounts
      .find({
        where: {
          assayImagePath: {
            inq: counts.map((count) => {
              return count.imagePathModified;
            })
          }
        }
      })
      .then((countsInDb: ModelPredictedCountsResultSet[]) => {
        if (isEqual(countsInDb.length, counts.length)) {
          resolve();
        } else {
          return app.models.ExpAssay
            .find({where: {or: or}})
            .then((results: ExpAssayResultSet[]) => {
              return assignCountsToAssay(results, counts)
            })
            .then(() => {
              resolve();
            })
            .catch((error) => {
              console.log(error);
              reject(new Error(error));
            });
        }
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
}

// TODO Add all this math to the tf_counts get_counts api
function assignCountsToAssay(assays, counts) {
  app.winston.info(`Assigning counts to assay ${assays[0].assayImagePath}`);
  // console.log('In assignCountsToAssay');
  return new Promise((resolve, reject) => {
    app.models.ExpAssay2reagent
      .find({
        where: {
          assayId: {
            inq: assays.map((assay) => {
              return assay.assayId
            })
          }
        }
      })
      .then((expAssay2reagents: ExpAssay2reagentResultSet[]) => {
        //@ts-ignore
        return Promise.map(assays, (assay: ExpAssayResultSet) => {
          let countRow = find(counts, (count) => {
            if (!isNull(count) && !isUndefined(count)) {
              return isEqual(String(count.imagePathModified), String(assay.assayImagePath));
            }
          });
          // console.log(JSON.stringify(countRow));
          // Lethality as [ embryos / (embryos + larvae) ] ]
          // let percEmbLeth = 0;
          if (isNull(countRow) || isUndefined(countRow)) {
            return {};
          } else {
            // let percEmbLeth = 0;
            let percEmbLeth = divide(Number(countRow.egg), add(Number(countRow.egg), Number(countRow.larva)));
            //Do not know why this wasn't caught by isNan
            if (!isFinite(percEmbLeth) || isNull(percEmbLeth) || isUndefined(percEmbLeth) || isNaN(percEmbLeth)) {
              percEmbLeth = 0;
            }
            percEmbLeth = percEmbLeth * 100;
            percEmbLeth = round(percEmbLeth, 4);
            // larvae / ( embryos + larvae)
            // let percSter = 0;
            let percSter = divide(Number(countRow.larva), add(Number(countRow.egg), Number(countRow.larva)));
            if (!isFinite(percSter) || isNull(percSter) || isUndefined(percSter) || isNaN(percSter)) {
              percSter = 0;
            }
            percSter = percSter * 100;
            percSter = round(percSter, 4);
            // Brood size is calculated as [ (embryos + larvae) / worm ].
            let broodSize = divide(Number(countRow.larva), (add(Number(countRow.egg), Number(countRow.worm))));
            if (!isFinite(broodSize) || isNull(broodSize) || isUndefined(broodSize) || isNaN(broodSize)) {
              broodSize = 0;
            }
            broodSize = round(broodSize, 4);

            let newCounts = new ModelPredictedCountsResultSet({
              modelId: 3,
              assayId: assay.assayId,
              screenId: assay.screenId,
              plateId: assay.plateId,
              expGroupId: assay.expGroupId,
              assayImagePath: assay.assayImagePath,
              expWorkflowId: assay.expWorkflowId,
              wormCount: countRow.worm,
              larvaCount: countRow.larva,
              eggCount: countRow.egg,
              percEmbLeth: percEmbLeth,
              percSter: percSter,
              broodSize: broodSize,
            });
            let expAssay2reagent = find(expAssay2reagents, {assayId: newCounts.assayId});
            if (expAssay2reagent) {
              newCounts.expGroupType = expAssay2reagent.reagentType;
              newCounts.treatmentGroupId = expAssay2reagent.treatmentGroupId;
            }
            app.winston.info(`Creating Counts: ${newCounts.assayImagePath} ${newCounts.expWorkflowId}`);

            return app.models.ModelPredictedCounts
              .findOrCreate({
                where: {
                  and: [
                    {assayId: newCounts.assayId},
                    {modelId: newCounts.modelId}
                  ]
                }
              }, newCounts)
              .then((results) => {
                results[0].broodSize = broodSize;
                results[0].percSter = percSter;
                results[0].percEmbLeth = percEmbLeth;
                const modelPredictedCount: ModelPredictedCountsResultSet = results[0];
                if (!results[0].expGroupType && expAssay2reagent) {
                  app.winston.info(`Updating Counts: ${newCounts.assayImagePath}`);
                  modelPredictedCount.expGroupType = expAssay2reagent.reagentType;
                  modelPredictedCount.treatmentGroupId = expAssay2reagent.treatmentGroupId;
                  return app.models.ModelPredictedCounts.upsert(modelPredictedCount)
                } else {
                  return modelPredictedCount;
                }
              })
              .then(() => {
                return {}
              })
              .catch((error) => {
                console.log(JSON.stringify(error));
                return new Error(error);
              });
          }
        })
      })
      //@ts-ignore
      .then(() => {
        app.winston.info(`Complete assigning counts to assay ${assays[0].assayImagePath}`);
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

/**
 *
 * Deprecated - Old script got counts file directly from the file system
 * Now we use the get_counts api from the flask in chemgen-next-analysis-docker/counts/tf_counts
 *
 */

// This MUSt be run from a server with access to the file system
// Head of tfcounts files looks like:
// egg,egg_clump,image_path,larva,worm
// 30,1,/mnt/image/2017Apr03/8214/RNAi.N2.S1_A01-autolevel.bmp,94,3
// 5,0,/mnt/image/2017Apr03/8214/RNAi.N2.S1_A02-autolevel.bmp,80,12
// 4,0,/mnt/image/2017Apr03/8214/RNAi.N2.S1_A03-autolevel.bmp,99,4

// let globPatterns = [
//   "/mnt/image/2016*/*/*tf*.csv",
//   "/mnt/image/2017*/*/*tf*.csv",
//   "/mnt/image/2018*/*/*tf*.csv",
//   "/mnt/image/2014*/*/*tf*.csv",
//   "/mnt/image/2015*/*/*tf*.csv",
// ];
//
// globPatterns = shuffle(globPatterns);
//
// globAllTheThings(globPatterns)
//   .then(() => {
//     console.log('Finished no errors!');
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.log('Finished with errors!');
//     console.log(error);
//     process.exit(1);
//   });

function globAllTheThings(globs) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    Promise.map(globs, (globPattern) => {
      console.log(`Glob Pattern: ${globPattern}`);
      return globOneThing(globPattern);
    }, {concurrency: 1})
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

function globOneThing(globPattern) {
  return new Promise((resolve, reject) => {
    glob(globPattern)
      .then((files) => {
        console.log(`Processing ${files.length} counts`);
        files = shuffle(files);
        return getCounts(files);
      })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });

  });
}

function getCounts(files) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    Promise.map(files, (file) => {
      console.log(`Parsing ${file}`);
      return parseCountsFile(file)
    }, {concurrency: 1})
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

function parseCountsFile(countsFile) {
  return new Promise((resolve, reject) => {
    // let orig = [];
    let data = [];
    Papa.parse(fs.createReadStream(countsFile), {
      header: true,
      step: function (results, parser) {
        parser.pause();
        let imagePath = results.data[0].image_path;
        imagePath = imagePath.replace('/mnt/image/', '');
        imagePath = imagePath.replace('-autolevel.bmp', '');
        imagePath = imagePath.replace('-autolevel.png', '');
        results.data[0].imagePathModified = imagePath;
        // orig.push(contactSheetResults.data[0]);
        data.push(results.data[0]);
        if (data.length >= 10) {
          getAssays([data])
            .then(() => {
              data = [];
              parser.resume();
            })
            .catch((error) => {
              console.log(error);
              parser.abort();
            })
        } else {
          parser.resume();
        }
      },
      complete: function () {
        if (data.length) {
          getAssays([data])
            .then(() => {
              console.log('Finished parsing file!');
              resolve();
            })
            .catch((error) => {
              console.log(error);
              reject(new Error(error));
            })
        }
      },
    });
  });
}

function countExpPlates() {
  return new Promise((resolve, reject) => {
    app.models.ExpPlate
      .count(search)
      .then((count) => {
        let limit = 10;
        let numPages = Math.round(count / limit);
        let pages = range(0, numPages + 2);
        pages = shuffle(pages);
        console.log(`count is ${count}`);
        resolve({count: count, pages: pages, limit: limit});
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      })
  })
}

