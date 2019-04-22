import app = require('../../../../../server/server.js');
import {WorkflowModel} from "../../../index";
import Promise = require('bluebird');
import {
  groupBy,
  shuffle,
  isEqual,
  find,
  has,
  isArray,
  get,
  filter,
  orderBy,
  camelCase,
  cloneDeep,
} from 'lodash';
import {ExpSetSearch, ExpSetSearchResults} from "../../../../types/custom/ExpSetTypes";

import config = require('config');

let knex = config.get('knex');

import redis = require('redis');
// @ts-ignore
Promise.promisifyAll(redis);
const redisClient = redis.createClient(config.get('redisUrl'));

const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 * This is the API used by the contact-sheet
 * Grab ExpSets that do not have a manual score and organize by plate
 * This one is a little different from the other ExpSet function, which assume that the user wants to see all the replicates together
 * Instead the user independently scores each plate
 * So we can just use the expWorkflowId to do all the lookups
 * This is not same as the others - where we may be searching for a gene/chemical across all the screens
 * @param {ExpSetSearch} search
 */
ExpSet.extract.workflows.getUnscoredExpSetsByPlate = function (search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    app.winston.info(`B: ${JSON.stringify(search)}`);
    search = new ExpSetSearch(search);
    app.winston.info(`A: ${JSON.stringify(search)}`);
    let data = new ExpSetSearchResults({});
    data.pageSize = 1;

    let sqlQuery = ExpSet.extract.buildNativeQueryExpWorkflowId(data, search, false);
    sqlQuery = sqlQuery.count();
    app.winston.info(`SqlQuery Count: ${sqlQuery.toString()}`);

    ExpSet.extract.buildUnscoredPaginationData(data, search, sqlQuery.toString())
      .then((data: ExpSetSearchResults) => {
        //TODO Should preferentially get plates, and if no plates are found THEN look for assays
        if (!data.totalPages) {
          app.winston.info(`No total pages!`);
          resolve(data);
        } else {
          return ExpSet.extract.workflows.getExpPlatesByScores(data, search, search.scoresExist)
            .then((data: ExpSetSearchResults) => {
              if (!data.expPlates || !data.expPlates.length) {
                resolve(data);
              } else {
                return ExpSet.extract.buildExpSetsByExpWorkflowId(data, search, data.expPlates[0].expWorkflowId);
              }
            })
            .then((data: ExpSetSearchResults) => {
              try {
                data = ExpSet.extract.insertExpManualScoresImageMeta(data);
              } catch (error) {
                app.winston.error(error);
              }
              data = ExpSet.extract.genAlbumsByPlate(data, search);
              data = ExpSet.extract.cleanUp(data, search);
              return data;
            })
        }
      })
      .then((data: ExpSetSearchResults) => {
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      })
  });
};

ExpSet.extract.workflows.getExpPlatesByScores = function (data: ExpSetSearchResults, search: ExpSetSearch, scoresExist: boolean) {
  return new Promise((resolve, reject) => {
    let sqlQuery = ExpSet.extract.buildNativeQueryExpWorkflowId(data, search, scoresExist);
    sqlQuery = sqlQuery
      .limit(1000);

    let ds = app.datasources.chemgenDS;
    app.winston.info(JSON.stringify(sqlQuery.toString()));
    ds.connector.execute(sqlQuery.toString(), [], function (error, rows) {
      if (error) {
        app.winston.error(error);
        return reject(new Error(error));
      } else {
        rows.map(rawRowData => {
          Object.keys(rawRowData).map((rowKey) => {
            rawRowData[camelCase(rowKey)] = rawRowData[rowKey];
            delete rawRowData[rowKey];
          });
        });
        data.skip = data.skip + data.pageSize;
        // rowData = compact(rowData);
        // app.winston.info(JSON.stringify(rowData));
        if (rows.length) {
          data.expPlates = [shuffle(rows)[0]];
        } else {
          data.expPlates = [];
        }
        return resolve(data);
      }
    });
  });
};

