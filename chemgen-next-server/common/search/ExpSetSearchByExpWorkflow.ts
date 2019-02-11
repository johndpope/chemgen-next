import app = require('../../server/server.js');
import {WorkflowModel} from "../models";
import Promise = require('bluebird');
import {isObject, isEmpty, isArray, get, compact, uniq} from 'lodash';
import {IdResults, ReagentDataCriteria, ScreenMetaDataCriteria} from "../types/custom/search";

import {
  ExpAssay2reagentResultSet,
  ExpPlateResultSet,
  ExpScreenUploadWorkflowResultSet,
  RnaiLibraryResultSet
} from "../types/sdk/models";
import {ExpSetSearch} from "../types/custom/ExpSetTypes";

import * as client from "knex";
import config = require('config');

const knex = config.get('knex');

const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 * ExpScreenUploadWorkflow is a config that can then be casted into the database,
 * but on its own it has a lot of metadata about the experiment itself
 * So when search for :
 * wormStrains, temperatures, temperatureRanges, instrumentPlateIds
 */

/**
 * For now this is exposed as its own API endpoint for more complex forms
 * Use a mix of the mongoose ORM and loopback ORM to deeply query the expWorkflow configuration
 * Get the expWorkflowIds, and return them to the frontEnd
 * @param search
 */
