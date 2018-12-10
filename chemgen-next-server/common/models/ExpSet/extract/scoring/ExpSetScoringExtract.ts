import app = require('../../../../../server/server.js');
import {WorkflowModel} from "../../../index";
import Promise = require('bluebird');
import {
  filter,
  uniq,
  reduce,
  flattenDeep,
  divide,
  intersectionBy,
  shuffle,
  isArray,
  isNull,
  isUndefined,
  get,
  isEmpty,
  camelCase,
  isEqual
} from 'lodash';
import {ExpSetSearch, ExpSetSearchResults} from "../../../../types/custom/ExpSetTypes";
import {
  ChemicalLibraryResultSet,
  ExpAssay2reagentResultSet,
  ExpManualScoresResultSet,
  RnaiLibraryResultSet
} from "../../../../types/sdk/models";
import decamelize = require('decamelize');

import * as client from "knex";

import config = require('config');

const knex = config.get('knex');

/**
 * ExpSetExtractScoring* are a list of apis to get ExpSets for scoring
 */

/**
 * There are a few main workflows at play here:
 * 1. FIRST_PASS Scoring: On the front end, this gives users a contact sheet, either by plate or by expSet.
 * They quickly (hopefully) scroll through and preselect interesting wells for more detailed scoring.
 * This corresponds to the ExpManualScores Table. The manualscoreGroup == 'FIRST_PASS' with the manualscoreValue being 0/1.
 * ExpSets or Assays with a manualscoreGroup=FIRST_PASS and manualscoreValue=1 are queued up for more detailed scoring
 * 2. MANUAL_SCORE: Normally, these come from the FIRST_PASS queue, but occasionally a user will want to score a gene of interest
 * immediately without going through the FIRST_PASS. For details on the kinds of scores see the codes in the ExpManualScoreCodes table
 * 3. BATCH_QC: This is an optional stage where the users can take a look at a batch of plates
 * (RNAiIII.1A_M_1, RNAiIII.1A_M_2, RNAiIII.1A_N2_1, RNAiIII.1A_N2_2, L4440_1, L4440_2 in either suppressor or enhancer).
 * They can choose to junk a plate, or to junk individual wells.
 */

/**
 * The ExpSetExtractScoring* libraries require more complex sql functionality than given by loopback alone
 * (loopback does not support exists, min, max, nested sql, etc)
 * For this reason we use knex, to generate some of the sql, and then execute it with the loopback native sql executor
 */

const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

ExpSet.extract.workflows.filterByScores = function (search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    search = new ExpSetSearch(search);
    let data = new ExpSetSearchResults({});
    // if (isEmpty(search.rnaiSearch)) {
    //   //Search the RnaiLibrary Api
    //   resolve(app.models.RnaiExpSet.extract.workflows.getExpSetsByGeneList(search));
    // }
    if (!search.scoresQuery) {
      resolve(data);
    } else {
      //TODO Add Pagination
      //TODO Check for genes/chemicals list
      resolve(ExpSet.extract.getScoresByFilter(data, search));
    }
  });
};

