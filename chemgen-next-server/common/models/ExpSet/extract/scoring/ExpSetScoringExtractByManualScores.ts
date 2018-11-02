import app = require('../../../../../server/server.js');
import {WorkflowModel} from "../../../index";
import Promise = require('bluebird');
import {
  camelCase,
  orderBy,
  find,
  includes,
  isEqual,
  groupBy,
  isEmpty,
} from 'lodash';
import config = require('config');
import decamelize = require('decamelize');
import {
  ExpsetModule,
  ExpSetSearch,
  ExpSetSearchResults,
  PredictPrimaryPhenotypeExpSet, PredictSecondaryPhenotypeExpSet
} from "../../../../types/custom/ExpSetTypes";
import {
  ExpAssay2reagentResultSet,
  ExpAssayResultSet,
  ModelPredictedCountsResultSet
} from "../../../../types/sdk/models";


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
      .groupBy('timestamp')
      .groupBy('manualscore_group')
      .groupBy('screen_id')
      // .groupBy('manualscore_code')
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
    let phenos = ['M_EMB_LETH', 'WT_EMB_LETH', 'M_ENH_STE', 'WT_ENH_STE'];
    ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
      .orWhere('manualscore_group', 'M_EMB_LETH')
      .orWhere('manualscore_group', 'WT_EMB_LETH')
      .orWhere('manualscore_group', 'M_ENH_STE')
      .orWhere('manualscore_group', 'WT_ENH_STE')
      .groupBy('treatment_group_id')
      .groupBy('timestamp')
      // .groupBy('manualscore_code')
      .groupBy('manualscore_group')
      .groupBy('screen_id')
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
      .orWhere('manualscore_group', 'M_EMB_LETH')
      .orWhere('manualscore_group', 'WT_EMB_LETH')
      .groupBy('treatment_group_id')
      .groupBy('timestamp')
      .groupBy('manualscore_group')
      .groupBy('screen_id')
      // .groupBy('manualscore_code')
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

ExpSet.extract.getExpAssay2reagentsByTreatmentGroupId = function (data: ExpSetSearchResults, search: ExpSetSearch, results: any) {
  return new Promise((resolve, reject) => {
    let treatmentGroupIds = results.map((row) => {
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
      .then((data: ExpSetSearchResults) => {
        results = groupBy(results, 'treatment_group_id');
        results = {tableData: results, expSets: data};
        results = ExpSet.extract.workflows.createTrainPhenoExpSetDataFrameFromScores(results);
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

/**
 * Given the score groupings map them back to counts
 * TODO - this is really only necessary for returning a dataframe to train with TF
 * @param results
 */
ExpSet.extract.workflows.createTrainPhenoExpSetDataFrameFromScores = function (results: any) {
  let data: ExpSetSearchResults = results.expSets;
  let tableData: any = results.tableData;
  let expSetModule = new ExpsetModule(data);
  let dataFrame = [];
  Object.keys(tableData).map((key: any) => {
    let album = expSetModule.findAlbums(Number(key));
    tableData[key].map((scoreGroup) => {
      //Its a treatmentGroup
      scoreGroup.treatmentGroupId = scoreGroup.treatment_group_id;
      if (scoreGroup.manualscore_group.match(new RegExp('^M_.*'))) {
        scoreGroup = ExpSet.extract.getExpSetCounts(expSetModule, album, scoreGroup, 'treatmentReagentImages', 'ctrlStrainImages');
        dataFrame.push(scoreGroup);
      }
      else if (scoreGroup.manualscore_group.match(new RegExp('^WT_.*'))) {
        scoreGroup = ExpSet.extract.getExpSetCounts(expSetModule, album, scoreGroup, 'ctrlReagentImages', 'ctrlNullImages');
        dataFrame.push(scoreGroup);
      }
    });
  });
  dataFrame = orderBy(dataFrame, 'max_manualscore_value', 'desc');
  results.dataFrame = dataFrame;
  return results;
};

ExpSet.extract.getExpSetCounts = function (expSetModule: ExpsetModule, album: any, scoreGroup: any, reagentGroup: string, ctrlGroup: string) {
  let expAssay2reagent: ExpAssay2reagentResultSet[] = expSetModule.findExpAssay2reagents(Number(scoreGroup.treatmentGroupId));
  let expScreen = expSetModule.findExpScreen(expAssay2reagent[0].screenId);
  scoreGroup.screenId = expScreen.screenId;
  scoreGroup.screenName = expScreen.screenName;
  scoreGroup.screenStage = expScreen.screenStage;
  scoreGroup.expWorkflowId = expAssay2reagent[0].expWorkflowId;
  let treatReagentAssayIds = album[reagentGroup].map((assay: ExpAssayResultSet) => {
    return assay.assayId;
  });
  let ctrlStrainAssayIds = album[ctrlGroup].map((assay: ExpAssayResultSet) => {
    return assay.assayId;
  });
  let treatReagentCounts = expSetModule.expSets.modelPredictedCounts.filter((modelPredictedCounts: ModelPredictedCountsResultSet) => {
    return includes(treatReagentAssayIds, modelPredictedCounts.assayId);
  });
  let ctrlStrainCounts = expSetModule.expSets.modelPredictedCounts.filter((modelPredictedCounts: ModelPredictedCountsResultSet) => {
    return includes(ctrlStrainAssayIds, modelPredictedCounts.assayId);
  });

  treatReagentCounts.map((counts: ModelPredictedCountsResultSet, index: number) => {
    scoreGroup[`reagentWormCountR${index}`] = counts.wormCount;
    scoreGroup[`reagentLarvaCountR${index}`] = counts.larvaCount;
    scoreGroup[`reagentEggCountR${index}`] = counts.eggCount;
  });
  ctrlStrainCounts.map((counts: ModelPredictedCountsResultSet, index: number) => {
    scoreGroup[`ctrlWormCountR${index}`] = counts.wormCount;
    scoreGroup[`ctrlLarvaCountR${index}`] = counts.larvaCount;
    scoreGroup[`ctrlEggCountR${index}`] = counts.eggCount;
  });
  scoreGroup.predictedScore = scoreGroup.max_manualscore_value;
  if (scoreGroup.screenStage.match('primary')) {
    scoreGroup = new PredictPrimaryPhenotypeExpSet(scoreGroup);
  } else if (scoreGroup.screenStage.match('secondary')) {
    scoreGroup = new PredictSecondaryPhenotypeExpSet(scoreGroup);
  }

  return scoreGroup;
};

ExpSet.extract.workflows.orderByExpManualScoresEnhSte = function (search) {
  search = new ExpSetSearch(search);
  let data = new ExpSetSearchResults({});
  return new Promise((resolve, reject) => {
    ExpSet.extract.workflows.orderByExpManualScoresBaseQuery(search)
      .where('manualscore_group', 'M_ENH_STE')
      .orWhere('manualscore_group', 'WT_ENH_STE')
      .groupBy('treatment_group_id')
      .groupBy('timestamp')
      .groupBy('manualscore_group')
      .groupBy('screen_id')
      // .groupBy('manualscore_code')
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
    .select('timestamp')
    .select('treatment_group_id')
    .select('manualscore_group')
    .select('screen_id')
    // .select('manualscore_code')
    .max('manualscore_value as max_manualscore_value')
    .min('manualscore_value as min_manualscore_value')
    .avg('manualscore_value as avg_manualscore_value');
};
