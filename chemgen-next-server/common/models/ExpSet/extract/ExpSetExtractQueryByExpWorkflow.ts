import app = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import {
  ExpAssay2reagentResultSet, ExpAssayResultSet, ExpDesignResultSet, ExpManualScoresResultSet,
  ExpPlateResultSet,
  ExpScreenResultSet, ExpScreenUploadWorkflowResultSet,
  ModelPredictedCountsResultSet
} from "../../../types/sdk/";
import {
  get,
  compact,
  find,
  uniqBy,
  isEqual,
  slice,
  shuffle,
  isEmpty,
  isArray,
  groupBy,
} from 'lodash';
import Promise = require('bluebird');
import {ExpSetSearch, ExpSetSearchResults} from "../../../types/custom/ExpSetTypes";
import config = require('config');
import redis = require('redis');
// @ts-ignore
Promise.promisifyAll(redis);
const redisClient = redis.createClient(config.get('redisUrl'));

//@ts-ignore
const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 * Grab ExpSets by workflowId - this is the the most optimized function if there is no geneList/chemicalList
 * @param {ExpSetSearch} search
 */
ExpSet.extract.workflows.getExpSetsByWorkflowId = function (search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    //Since the result is already very large - the pageSize is 1
    search.pageSize = 1;
    search = new ExpSetSearch(search);
    let data = new ExpSetSearchResults({});
    app.winston.info(`Search: ${JSON.stringify(search)}`);

    let or = ExpSet.extract.buildQueryExpWorkflow(data, search);
    let searchQuery: any = {
      limit: search.pageSize,
      skip: search.skip,
    };
    if (or && or.length) {
      searchQuery.where = {or: or};
    }
    app.winston.info(`SearchQuery: ${JSON.stringify(searchQuery)}`);
    ExpSet.extract.buildExpWorkflowPaginationData(data, search)
      .then((data) => {
        return app.models.ExpScreenUploadWorkflow
          .find(searchQuery);
      })
      .then((expWorkflows: ExpScreenUploadWorkflowResultSet[]) => {
        //@ts-ignore
        data.expWorkflows = expWorkflows;
        if (!data.expWorkflows || !data.expWorkflows.length) {
          resolve();
        } else {
          //@ts-ignore
          data.expWorkflows = compact(expWorkflows);
          return ExpSet.extract.fetchFromCache(data, search, String(data.expWorkflows[0].id));
        }
      })
      .then((data: ExpSetSearchResults) => {
        // Check to see if it was fetched from the cache
        if (!data.fetchedFromCache) {
          return ExpSet.extract.getExpDataByExpWorkflowId(data, search, String(data.expWorkflows[0].id));
        } else {
          return data;
        }
      })
      .then((data: ExpSetSearchResults) => {
        return ExpSet.extract.getExpManualScoresByExpWorkflowId(data, search);
      })
      .then((data: ExpSetSearchResults) => {
        if (!isEqual(data.modelPredictedCounts.length, data.expAssays.length)) {
          return ExpSet.extract.getModelPredictedCountsByExpWorkflowId(data, search);
        } else {
          return data;
        }
      })
      .then((data: ExpSetSearchResults) => {
        data = ExpSet.extract.insertCountsDataImageMeta(data);
        data = ExpSet.extract.insertExpManualScoresImageMeta(data);
        data = ExpSet.extract.cleanUp(data, search);
        resolve(data);
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
};


ExpSet.extract.buildQueryExpWorkflow = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  let expOr = ['screen', 'expWorkflow'].map((searchType) => {
    if (!isEmpty(search[`${searchType}Search`])) {
      let searchObject = {};
      if (searchType.match('expWorkflow')) {
        searchObject[`id`] = {inq: search[`${searchType}Search`]};
      } else {
        searchObject[`${searchType}Id`] = {inq: search[`${searchType}Search`]};
      }
      return searchObject;
    }
  }).filter((or) => {
    return or;
  });
  return expOr;
};

/**
 * TODO Move all this to the frontend
 * This builds pagination for the amount of expWorkflows
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.buildExpWorkflowPaginationData = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    let or = app.models.ExpSet.extract.buildQueryExpWorkflow(data, search);
    let searchObj: any = {};
    if (or && or.lenth) {
      searchObj.or = or;
    }
    // data.pageSize = 1;
    // let expScreen :ExpScreenUploadWorkflowResultSet;
    app.paginateModel('ExpScreenUploadWorkflow', searchObj, 1)
      .then((pagination) => {
        data.currentPage = search.currentPage;
        data.skip = search.skip;
        data.pageSize = search.pageSize;
        // data.totalPages = pagination.totalPages;
        data.totalPages = 1;
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};

ExpSet.extract.getModelPredictedCountsByExpWorkflowId = function (data: ExpSetSearchResults, search) {
  return new Promise((resolve, reject) => {
    app.models.ModelPredictedCounts
      .find({
        where: {
          expWorkflowId: data.expWorkflows[0].id,
        }
      })
      .then((modelPredictedCounts: ModelPredictedCountsResultSet[]) => {
        data.modelPredictedCounts = modelPredictedCounts;
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      })
  });
};

ExpSet.extract.getExpManualScoresByExpWorkflowId = function (data: ExpSetSearchResults, search) {
  return new Promise((resolve, reject) => {
    app.models.ExpManualScores
      .find({
        where: {
          expWorkflowId: data.expWorkflows[0].id,
        }
      })
      .then((expManualScores: ExpManualScoresResultSet[]) => {
        data.expManualScores = expManualScores;
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      })
  });
};

ExpSet.extract.getExpAssay2reagentsByExpWorkflowId = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    if (!data.expAssay2reagents || !data.expAssay2reagents.length) {
      resolve(data);
    } else {
      app.models.ExpAssay2reagent
        .find({
          where: {
            and: [{expWorkflowId: data.expAssay2reagents[0].expWorkflowId},
              {reagentId: {neq: null}},
            ]
          },
          fields: {
            treatmentGroupId: true,
            assay2reagentId: true,
            expGroupId: true,
            assayId: true,
            reagentId: true,
            libraryId: true,
            reagentType: true,
            reagentTable: true,
          },
        })
        .then((expAssay2reagents: ExpAssay2reagentResultSet[]) => {
          let groups = groupBy(expAssay2reagents, 'reagent_type');
          //TODO Add preferentially get ctrls from the same plate
          ['ctrl_null', 'ctrl_strain'].map((expGroupType: string) => {
            groups[expGroupType] = shuffle(groups[expGroupType]);
            groups[expGroupType] = groups[expGroupType].slice(0, search.ctrlLimit);
          });

          Object.keys(groups).map((expGroupType) => {
            groups[expGroupType].map((expAssay2reagent: ExpAssay2reagentResultSet) => {
              data.expAssay2reagents.push(expAssay2reagent);
            });
          });

          return data;
        })
        .catch((error) => {
          app.winston.error(error);
          reject(new Error(error));
        });
    }
  });
};

/**
 * This is the main workflow to get the Data
 * It includes ExpPlates, ExpScreens, ExpScreenWorkflows
 * Counts and Scores are separate
 * @param data
 * @param search
 * @param expWorkflowId
 */
ExpSet.extract.getExpDataByExpWorkflowId = function (data: ExpSetSearchResults, search: ExpSetSearch, expWorkflowId: string) {
  return new Promise((resolve, reject) => {
    app.models.ExpAssay2reagent
      .find({
        where: {
          and: [
            {expWorkflowId: expWorkflowId},
            {expGroupId: {neq: null}},
          ]
        },
        //This is the main exp table, so we include everything here
        fields: {
          treatmentGroupId: true,
          assay2reagentId: true,
          expGroupId: true,
          plateId: true,
          assayId: true,
          reagentId: true,
          libraryId: true,
          reagentType: true,
          screenId: true,
          reagentTable: true,
          expWorkflowId: true,
        },
      })
      .then((expAssay2reagents: ExpAssay2reagentResultSet[]) => {
        data.expAssay2reagents = expAssay2reagents;
        return data;
      })
      .then((data: ExpSetSearchResults) => {
        return app.models.ExpAssay
          .find({
            where: {
              and: [
                {expWorkflowId: expWorkflowId},
                {expGroupId: {neq: null}},
              ]
            },
            fields: {
              assayWell: true,
              assayId: true,
              assayImagePath: true,
              expGroupId: true,
              plateId: true,
              screenId: true,
              expWorkflowId: true,
            },
          })
      })
      .then((expAssays: ExpAssayResultSet[]) => {
        data.expAssays = expAssays;
        return data;
      })
      .then((data: ExpSetSearchResults) => {
        return app.models.ExpPlate
          .find({
            where: {
              expWorkflowId: expWorkflowId,
            }
          })
      })
      .then((expPlates: ExpPlateResultSet[]) => {
        data.expPlates = expPlates;
        return data;
      })
      .then((data: ExpSetSearchResults) => {
        return app.models.ModelPredictedCounts
          .find({
            where: {
              expWorkflowId: expWorkflowId
            }
          })
      })
      .then((modelPredictedCounts: ModelPredictedCountsResultSet[]) => {
        data.modelPredictedCounts = modelPredictedCounts;
        return data;
      })
      .then((data: ExpSetSearchResults) => {
        if (data.expAssay2reagents && isArray(data.expAssay2reagents) && data.expAssay2reagents.length) {
          return app.models.ExpScreen
            .findOne({
              where: {screenId: data.expAssay2reagents[0].screenId},
              fields: {
                screenId: true,
                screenName: true,
                screenType: true,
                screenStage: true,
              }
            })
        } else {
          return {};
        }
      })
      .then((expScreens: ExpScreenResultSet) => {
        data.expScreens = [expScreens];
        return data;
      })
      .then((data: ExpSetSearchResults) => {
        return app.models.ExpScreenUploadWorkflow
          .findOne({
            where: {id: expWorkflowId},
            fields: {
              id: true,
              name: true,
              screenId: true,
              biosamples: true,
              assayDates: true,
              temperature: true,
              screenType: true,
              screenStage: true
            }
          })
      })
      .then((expScreenWorkflow: ExpScreenUploadWorkflowResultSet) => {
        //@ts-ignore
        data.expWorkflows = [expScreenWorkflow];
        return ExpSet.extract.getExpDesignsByExpWorkflowId(data, search);
      })
      .then((data: ExpSetSearchResults) => {
        try {
          return ExpSet.extract.genExpSetAlbums(data, search);
        } catch (error) {
          app.winston.error(`Error genExpSetAlbums`);
          app.winston.error(error);
          return data;
        }
      })
      .then((data: ExpSetSearchResults) => {
        return ExpSet.extract.workflows.getReagentData(data, search);
      })
      .then((data: ExpSetSearchResults) => {
        data = ExpSet.extract.genExpGroupTypeAlbums(data, search);
        return ExpSet.extract.saveToCache(data, search);
      })
      .then((data: ExpSetSearchResults) => {
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(`Error in getExpDataByWorkflowId`);
        app.winston.error(error);
        resolve(new ExpSetSearchResults({}));
        // reject(new Error(error));
      });
  });
};

ExpSet.extract.fetchFromCache = function (data: ExpSetSearchResults, search: ExpSetSearch, expWorkflowId: string) {
  return new Promise((resolve, reject) => {
    //TODO Should just pass ine ither the key or the expWorkflowId
    let key = `expSets-expWorkflowId-${expWorkflowId}`;

    redisClient.getAsync(key)
      .then((obj) => {
        if (obj) {
          // data = JSON.parse(obj);
          // data.fetchedFromCache = true;
          data.fetchedFromCache = false;
          resolve(data);
        } else {
          data.fetchedFromCache = false;
          resolve(data);
        }
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};

ExpSet.extract.saveToCache = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    let key = `expSets-expWorkflowId-${data.expWorkflows[0].id}`;
    redisClient.set(key, JSON.stringify(data), 'EX', 60 * 60 * 24, function (err, reply) {
      resolve(data);
    });
  });
};

ExpSet.extract.getExpDesignsByExpWorkflowId = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    if (get(data, ['expPlates', 0, 'expWorkflowId'])) {
      app.winston.info('Getting ExpPlates');
      app.models.ExpDesign
        .find({where: {expWorkflowId: data.expPlates[0].expWorkflowId}})
        .then((expDesigns: ExpDesignResultSet[]) => {
          let groups = groupBy(expDesigns, 'treatmentGroupId');
          data.expSets = Object.keys(groups).map((treatmentGroupId) => {
            return groups[treatmentGroupId];
          });
          resolve(data);
        })
        .catch((error) => {
          reject(new Error(error));
        });
    } else {
      resolve(data);
    }
  });
};