ExpSet.extract.getScoresByFilter = function (data: ExpSetSearchResults, search: ExpSetSearch, treatmentGroupIds?: Array<number>) {
  return new Promise((resolve, reject) => {
    let query = ExpSet.extract.buildFilterByScoresQuery(data, search, treatmentGroupIds);
    data.pageSize = 50;
    if (get(search.scoresQuery, 'and') && isArray(search.scoresQuery.and)) {
      resolve(ExpSet.extract.getScoresByFilterAdvanced(data, search, treatmentGroupIds));
    } else {
      //TODO REAL Pagination DUMMY
      ExpSet.extract.buildExpManualScorePaginationData(data, search, treatmentGroupIds)
        .then((data: ExpSetSearchResults) => {
          return app.models.ExpManualScores
            .find({fields: {treatmentGroupId: true}, where: query, limit: 10000})
        })
        .then((expManualScores: ExpManualScoresResultSet[]) => {
          let treatmentGroupIds = uniq(expManualScores.map((expManualScore) => {
            return expManualScore.treatmentGroupId;
          }));
          data.totalPages = treatmentGroupIds.length / data.pageSize;
          treatmentGroupIds = treatmentGroupIds.slice(data.skip, data.pageSize);

          if (expManualScores.length) {
            return app.models.ExpAssay2reagent
              .find({
                where: {
                  treatmentGroupId: {
                    inq: treatmentGroupIds,
                  }
                }
              })
              .then((expAssay2reagents: ExpAssay2reagentResultSet[]) => {
                data.expAssay2reagents = expAssay2reagents;
                return ExpSet.extract.buildExpSets(data, search);
              })
              .catch((error) => {
                return new Error(error);
              });
          } else {
            return data;
          }
        })
        .then((data: ExpSetSearchResults) => {
          resolve(data);
        })
        .catch((error) => {
          reject(new Error(error));
        });
    }

  });
};

/**
 * WIP - This seems really buggy
 * This builds pagination for the amount of expWorkflows
 * @param {ExpSetSearchResults} data
 * @param {treatmentGroupIds} Optional array of treatmentGroupIds
 */
