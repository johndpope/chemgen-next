import app = require('../../../../../server/server.js');
import {WorkflowModel} from "../../../index";
import Promise = require('bluebird');
import {
  isEqual,
  groupBy,
  isEmpty,
} from 'lodash';
import config = require('config');
import decamelize = require('decamelize');
import {ExpSetSearch, ExpSetSearchResults} from "../../../../types/custom/ExpSetTypes";
import {ExpAssay2reagentResultSet} from "../../../../types/sdk/models";

const knex = config.get('knex');

const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 * This uses the knex query to get different phenotypes, min, max, avg, order by, and multiple orderbys
 * @param search
 */
ExpSet.extract.workflows.orderByExpManualScores = function (search) {
  search = new ExpSetSearch(search);
  let data = new ExpSetSearchResults({});
  return new Promise((resolve, reject) => {
    ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
      .whereNot('manualscore_group', 'FIRST_PASS')
      .whereNot('manualscore_group', 'HAS_MANUAL_SCORE')
      .groupBy('treatment_group_id')
      .groupBy('manualscore_group')
      .groupBy('manualscore_code')
      .groupBy('timestamp')
      .orderBy('max_manualscore_value', 'desc')
      .then((results) => {
        return ExpSet.extract.getExpAssay2reagentsByTreatmentGroupId(data, search, results);
      })
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
};

ExpSet.extract.workflows.orderByExpManualScoresPrimaryPhenotypes = function (search) {
  search = new ExpSetSearch(search);
  let data = new ExpSetSearchResults({});
  return new Promise((resolve, reject) => {
    ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
      .where('manualscore_group', 'M_EMB_LETH')
      .orWhere('manualscore_group', 'WT_EMB_LETH')
      .orWhere('manualscore_group', 'M_ENH_STE')
      .orWhere('manualscore_group', 'WT_ENH_STE')
      .groupBy('treatment_group_id')
      .groupBy('manualscore_code')
      .groupBy('manualscore_group')
      .groupBy('timestamp')
      .orderBy('max_manualscore_value', 'desc')
      .then((results) => {
        return ExpSet.extract.getExpAssay2reagentsByTreatmentGroupId(data, search, results);
      })
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
};

ExpSet.extract.workflows.orderByExpManualScoresEmbLeth = function (search) {
  search = new ExpSetSearch(search);
  let data = new ExpSetSearchResults({});
  return new Promise((resolve, reject) => {
    ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
      .where('manualscore_group', 'M_EMB_LETH')
      .orWhere('manualscore_group', 'WT_EMB_LETH')
      .groupBy('treatment_group_id')
      .groupBy('manualscore_group')
      .groupBy('manualscore_code')
      .groupBy('timestamp')
      .orderBy('max_manualscore_value', 'desc')
      .then((results) => {
        return ExpSet.extract.getExpAssay2reagentsByTreatmentGroupId(data, search, results);
      })
      .then((results) =>{
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
};

ExpSet.extract.getExpAssay2reagentsByTreatmentGroupId = function(data: ExpSetSearchResults, search: ExpSetSearch, results: any){
  return new Promise((resolve, reject) =>{
    let treatmentGroupIds = results.map((row) =>{
      return row.treatment_group_id;
    });
    app.models.ExpAssay2reagent
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
      .then((data: ExpSetSearchResults) =>{
        results = groupBy(results, 'treatment_group_id');
        resolve( {tableData: results, expSetSearchResults: data});
      })
      .catch((error) => {
        reject(new Error(error));
      });

  });
};

ExpSet.extract.workflows.orderByExpManualScoresEnhSte = function (search) {
  search = new ExpSetSearch(search);
  let data = new ExpSetSearchResults({});
  return new Promise((resolve, reject) => {
    ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
      .where('manualscore_group', 'M_ENH_STE')
      .orWhere('manualscore_group', 'WT_ENH_STE')
      .groupBy('treatment_group_id')
      .groupBy('manualscore_group')
      .groupBy('manualscore_code')
      .groupBy('timestamp')
      .orderBy('max_manualscore_value', 'desc')
      .then((results) => {
        return ExpSet.extract.getExpAssay2reagentsByTreatmentGroupId(data, search, results);
      })
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
};

ExpSet.extract.workflows.orderByExpManualScoresBaseQuery = function (search) {
  search = new ExpSetSearch(search);
  let query = knex('exp_manual_scores');
  ['screen', 'expWorkflow', 'treatmentGroup', 'assay'].map((searchType) => {
    if (!isEmpty(search[`${searchType}Search`])) {
      let sql_col = decamelize(`${searchType}Id`);
      let sql_values = search[`${searchType}Search`];
      query = query.whereIn(sql_col, sql_values);
    }
  });
    return knex('exp_manual_scores')
      .select('treatment_group_id')
      .select('manualscore_group')
      .select('manualscore_code')
      .select('timestamp')
      .max('manualscore_value as max_manualscore_value')
      .min('manualscore_value as min_manualscore_value')
      .avg('manualscore_value as avg_manualscore_value');
};