//TODO Add in preferentially choose ctrls from the same plate , then same date
ExpSet.extract.genExpGroupTypeAlbums = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  //For the expSet albums limit to 4
  let map = {
    'ctrlNullImages': 'ctrlReagentImages',
    'ctrlStrainImages': 'treatReagentImages',
  };

  data.albums.map((album) => {
    ['ctrlNullImages', 'ctrlStrainImages'].map((albumType) => {
      // expSet[albumType] = shuffle(expSet[albumType].slice(0, search.ctrlLimit));
    });
  });

  let expGroupTypes: any = groupBy(data.expAssay2reagents, 'reagentType');

  try {
    Object.keys(expGroupTypes).map((expGroup: string) => {
      let mappedExpGroup = ExpSet.extract.mapExpGroupTypes(expGroup);
      // app.winston.info(`MappedExpGroup: ${mappedExpGroup} ExpGroupType: ${expGroup}`);
      expGroupTypes[mappedExpGroup] = ExpSet.extract.genImageMeta(data, expGroupTypes[expGroup]);
      if (isEqual(mappedExpGroup, 'ctrlNull') || isEqual(mappedExpGroup, 'ctrlStrain')) {
        expGroupTypes[mappedExpGroup].map((imageMeta: any) => {
          imageMeta.treatmentGroupId = null;
        });
      }
      delete expGroupTypes[expGroup];
    });
    data.expGroupTypeAlbums = expGroupTypes;
    app.winston.info(`Complete: genExpGroupTypeAlbums`);
    return data;
  } catch (error) {
    app.winston.error(`Got an error`);
    app.winston.error(error);
    return data;
  }
};

ExpSet.extract.genAlbumsByPlate = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  ['treatReagent', 'ctrlReagent'].map((mappedExpGroup) => {
    data.expGroupTypeAlbums[mappedExpGroup] = groupBy(data.expGroupTypeAlbums[mappedExpGroup], 'plateId');
  });

  data = ExpSet.extract.extractPlatesNoScore(data, search);
  return data;
};

/**
 * Find the first set of plates that has no score
 * This seems like a stupidly complex way of doing this
 * TODO Think of a better way to do this
 * @param data
 * @param search
 */
ExpSet.extract.extractPlatesNoScore = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  let scoredPlateIds = [];
  let unScoredPlateIds = [];
  Object.keys(data.expGroupTypeAlbums.treatReagent).map((tplateId) => {
    let foundAssay = find(data.expGroupTypeAlbums.treatReagent[tplateId], {manualScoreByAssay: null});
    // This plate was already scored!
    if (!foundAssay) {
      scoredPlateIds.push(tplateId);
    } else {
      unScoredPlateIds.push(tplateId);
    }
  });

  // let treatReagentPlateIds = Object.keys(data.expGroupTypeAlbums.treatReagent);
  let ctrlReagentPlateIds = Object.keys(data.expGroupTypeAlbums.ctrlReagent);

  // TODO Add condition for all plates scores (which shouldn't happen)
  // Get a single plate to score
  let scoreThisPlate = unScoredPlateIds.shift();
  const treatI = Object.keys(data.expGroupTypeAlbums.treatReagent).indexOf(scoreThisPlate);

  // Most of the time N2s have the same number of replicates as the mel-28
  // But sometimes they don't
  // If they don't just get the last n2 plate and call it a day
  let ctrlPlateId = null;
  if (treatI < ctrlReagentPlateIds.length) {
    ctrlPlateId = ctrlReagentPlateIds[treatI];
  } else {
    ctrlPlateId = ctrlReagentPlateIds.pop();
  }

  data.expGroupTypeAlbums.treatReagent = data.expGroupTypeAlbums.treatReagent[scoreThisPlate];
  data.expGroupTypeAlbums.ctrlReagent = data.expGroupTypeAlbums.ctrlReagent[ctrlPlateId];
  data.expGroupTypeAlbums.treatReagent = orderBy(data.expGroupTypeAlbums.treatReagent, 'well');
  data.expGroupTypeAlbums.ctrlReagent = orderBy(data.expGroupTypeAlbums.ctrlReagent, 'well');

  data = ExpSet.extract.preferentiallyChooseScoresSamePlate(data, search);
  return data;
};


/**
 * For all secondary screens, and some primary, the ctrls are on the same plate
 * So a plate will have mel-28 + RNAis and mel-28 + L4440
 * This is true (so far) of all RNAi secondary screens and Chembridge primary screens
 * @param data
 * @param search
 */
ExpSet.extract.preferentiallyChooseScoresSamePlate = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  if (has(data.expGroupTypeAlbums, 'ctrlStrain')) {
    let treatPlateId = data.expGroupTypeAlbums.treatReagent[0].plateId;
    let ctrlStrainSamePlate = filter(data.expGroupTypeAlbums.ctrlStrain, {plateId: treatPlateId});
    if (isArray(ctrlStrainSamePlate) && ctrlStrainSamePlate.length) {
      data.expGroupTypeAlbums.ctrlStrain = ctrlStrainSamePlate;
    }
  }

  if (has(data.expGroupTypeAlbums, 'ctrlNull')) {
    let ctrlReagentPlateId = data.expGroupTypeAlbums.ctrlReagent[0].plateId;
    let ctrlNullSamePlate = filter(data.expGroupTypeAlbums.ctrlNull, {plateId: ctrlReagentPlateId});
    if (isArray(ctrlNullSamePlate) && ctrlNullSamePlate.length) {
      data.expGroupTypeAlbums.ctrlNull = ctrlNullSamePlate;
    }
  }
  return data;
};