ExpSet.extract.searchByExpWorkflowData = function (search: ScreenMetaDataCriteria) {
  app.winston.info('Searching for expWorkflowData');
  search = new ScreenMetaDataCriteria(search);
  app.winston.info(`Search : ${JSON.stringify(search)}`);
  return new Promise((resolve, reject) => {
    Promise.all(
      [
        app.models.ExpSet.extract.searchByScreenStage(search),
        app.models.ExpSet.extract.searchByScreenType(search),
        app.models.ExpSet.extract.searchByInstrumentPlateIds(search),
        app.models.ExpSet.extract.searchByTemperature(search),
        app.models.ExpSet.extract.searchByTemperatureRange(search),
        app.models.ExpSet.extract.searchByWormStrains(search),
      ]
    )
      .then((workflowIds: Array<Array<string>>) => {
        workflowIds = compact(workflowIds);
        let idResults = new IdResults();
        idResults.expWorkflowIds = idResults.getCommonResults(workflowIds);
        if (workflowIds.length) {
          resolve(idResults);
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

/**
 * Get a distinct set of temperatures from the expWorkflows
 * @param search
 */
ExpSet.extract.getAllTemperatures = function () {
  return new Promise((resolve, reject) => {

    app.models.ExpScreenUploadWorkflow.getDataSource()
      .connector.connect(function (error, db) {
      const collection = db.collection('ExpScreenUploadWorkflow');
      collection.distinct(
        "temperature",
        function (error, results) {
          let temperature = results.map((expWorkflow: { temperature } | string | number) => {
            if (isObject(expWorkflow) && get(expWorkflow, '$numberDouble')) {
              return get(expWorkflow, '$numberDouble');
            } else {
              return expWorkflow;
            }
          }).map((v) => {
            return Number(v);
          });
          resolve(uniq(temperature));
        });
    });
  });
};

/**
 * Search by the screenId
 * This is also implemented as the 'screenSearch', but we are reimplementing it here
 * @param search
 */
ExpSet.extract.searchByScreen = function (search: ScreenMetaDataCriteria) {
  return new Promise((resolve, reject) => {
    if (!get(search, 'screenId')) {
      resolve(null);
    } else {
      app.models.ExpScreenUploadWorkflow
        .find({
          where: {
            screenId: search.screenId
          }
        })
        .then((results: ExpScreenUploadWorkflowResultSet[]) => {
          const ids = results.map((expWorkflow: ExpScreenUploadWorkflowResultSet) => {
            return String(expWorkflow.id);
          });
          resolve(ids);
        })
        .catch((error) => {
          reject(new Error(error));
        })
    }
  });
};

/**
 * There is something weird about using the loopback API to search for temperature,
 * so we are using the mongoose api instead
 * @param search
 */
ExpSet.extract.searchByTemperature = function (search: ScreenMetaDataCriteria) {
  return new Promise((resolve, reject) => {
    if (!get(search, 'temperature')) {
      resolve(null);
    } else {

      const temp = search.temperature;
      app.models.ExpScreenUploadWorkflow
        .find({
          where: {
            or: [{'temperature.$numberDouble': String(temp)}, {'temperature': String(temp)}, {temperature: Number(temp)}]
          }, fields: {'id': true}
        })
        .then((results: ExpScreenUploadWorkflowResultSet[]) => {
          console.log(results);
          const ids = results.map((expWorkflow: ExpScreenUploadWorkflowResultSet) => {
            return String(expWorkflow.id);
          });
          resolve(ids);
        })
        .catch((error) => {
          console.log(error);
        });


      // app.models.ExpScreenUploadWorkflow.getDataSource()
      //   .connector.connect(function (error, db) {
      //   const collection = db.collection('ExpScreenUploadWorkflow');
      //   collection.find(
      //     {"temperature.$numberDouble": String(search.temperature)},
      //     function (error, results) {
      //       results.toArray().then((t) => {
      //         const ids = t.map((expWorkflow: ExpScreenUploadWorkflowResultSet) => {
      //           return String(expWorkflow.id);
      //         });
      //         resolve(ids);
      //       });
      //     });
      // });
      //
    }
  });
};

/**
 * Search by a range of temperatures
 * @param search
 */
ExpSet.extract.searchByTemperatureRange = function (search: ScreenMetaDataCriteria) {
  return new Promise((resolve, reject) => {
    if (!get(search, 'temperatureRange')) {
      resolve(null);
    } else {
      app.models.ExpScreenUploadWorkflow.getDataSource()
        .connector.connect(function (error, db) {
        const collection = db.collection('ExpScreenUploadWorkflow');
        let range = search.temperatureRange.sort();
        collection.find({"temperature.$numberDouble": {"$gt": range[0], "$lt": range[1]}}, function (error, results) {
          results.toArray().then((t) => {
            const ids = t.map((expWorkflow: ExpScreenUploadWorkflowResultSet) => {
              return String(expWorkflow.id);
            });
            resolve(ids);
          });
        });
      });
    }
  });
};

/**
 * Search by exp worm strains
 * This accepts wormStrain IDs
 * These don't include N2s, since N2s are all over the place
 * @param search
 */
ExpSet.extract.searchByWormStrains = function (search: ScreenMetaDataCriteria) {
  return new Promise((resolve, reject) => {
    let wormStrains = [];
    if (!get(search, 'wormStrainId')) {
      resolve(null);
    } else if (isArray(search.wormStrainId)) {
      search.wormStrainId.map((wormStrainId) => {
        wormStrains.push(String(wormStrainId));
        wormStrains.push(Number(wormStrainId));
      });
      wormStrains = uniq(wormStrains);
    } else {
      wormStrains.push(String(search.wormStrainId));
      wormStrains.push(Number(search.wormStrainId));
      wormStrains = uniq(wormStrains);
    }

    if (get(search, 'wormStrainId')) {
      app.models.ExpScreenUploadWorkflow
        .find({
          where: {
            'biosamples.experimentBiosample.id': {inq: wormStrains}
          }
        })
        .then((results: ExpScreenUploadWorkflowResultSet[]) => {
          const ids = results.map((expWorkflow: ExpScreenUploadWorkflowResultSet) => {
            return String(expWorkflow.id);
          });
          resolve(ids);
        })
        .catch((error) => {
          reject(new Error(error));
        });
    } else {
      resolve(null);
    }

  });
};

/**
 * Screen Stage is Primary or Secondary
 * @param search
 */
ExpSet.extract.searchByScreenStage = function (search: ScreenMetaDataCriteria) {
  app.winston.info(`Getting the screenStage`);
  return new Promise((resolve, reject) => {
    if (!get(search, 'screenStage')) {
      app.winston.info('No Screen Stage');
      resolve(null);
    } else {
      app.winston.info(`Searching for screenStage: ${search.screenStage}`);
      app.models.ExpScreenUploadWorkflow
        .find({where: {'screenStage': search.screenStage}})
        .then((results: ExpScreenUploadWorkflowResultSet[]) => {
          const ids = results.map((expWorkflow: ExpScreenUploadWorkflowResultSet) => {
            return String(expWorkflow.id);
          });
          resolve(ids);
        })
        .catch((error) => {
          reject(new Error(error));
        });
    }
  });
};

/**
 * Screen Type - Permissive, Restrictive
 * @param search
 */
ExpSet.extract.searchByScreenType = function (search: ScreenMetaDataCriteria) {
  app.winston.info('Searching for screenType');
  return new Promise((resolve, reject) => {
    if (!get(search, 'screenType')) {
      resolve(null);
    } else {
      app.models.ExpScreenUploadWorkflow
        .find({where: {'screenType': search.screenType}})
        .then((results: ExpScreenUploadWorkflowResultSet[]) => {
          const ids = results.map((expWorkflow: ExpScreenUploadWorkflowResultSet) => {
            return String(expWorkflow.id);
          });
          app.winston.info(`There are ${ids.length} expWorkflows with screenType: ${search.screenType}`);
          resolve(ids);
        })
        .catch((error) => {
          reject(new Error(error));
        });
    }
  });
};

ExpSet.extract.searchByInstrumentPlateIds = function (search: ScreenMetaDataCriteria) {
  return new Promise((resolve, reject) => {
    if (!get(search, 'instrumentPlateIds')) {
      resolve(null);
    } else {
      app.models.ExpScreenUploadWorkflow.getDataSource()
        .connector.connect(function (error, db) {
          const collection = db.collection('ExpScreenUploadWorkflow');
          collection.find({
            $or: [
              {
                "experimentGroups.treat_rnai.plates": {
                  "$elemMatch": {
                    "instrumentPlateId": {"$in": search.plateIds},
                  }
                }
              },
              {
                "experimentGroups.ctrl_rnai.plates": {
                  "$elemMatch": {
                    "instrumentPlateId": {"$in": search.plateIds},
                  }
                }
              },
              {
                "experimentGroups.ctrl_strain.plates": {
                  "$elemMatch": {
                    "instrumentPlateId": {"$in": search.plateIds},
                  }
                }
              },
              {
                "experimentGroups.ctrl_null.plates": {
                  "$elemMatch": {
                    "instrumentPlateId": {"$in": search.plateIds},
                  }
                }
              },
              {
                "experimentGroups.treat_rnai.plates": {
                  "$elemMatch": {
                    "platebarcode": {"$in": search.plateIds},
                  }
                }
              },
              {
                "experimentGroups.ctrl_rnai.plates": {
                  "$elemMatch": {
                    "platebarcode": {"$in": search.plateIds},
                  }
                }
              },
              {
                "experimentGroups.ctrl_strain.plates": {
                  "$elemMatch": {
                    "platebarcode": {"$in": search.plateIds},
                  }
                }
              },
              {
                "experimentGroups.ctrl_null.plates": {
                  "$elemMatch": {
                    "platebarcode": {"$in": search.plateIds},
                  }
                }
              },
            ]
          }, function (error, results) {
            results.toArray()
              .then((t) => {
                const ids = t.map((expWorkflow: ExpScreenUploadWorkflowResultSet) => {
                  return String(expWorkflow.id);
                });
                resolve(ids);
              });
          });
        }
      );
    }
  });
};

/**
 * This resolves the expWorkflows that has a given gene name -
 * Gene name can be the gene name, cosmid ID, or wormbase ID
 * @param search
 */
ExpSet.extract.getExpWorkflowsByRNAiReagentData = function (search: ReagentDataCriteria) {
  return new Promise((resolve, reject) => {
    //Get the RNAiLibrary Results
    //Search stocks for plates
    //Search Plates for ExpWorkflowIds
    //But this is stupid, the exp_workflow_id should be in the stock tables
    //It would also be nice if everything was in the plate plan, and then could search there directly
    search.rnaiList = compact(search.rnaiList);
    if (search.rnaiList.length) {
      app.models.RnaiLibrary.extract.workflows
        .getRnaiLibraryFromUserGeneList(search.rnaiList, search)
        .then((rnaiLibraryResults: RnaiLibraryResultSet[]) => {
          let query = knex('rnai_library_stock')
            .distinct('plate_id');
          rnaiLibraryResults.map((rnaiLibraryResult: RnaiLibraryResultSet) => {
            query
              .orWhere({library_id: rnaiLibraryResult.libraryId, rnai_id: rnaiLibraryResult.rnaiId})
          });
          query.select();
          return query;
        })
        .then((plateIds: Array<{ plate_id }>) => {
          // return;
          return app.models.ExpPlate
            .find({
              where: {
                plateId: {
                  inq: plateIds.map((plateId) => {
                    return plateId.plate_id;
                  })
                }
              },
              fields: {
                expWorkflowId: true,
              }
            });
        })
        .then((expPlateResults: ExpPlateResultSet[]) => {
          resolve(
            uniq(expPlateResults.map((expPlate) => {
              return expPlate.expWorkflowId;
            }))
          );
        })
        .catch((error) => {
          reject(new Error(error));
        });
    } else {
      resolve(null);
    }
  });
};

/**
 * TODO - If we are ONLY searching for RNAi (no other values), then just return the expSet list
 * TODO - BUT if we are searching for RNAis in permissive blahblahblah
 * THEN we need to combine those
 * This resolves the expSets that has a given gene name -
 * Gene name can be the gene name, cosmid ID, or wormbase ID
 * @param search
 */
ExpSet.extract.getExpSetsByRNAiReagentData = function (search: ReagentDataCriteria) {
  return new Promise((resolve, reject) => {
    search.rnaiList = compact(search.rnaiList);
    console.log(`Search is : ${JSON.stringify(search)}`);
    if (search.rnaiList.length) {
      app.models.RnaiLibrary.extract.workflows
        .getRnaiLibraryFromUserGeneList(search.rnaiList, search)
        .then((rnaiLibraryResults: RnaiLibraryResultSet[]) => {
          let query = knex('exp_assay2reagent')
            .distinct('treatment_group_id');
          rnaiLibraryResults.map((rnaiLibraryResult: RnaiLibraryResultSet) => {
            query
              .orWhere({library_id: rnaiLibraryResult.libraryId, reagent_id: rnaiLibraryResult.rnaiId})
          });
          query.andWhere({reagent_type: 'treat_rnai'});
          query.select('exp_workflow_id');
          return query;
        })
        .then((expAssay2ReagentResults: Array<{ treatment_group_id, exp_workflow_id }>) => {
          let results = {expWorkflowIds: [], expGroupIds: [], expGroups: []};
          expAssay2ReagentResults.map((expAssay) => {
            results.expWorkflowIds.push(expAssay.exp_workflow_id);
            results.expGroupIds.push(expAssay.treatment_group_id);
            results.expGroups.push({expWorkflowId: expAssay.exp_workflow_id, expGroupId: expAssay.treatment_group_id})
          });
          resolve(results);
        })
        .catch((error) => {
          reject(new Error(error));
        });
    } else {
      resolve(null);
    }
  });
};

/**
 * Thank you stack overflow!
 * Find values that are in all arrays
 * In this case we run a bunch of searches on the expWorkflows
 * Then get Ids that are in common across all
 * @param arrays
 */
function getCommonElements(arrays) {//Assumes that we are dealing with an array of arrays of integers
  let currentValues = {};
  let commonValues = {};
  for (let i = arrays[0].length - 1; i >= 0; i--) {//Iterating backwards for efficiency
    currentValues[arrays[0][i]] = 1; //Doesn't really matter what we set it to
  }
  for (let i = arrays.length - 1; i > 0; i--) {
    let currentArray = arrays[i];
    for (let j = currentArray.length - 1; j >= 0; j--) {
      if (currentArray[j] in currentValues) {
        commonValues[currentArray[j]] = 1; //Once again, the `1` doesn't matter
      }
    }
    currentValues = commonValues;
    commonValues = {};
  }
  return Object.keys(currentValues).map(function (value) {
    // return parseInt(value);
    return value;
  });
}