ExpSet.extract.buildExpManualScorePaginationData = function (data: ExpSetSearchResults, search: ExpSetSearch, treatmentGroupIds?: Array<number>) {
  return new Promise((resolve, reject) => {
    let or = ExpSet.extract.buildFilterByScoresQuery(data, search, treatmentGroupIds);
    let searchObj: any = {};
    if (or && or.lenth) {
      searchObj.or = or;
    }
    app.paginateModel('ExpManualScores', searchObj, 1)
      .then((pagination) => {
        data.currentPage = search.currentPage;
        data.skip = search.skip;
        data.pageSize = search.pageSize;
        data.totalPages = pagination.totalPages;
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};

/**
 * Filter Detailed Scores by Query
 */

/**
 * WIP - This does not work entirely correctly as written. Need to pull in all the scores, and then do additional rule based filtering in memory
 * If there's a query with mutliple wheres, we have to run each query individually, and then get the common treatmentGroupIds
 * @param data
 * @param search
 * @param treatmentGroupIds
 */
ExpSet.extract.getScoresByFilterAdvanced = function (data: ExpSetSearchResults, search: ExpSetSearch, treatmentGroupIds?: Array<number>) {
  return new Promise((resolve, reject) => {
    if (get(search.scoresQuery, 'and') && isArray(search.scoresQuery.and) && search.scoresQuery.and.length) {
      //@ts-ignore
      Promise.map(search.scoresQuery.and, (scoreQuery) => {
        data.pageSize = 50;
        return app.models.ExpManualScores
          .find({fields: {treatmentGroupId: true}, where: scoreQuery});
      })
        .then((results: Array<ExpManualScoresResultSet[]>) => {
          let expManualScores: Array<ExpManualScoresResultSet> = reduce(results, (x: ExpManualScoresResultSet[], y: ExpManualScoresResultSet[]) => {
            return flattenDeep(intersectionBy(x, y, 'treatmentGroupId'));
          });
          if (isArray(expManualScores)) {
            expManualScores = expManualScores.slice(data.skip, data.pageSize);
          } else {
            expManualScores = [];
          }
          if (expManualScores.length) {
            return app.models.ExpAssay2reagent
              .find({
                where: {
                  treatmentGroupId: {
                    inq: expManualScores.map((expManualScore) => {
                      return expManualScore.treatmentGroupId;
                    })
                  }
                }
              })
              .then((expAssay2reagents: ExpAssay2reagentResultSet[]) => {
                data.expAssay2reagents = expAssay2reagents;
                return ExpSet.extract.buildExpSets(data, search);
              })
              .catch((error) => {
                return new Error(error);
              });
          } else {
            return data;
          }
        })
        .then((data: ExpSetSearchResults) => {
          resolve(data);
        })
        .catch((error) => {
          reject(new Error(error));
        });
    } else {
      resolve(ExpSet.extract.getScoresByFilter(data, search, treatmentGroupIds));
    }
  });
};

/**
 * WIP - This is meant to query the scores and return expSets where an expSet is M_EMB_LETH_HIGH and the WT_EMB_LETH_LOW (for example)
 * But it doesn't quite work as written
 * What we need to do is to fulfill one query, then do the others in memory
 * @param data
 * @param search
 * @param treatmentGroupIds
 */
ExpSet.extract.buildFilterByScoresQuery = function (data: ExpSetSearchResults, search: ExpSetSearch, treatmentGroupIds?: Array<number>) {

  let expScreenSearch = ExpSet.extract.buildScreenDataQuery(data, search);
  let query: any = {};
  let treatmentGroupQuery: any = null;
  if (treatmentGroupIds && treatmentGroupIds.length) {
    treatmentGroupQuery = {
      treatmentGroupId: {inq: treatmentGroupIds}
    };
  }
  if (search.scoresQuery || expScreenSearch.length || treatmentGroupQuery) {
    query = {and: []};
  }
  if (search.scoresQuery) {
    query.and.push(search.scoresQuery);
  }
  if (expScreenSearch.length) {
    expScreenSearch.map((expScreen) => {
      query.and.push(expScreen);
    });
  }
  if (treatmentGroupQuery) {
    query.and.push(treatmentGroupQuery);
  }

  return query;
};

/**
 * Get expSets that have a FIRST_PASS=1 and no HAS_MANUAL_SCORE
 * @param search
 */
ExpSet.extract.workflows.getUnscoredExpSetsByFirstPass = function (search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    search = new ExpSetSearch(search);
    let data = new ExpSetSearchResults({});
    if (!search.scoresExist) {
      search.scoresExist = false;
    } else {
      search.scoresExist = true;
    }
    // search.scoresExist = true;
    let sqlQuery = ExpSet.extract.buildNativeQueryByFirstPass(data, search, search.scoresExist);
    // sqlQuery = sqlQuery.count('assay_id');
    ExpSet.extract.workflows.getExpAssay2reagentsByFirstPassScores(data, search, search.scoresExist)
      .then((data: ExpSetSearchResults) => {
        return app.models.ExpSet.extract.buildExpSets(data, search);
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(new Error(error));
      });

  });
};


/**
 * Grab ExpSets that do not have a manual score
 * @param {ExpSetSearch} search
 */
ExpSet.extract.workflows.getUnscoredExpSets = function (search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    search = new ExpSetSearch(search);
    let data = new ExpSetSearchResults({});

    if (!search.scoresExist) {
      search.scoresExist = false;
    }

    let sqlQuery = ExpSet.extract.buildNativeQuery(data, search, search.scoresExist);
    sqlQuery = sqlQuery.count();

    ExpSet.extract.buildUnscoredPaginationData(data, search, sqlQuery.toString())
      .then((data: ExpSetSearchResults) => {
        return ExpSet.extract.workflows.getExpAssay2reagentsByScores(data, search, search.scoresExist);
      })
      .then((data: ExpSetSearchResults) => {
        return app.models.ExpSet.extract.buildExpSets(data, search);
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
};

ExpSet.extract.workflows.getExpAssay2reagentsByFirstPassScores = function (data: ExpSetSearchResults, search: ExpSetSearch, scoresExist: Boolean) {
  return new Promise((resolve, reject) => {
    let sqlQuery = ExpSet.extract.buildNativeQueryByFirstPass(data, search, scoresExist);

    //ORDER BY RAND() takes a huge performance hit
    //Instead get 5000 (which is a basically arbitrary number) results, and randomly select the page size
    sqlQuery = sqlQuery
      .limit(5000)
      .offset(data.skip);

    sqlQuery
      .then((rows) => {
        let count = rows.length;
        let totalPages = Math.round(divide(Number(count), Number(search.pageSize)));
        data.currentPage = search.currentPage;
        data.pageSize = search.pageSize;
        data.skip = search.skip;
        data.totalPages = totalPages;
        const rowData = rows.map(rawRowData => {
          Object.keys(rawRowData).map((rowKey) => {
            rawRowData[camelCase(rowKey)] = rawRowData[rowKey];
            if (!isEqual(camelCase(rowKey), rowKey)) {
              delete rawRowData[rowKey];
            }
          });
          return new app.models.ExpAssay2reagent(JSON.parse(JSON.stringify(rawRowData)));
        });
        data.expAssay2reagents = shuffle(rowData).slice(0, data.pageSize + 1);
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(`buildUnscoredPaginationData: ${error}`);
        let totalPages = 0;
        data.currentPage = search.currentPage;
        data.pageSize = search.pageSize;
        data.skip = search.skip;
        data.totalPages = totalPages;
        resolve(data);
      });
  });
};

ExpSet.extract.workflows.getExpAssay2reagentsByScores = function (data: ExpSetSearchResults, search: ExpSetSearch, scoresExist: Boolean) {
  return new Promise((resolve, reject) => {
    let sqlQuery = ExpSet.extract.buildNativeQuery(data, search, scoresExist);

    //Add Pagination
    //TODO Orderby RAND() May be making a big performance hit
    //A much faster way to do this would be to get all the expWorkflowIds that match the manualScoresAdvancedQuery
    //Then get the ones that haven't been scored
    sqlQuery = sqlQuery
      .limit(data.pageSize)
      .offset(data.skip);

    let ds = app.datasources.chemgenDS;
    app.winston.info(JSON.stringify(sqlQuery.toString()));
    ds.connector.execute(sqlQuery.toString(), [], function (error, rows) {
      if (error) {
        app.winston.error(error);
        return reject(new Error(error));
      } else {
        const rowData = rows.map(rawRowData => {
          Object.keys(rawRowData).map((rowKey) => {
            rawRowData[camelCase(rowKey)] = rawRowData[rowKey];
            delete rawRowData[rowKey];
          });
          return new app.models.ExpAssay2reagent(JSON.parse(JSON.stringify(rawRowData)));
        });
        data.skip = data.skip + data.pageSize;
        data.expAssay2reagents = rowData;
        return resolve(data);
      }
    });

  });
};

ExpSet.extract.buildUnscoredPaginationData = function (data: ExpSetSearchResults, search: ExpSetSearch, sqlQuery: string) {
  // let sqlQueryString = sqlQuery.toString();
  let sqlKnexQuery = ExpSet.extract.buildNativeQueryExpWorkflowId(data, search, false);
  sqlKnexQuery = sqlKnexQuery.count();

  // The loopback sql manualScoresAdvancedQuery throws an error I can't catch on an empty result set
  // Knex returns an error, but I can catch it
  return new Promise((resolve, reject) => {
    let ds = app.datasources.chemgenDS;
    sqlKnexQuery
      .then((rows) => {
        // app.winston.info(`Rows: ${JSON.stringify(rows, null, 2)}`);
        // let count = rows[0]["count(*)"];
        let count = rows.length;
        let totalPages = Math.round(divide(Number(count), Number(search.pageSize)));
        data.currentPage = search.currentPage;
        data.pageSize = search.pageSize;
        data.skip = search.skip;
        data.totalPages = totalPages;
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(`buildUnscoredPaginationData: ${error}`);
        let totalPages = 0;
        data.currentPage = search.currentPage;
        data.pageSize = search.pageSize;
        data.skip = search.skip;
        data.totalPages = totalPages;
        resolve(data);
      });
  });
};

/**
 * The FIRST_PASS is used in the ExpManualScores Table as a flag to indicate an assay or expSet
 * has passed a first round of 'interesting/not interesting'
 * All FIRST_PASS Scores are then queued up for more detailed scoring
 * Detailed scores have a flag of HAS_MANUAL_SCORE, which acts as a flag that an assay or expset has been through detailed scoring
 * Pull out all expAssay2reagents that have a FIRST_PASS score but not any other
 * scoresExist: True
 * Selects all assay2reagents that have a FIRST_PASS=1 but no HAS_MANUAL_SCORE
 * scoresExist: False
 * Selects all assay2reagents that have no HAS_MANUAL_SCORE
 * @param data
 * @param search
 * @param hasManualScores
 */
ExpSet.extract.buildNativeQueryByFirstPass = function (data: ExpSetSearchResults, search: ExpSetSearch, hasManualScores: Boolean) {
  let query = knex('exp_assay2reagent');
  query = query
    .where('reagent_type', 'LIKE', 'treat%')
    .whereNot({reagent_id: null});

  //Query for base experiment details (screen_id, library_id, etc)
  //Optionally query for reagents
  query = ExpSet.extract.buildNativeQueryExpSearch(query, search, null);
  query = ExpSet.extract.buildNativeQueryReagents(data, query, search);

  //If it has a FIRST_PASS=1 and no HAS_MANUAL_SCORE, grab it
  if (hasManualScores) {
    query = query
      .whereExists(function () {
        this.select(1)
          .from('exp_manual_scores')
          .whereRaw('(exp_assay2reagent.treatment_group_id = exp_manual_scores.treatment_group_id ) AND (exp_manual_scores.manualscore_group = \'FIRST_PASS\' AND exp_manual_scores.manualscore_value = 1)');
      })
      .whereNotExists(function () {
        this.select(1)
          .from('exp_manual_scores')
          .whereRaw('exp_assay2reagent.treatment_group_id = exp_manual_scores.treatment_group_id AND exp_manual_scores.manualscore_group = \'HAS_MANUAL_SCORE\'');
      });
  } else {
    //Otherwise just grab as long as it doesn't have HAS_MANUAL_SCORE
    query = query
      .whereNotExists(function () {
        this.select(1)
          .from('exp_manual_scores')
          .whereRaw('exp_assay2reagent.treatment_group_id = exp_manual_scores.treatment_group_id AND exp_manual_scores.manualscore_group = \'HAS_MANUAL_SCORE\'');
      });
  }

  return query;
};


/**
 * The expPlates will have much fewer contactSheetResults, and so it will be faster to manualScoresAdvancedQuery,
 * and more possible to pull a random plate for scoring
 * @param data
 * @param search
 * @param hasManualScores
 */
ExpSet.extract.buildNativeQueryExpWorkflowId = function (data: ExpSetSearchResults, search: ExpSetSearch, hasManualScores: Boolean) {

  let query = knex('exp_assay2reagent');
  query = query
    .distinct('exp_workflow_id')
    .groupBy('exp_workflow_id')
    .where('reagent_type', 'LIKE', 'treat%')
    .whereNot({reagent_id: null});

  //Add Base experiment lookup
  ['screen', 'library', 'expWorkflow', 'plate', 'expGroup', 'assay'].map((searchType) => {
    if (!isEmpty(search[`${searchType}Search`])) {
      let sql_col = decamelize(`${searchType}Id`);
      let sql_values = search[`${searchType}Search`];
      query = query.whereIn(sql_col, sql_values);
    }
  });

  //Add Rnai reagent Lookup
  if (!isEmpty(data.rnaisList)) {
    query = query
      .where(function () {
        let firstVal: RnaiLibraryResultSet = data.rnaisList.shift();
        let firstWhere = this.orWhere({'reagent_id': firstVal.rnaiId, library_id: firstVal.libraryId});
        data.rnaisList.map((rnai: RnaiLibraryResultSet) => {
          firstWhere = firstWhere.orWhere({reagent_id: rnai.rnaiId, library_id: firstVal.libraryId});
        });
        data.rnaisList.push(firstVal);
      })
  }

  //Add Chemical Lookup
  if (!isEmpty(data.compoundsList)) {
    query = query
      .where(function () {
        let firstVal: ChemicalLibraryResultSet = data.compoundsList.shift();
        let firstWhere = this.orWhere({'reagent_id': firstVal.compoundId, library_id: firstVal.libraryId});
        data.compoundsList.map((compound: ChemicalLibraryResultSet) => {
          firstWhere = firstWhere.orWhere({reagent_id: compound.compoundId, library_id: firstVal.libraryId});
        });
        data.compoundsList.push(firstVal);
      })
  }

  /**
   * Filter By FIRST_PASS
   */

  //Get if value exists in the manual score table
  if (hasManualScores) {
    query = query
      .whereExists(function () {
        this.select(1)
          .from('exp_manual_scores')
          .whereRaw('(exp_assay2reagent.treatment_group_id = exp_manual_scores.treatment_group_id ) AND (exp_manual_scores.manualscore_group = \'FIRST_PASS\')');
      });
  } else {
    query = query
      .whereNotExists(function () {
        this.select(1)
          .from('exp_manual_scores')
          .whereRaw('(exp_assay2reagent.treatment_group_id = exp_manual_scores.treatment_group_id ) AND (exp_manual_scores.manualscore_group = \'FIRST_PASS\')');
      });

  }

  return query;
};

/**
 * This manualScoresAdvancedQuery will find a single assay that hasn't been scored
 * CAUTION - A manualScoresAdvancedQuery will NOT show up here if the entire expSet was toggled instead of the assays individually
 * @param data
 * @param search
 * @param hasManualScores
 */
ExpSet.extract.buildNativeQuery = function (data: ExpSetSearchResults, search: ExpSetSearch, hasManualScores: Boolean) {
  let query = knex('exp_assay2reagent');
  query = query
    .where('reagent_type', 'LIKE', 'treat%')
    .whereNot({reagent_id: null});
  //Add Base experiment lookup
  ['screen', 'library', 'expWorkflow', 'plate', 'expGroup', 'assay'].map((searchType) => {
    if (!isEmpty(search[`${searchType}Search`])) {
      let sql_col = decamelize(`${searchType}Id`);
      let sql_values = search[`${searchType}Search`];
      query = query.whereIn(sql_col, sql_values);
    }
  });

  //Add Rnai reagent Lookup
  if (!isEmpty(data.rnaisList)) {
    query = query
      .where(function () {
        let firstVal: RnaiLibraryResultSet = data.rnaisList.shift();
        let firstWhere = this.orWhere({'reagent_id': firstVal.rnaiId, library_id: firstVal.libraryId});
        data.rnaisList.map((rnai: RnaiLibraryResultSet) => {
          firstWhere = firstWhere.orWhere({reagent_id: rnai.rnaiId, library_id: firstVal.libraryId});
        });
        data.rnaisList.push(firstVal);
      })
  }

  //Add Chemical Lookup
  if (!isEmpty(data.compoundsList)) {
    query = query
      .where(function () {
        let firstVal: ChemicalLibraryResultSet = data.compoundsList.shift();
        let firstWhere = this.orWhere({'reagent_id': firstVal.compoundId, library_id: firstVal.libraryId});
        data.compoundsList.map((compound: ChemicalLibraryResultSet) => {
          firstWhere = firstWhere.orWhere({reagent_id: compound.compoundId, library_id: firstVal.libraryId});
        });
        data.compoundsList.push(firstVal);
      })
  }

  //Get if value exists in the manual score table
  if (hasManualScores) {
    query = query
      .whereExists(function () {
        this.select(1)
          .from('exp_manual_scores')
          .whereRaw('exp_assay2reagent.assay_id = exp_manual_scores.assay_id');
      });
  } else {
    query = query
      .whereNotExists(function () {
        this.select(1)
          .from('exp_manual_scores')
          .whereRaw('exp_assay2reagent.assay_id = exp_manual_scores.assay_id');
      });

  }

  return query;
};
