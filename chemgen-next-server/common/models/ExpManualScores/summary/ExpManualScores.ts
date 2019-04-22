import app = require('../../../../server/server.js');
import Promise = require('bluebird');

import {isArray, isEmpty, orderBy, isObject, get} from 'lodash';
import {WorkflowModel} from "../../index";
import {ExpManualScoresResultSet, ExpScreenResultSet} from "../../../types/sdk/models";
import {ExpSetSearch} from "../../../types/custom/ExpSetTypes";
import {ExpScreenUploadWorkflowResultSet} from "../../../types/sdk/models";

const config = require('config');
const knex = config.get('knex');

const ExpManualScores = app.models.ExpManualScores as (typeof WorkflowModel);

/**
 * This gets the stats per screen and per workflow
 * Count All Exp Sets
 * Count Exp Sets that have gone through First Pass
 * Count Exp Sets that have gone through First Pass and are marked for further scoring
 * Count Exp Sets that have gone through detailed scoring
 * Returns an array of results
 * @param search
 */
ExpManualScores.extract.workflows.getScoresStatsPerScreen = function (search: ExpSetSearch): Promise<any> {
  return new Promise((resolve, reject) => {
    search = new ExpSetSearch(search);
    let data: any = {};
    let expWorkflowWhere: any = {
      fields: {
        id: true,
        name: true,
        screenName: true,
        screenId: true,
        screenType: true,
        screenStage: true
      }, where: {}
    };
    if (!isEmpty(search.screenSearch)) {
      expWorkflowWhere.where.screenId = {
        inq: search.screenSearch,
      };
    }
    if (!isEmpty(search.expWorkflowSearch)) {
      expWorkflowWhere.where.id = {
        inq: search.expWorkflowSearch,
      };
    }
    app.models.ExpScreenUploadWorkflow
      .find(expWorkflowWhere)
      .then((expWorkflowResults) => {
        data.expWorkflows = expWorkflowResults;
        return ExpManualScores.extract.getScoreStatsPerExpWorkflow(data);
      })
      .then((results: any) => {
        // results = orderBy(results, ['screenId', 'expWorkflowName']);
        results = results.filter((res) => {
          return res.screenName;
        });
        results = orderBy(results, 'screenId');
        resolve(results);
      })
      .catch((error) => {
        return new Error(error);
      })
  });
};

ExpManualScores.extract.getScoreStatsPerExpWorkflow = function (data) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    Promise.map(data.expWorkflows, (expWorkflow: ExpScreenUploadWorkflowResultSet) => {
      let queries: any = {
        allExpSets: ExpManualScores.extract.buildNativeQueryDistinctTreatmentIds(expWorkflow),
        allFirstPassExpSets: ExpManualScores.extract.buildNativeQueryWithFirstPassAll(expWorkflow),
        interestingFirstPassExpSets: ExpManualScores.extract.buildNativeQueryWithFirstPassTrue(expWorkflow),
        detailScoresExpSets: ExpManualScores.extract.buildNativeQueryWithDetailedScores(expWorkflow),
      };
      let results: any = {
        screenId: expWorkflow.screenId,
        expWorkflowId: String(expWorkflow.id),
        expWorkflowName: expWorkflow.name,
        screenName: expWorkflow.screenName,
      };
      //@ts-ignore
      return Promise.map(Object.keys(queries), (queryKey: string) => {
        return queries[queryKey]
          .then((countResults: any) => {
            results[queryKey] = countResults[0]['count_treatment_group_id'];
            return;
          })
          .catch((error) => {
            app.winston.error(error);
            return new Error(error);
          })
      })
        .then(() => {
          return results;
        })
        .catch((error) => {
          app.winston.error(error);
          return new Error(error);
        });
    })
      .then((results: Array<any>) => {
        resolve(results);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};

/**
 * This returns the total number of expSets for a given workflow
 * @param expWorkflow
 */
ExpManualScores.extract.buildNativeQueryDistinctTreatmentIds = function (expWorkflow: ExpScreenUploadWorkflowResultSet) {
  let query = knex('exp_assay2reagent')
    .countDistinct('treatment_group_id as count_treatment_group_id')
    .where('reagent_type', 'LIKE', 'treat%')
    .where('exp_workflow_id', String(expWorkflow.id));
  return query;
};

/**
 * This returns the total number of expSets for a given workflow
 * @param expWorkflow
 */
ExpManualScores.extract.buildNativeQueryDistinctTreatmentIdsGroupBy = function () {
  let query = knex('exp_assay2reagent')
    .select('exp_workflow_id')
    .countDistinct('treatment_group_id as count_treatment_group_id')
    .groupBy('exp_workflow_id')
    .where('reagent_type', 'LIKE', 'treat%');
  return query;
};

/**
 * Get all expSets count that have gone through the first pass
 * @param expWorkflow
 */
ExpManualScores.extract.buildNativeQueryWithFirstPassAll = function (expWorkflow: ExpScreenUploadWorkflowResultSet) {
  let query = knex('exp_manual_scores')
    .countDistinct('treatment_group_id as count_treatment_group_id')
    .where('exp_workflow_id', String(expWorkflow.id))
    .where('manualscore_group', 'FIRST_PASS');
  return query;
};

/**
 * Get all expSets count that have gone through the first pass and been marked as interesting
 * @param expWorkflow
 */
ExpManualScores.extract.buildNativeQueryWithFirstPassTrue = function (expWorkflow: ExpScreenUploadWorkflowResultSet) {
  let query = ExpManualScores.extract.buildNativeQueryWithFirstPassAll(expWorkflow);
  query = query
    .where('manualscore_value', 1);
  return query;
};


/**
 * Get all expSets counts that have a detailed score
 * @param expWorkflow
 */
ExpManualScores.extract.buildNativeQueryWithDetailedScores = function (expWorkflow: ExpScreenUploadWorkflowResultSet) {
  let query = knex('exp_manual_scores')
    .countDistinct('treatment_group_id as count_treatment_group_id')
    .where('exp_workflow_id', String(expWorkflow.id))
    .where('manualscore_group', 'HAS_MANUAL_SCORE');
  return query;
};

export interface ExpManualScoresSummaryInterface {
  screens: ExpScreenResultSet[];
  expWorkflows: ExpScreenUploadWorkflowResultSet;
}
