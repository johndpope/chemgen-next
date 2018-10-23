import app = require('../../../../../server/server.js');
import {WorkflowModel} from "../../../index";
import Promise = require('bluebird');
import {
  isEqual,
  groupBy,
} from 'lodash';
import config = require('config');

const knex = config.get('knex');

const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 * This uses the knex query to get different phenotypes, min, max, avg, order by, and multiple orderbys
 * @param search
 */
ExpSet.extract.workflows.orderByExpManualScores = function (search) {
  return new Promise((resolve, reject) => {
    ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
      .whereNot('manualscore_group', 'FIRST_PASS')
      .whereNot('manualscore_group', 'HAS_MANUAL_SCORE')
      .groupBy('treatment_group_id')
      .groupBy('manualscore_group')
      .groupBy('manualscore_code')
      .orderBy('max_manualscore_value', 'desc')
      .limit(1000)
      .then((results) => {

        resolve(results);
      })
      .catch((error) =>{
        reject(new Error(error));
      })
  });
};

ExpSet.extract.workflows.orderByExpManualScoresPrimaryPhenotypes = function (search) {
  return new Promise((resolve, reject) => {
    ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
      .where('manualscore_group', 'M_EMB_LETH')
      .orWhere('manualscore_group', 'WT_EMB_LETH')
      .orWhere('manualscore_group', 'M_ENH_STE')
      .orWhere('manualscore_group', 'WT_ENH_STE')
      .groupBy('treatment_group_id')
      .groupBy('manualscore_code')
      .groupBy('manualscore_group')
      .orderBy('max_manualscore_value', 'desc')
      .limit(100000)
      .then((results) => {
        results = groupBy(results, 'treatment_group_id');
        resolve(results);
      })
      .catch((error) =>{
        reject(new Error(error));
      })
  });
};

ExpSet.extract.workflows.orderByExpManualScoresEmbLeth = function (search) {
  return new Promise((resolve, reject) => {
    ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
      .where('manualscore_group', 'M_EMB_LETH')
      .orWhere('manualscore_group', 'WT_EMB_LETH')
      .groupBy('treatment_group_id')
      .groupBy('manualscore_group')
      .groupBy('manualscore_code')
      .orderBy('max_manualscore_value', 'desc')
      .limit(1000)
      .then((results) => {
        resolve(results);
      })
      .catch((error) =>{
        reject(new Error(error));
      })
  });
};

ExpSet.extract.workflows.orderByExpManualScoresEnhSte = function (search) {
  return new Promise((resolve, reject) => {
    ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
      .where('manualscore_group', 'M_ENH_STE')
      .orWhere('manualscore_group', 'WT_ENH_STE')
      .groupBy('treatment_group_id')
      .groupBy('manualscore_group')
      .groupBy('manualscore_code')
      .orderBy('max_manualscore_value', 'desc')
      .limit(1000)
      .then((results) => {
        resolve(results);
      })
      .catch((error) =>{
        reject(new Error(error));
      })
  });
};

ExpSet.extract.workflows.orderByExpManualScoresBaseQuery = function (search) {
    return knex('exp_manual_scores')
      .select('treatment_group_id')
      .select('manualscore_group')
      .select('manualscore_code')
      .max('manualscore_value as max_manualscore_value')
      .min('manualscore_value as min_manualscore_value')
      .avg('manualscore_value as avg_manualscore_value');
};
