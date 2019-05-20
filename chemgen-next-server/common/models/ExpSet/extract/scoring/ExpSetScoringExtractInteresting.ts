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


const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 * Get expSets that have a FIRST_PASS=1 and no HAS_MANUAL_SCORE
 * @param search
 */
ExpSet.extract.workflows.getInterestingExpSets = function (search: ExpSetSearch) {
  app.winston.info('Should be getting interesting expsets');
  return new Promise((resolve, reject) => {
    search = new ExpSetSearch(search);
    let data = new ExpSetSearchResults({});
    let sqlQuery = ExpSet.extract.buildNativeQueryGetInteresting(data, search, search.scoresExist);

    sqlQuery
      .then((rows) => {
        let count = rows.length;
        let totalPages = Math.round(divide(Number(count), Number(search.pageSize)));
        data.currentPage = search.currentPage;
        data.pageSize = search.pageSize;
        data.skip = search.skip;
        data.totalPages = totalPages;
        let treatmentGroupIds = rows.map((expAssay2reagent: ExpAssay2reagentResultSet) => {
          return expAssay2reagent['treatment_group_id'];
        });
        search.expGroupSearch = treatmentGroupIds;
        return app.models.ExpAssay2reagent
          .find({
            where: {
              treatmentGroupId: {
                inq: treatmentGroupIds,
              }
            }
          });
      })
      .then((expAssay2reagents: ExpAssay2reagentResultSet[]) => {
        // data.expAssay2reagents = shuffle(rowData).slice(0, data.pageSize + 1);
        data.expAssay2reagents = expAssay2reagents;
        return data;
      })
      .then((data: ExpSetSearchResults) => {
        app.winston.info('building expSets');
        return app.models.ExpSet.extract.buildExpSets(data, search);
      })
      .then((data) => {
        app.winston.info('resolving data');
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(`Error getting interesting expsets: ${error}`);
        let totalPages = 0;
        data.totalPages = totalPages;
        resolve(data);
      });
  });
};

/**
 * The expPlates will have much fewer contactSheetResults, and so it will be faster to manualScoresAdvancedQuery,
 * and more possible to pull a random plate for scoring
 * @param data
 * @param search
 * @param hasManualScores
 */
ExpSet.extract.buildNativeQueryGetInteresting = function (data: ExpSetSearchResults, search: ExpSetSearch, hasManualScores: Boolean) {

  let query = knex('exp_assay2reagent');
  query = query
    .distinct('treatment_group_id')
    .where('reagent_type', 'LIKE', 'treat%')
    .whereNot({reagent_id: null});

  //Add Base experiment lookup
  ['screen', 'expWorkflow', 'plate', 'treatmentGroup', 'expGroup', 'assay'].map((searchType) => {
    if (!isEmpty(search[`${searchType}Search`])) {
      let sql_col = decamelize(`${searchType}Id`);
      let sql_values = search[`${searchType}Search`];
      query = query.whereIn(sql_col, sql_values);
    }
  });

  /**
   * Filter By FIRST_PASS
   */
  query = query
    .whereExists(function () {
      this.select(1)
        .from('exp_manual_scores')
        .whereRaw('(exp_assay2reagent.assay_id = exp_manual_scores.assay_id ) AND (exp_manual_scores.manualscore_group = \'FIRST_PASS\') AND (exp_manual_scores.manualscore_value = 1)');
    });


  return query;
};
