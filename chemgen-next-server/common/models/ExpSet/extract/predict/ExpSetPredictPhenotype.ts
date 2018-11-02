import app = require('../../../../../server/server.js');
import {WorkflowModel} from "../../../index";
import Promise = require('bluebird');
import {
  compact,
  orderBy,
  find,
  includes,
  isEqual,
  has,
  groupBy,
  isEmpty,
} from 'lodash';
import config = require('config');
import axios = require('axios')
import decamelize = require('decamelize');
import {
  ExpsetModule, ExpSetSearch, ExpSetSearchResults,
  PredictPrimaryPhenotypeExpSet,
  PredictSecondaryPhenotypeExpSet
} from "../../../../types/custom/ExpSetTypes";
import {
  ChemicalLibraryResultSet,
  ModelPredictedCountsResultSet,
  RnaiLibraryResultSet
} from "../../../../types/sdk/models";

const knex = config.get('knex');

const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 * WIP -
 * These are a set of APIs to ping the chemgen-next-analysis-docker/analysis/predict_pheno service  (in docker compose)
 * to predict either the emb leth or enh ste in primary screens
 * Secondary screens will follow soon (hopefully)
 */

/**
 *
 * @param search
 */
ExpSet.extract.workflows.predictEmbLeth = function (search) {
  return new Promise((resolve, reject) => {
    ExpSet.extract.workflows.getExpSetsByWorkflowId(search)
      .then((results: ExpSetSearchResults) => {
        results = ExpSet.extract.createPredictDataFrame(results);
        return ExpSet.extract.getPredictionEmbLeth(results);
      })
      .then((results: any) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

ExpSet.extract.createPredictDataFrame = function (data: ExpSetSearchResults) {
  //TODO Sanity checks to ensure we have all the right counts
  let expSetModule = new ExpsetModule(data);
  let dataFrame = [];
  data.albums.map((album) => {
    let mGroup: PredictPrimaryPhenotypeExpSet | PredictSecondaryPhenotypeExpSet = ExpSet.extract.getExpSetCounts(expSetModule, album, {treatmentGroupId: album.treatmentGroupId}, 'treatmentReagentImages', 'ctrlStrainImages');
    mGroup.manualscoreGroup = 'M_EMB_LETH';
    dataFrame.push(mGroup);
    let n2Group = ExpSet.extract.getExpSetCounts(expSetModule, album, {treatmentGroupId: album.treatmentGroupId}, 'ctrlReagentImages', 'ctrlNullImages');
    n2Group.manualscoreGroup = 'WT_EMB_LETH';
    dataFrame.push(n2Group);
  });
  return {expSet: data, dataFrame: dataFrame};
};

/**
 * Results is an object with :
 * {
 * dataFrame: Array<any>,
 * tableData: Array<any>,
 * expSetSearchResults: ExpSetSearchResults
 * }
 * Single dataframe object looks like this:
 * {
  "timestamp": "2018-02-13T10:42:29.000Z",
  "treatmentGroupId": 1393,
  "screenId" : 1,
  "manualscoreGroup": "M_EMB_LETH",
  "maxManualscoreValue": 3,
  "minManualScoreValue": 3,
  "avgManualScoreValue": 3,
  "reagentWormCountR0": 16,
  "reagentLarvaCountR0": 1,
  "reagentEggCountR0": 799,
  "reagentWormCountR1": 15,
  "reagentLarvaCountR1": 10,
  "reagentEggCountR1": 487,
  "ctrlWormCountR0": 16,
  "ctrlLarvaCountR0": 63,
  "ctrlEggCountR0": 131,
  "ctrlWormCountR1": 14,
  "ctrlLarvaCountR1": 61,
  "ctrlEggCountR1": 110,
  "ctrlWormCountR2": 13,
  "ctrlLarvaCountR2": 70,
  "ctrlEggCountR2": 161,
  "ctrlWormCountR3": 8,
  "ctrlLarvaCountR3": 111,
  "ctrlEggCountR3": 77,
  "predictedScore": 3
 * }
 * @param results
 */
ExpSet.extract.getPredictionEmbLeth = function (results: any) {
  return new Promise((resolve, reject) => {
    results.dataFrame = results.dataFrame.slice(0, 10);
    //@ts-ignore
    Promise.map(results.dataFrame, (df: PredictPrimaryPhenotypeExpSet | PredictSecondaryPhenotypeExpSet) => {
      let data = {
        screenStage: df.screenStage,
        phenotype: 'emb_leth',
        expSet: df,
      };
      //@ts-ignore
      return axios.post(config.get('predictPhenoUrl'), data)
        .then((results: any) => {
          if (has(results, ['data', 'results', 0])) {
            let resultsData = results.data.results[0];
            if (isEqual(resultsData.screenStage, 'primary')) {
              return new PredictPrimaryPhenotypeExpSet(resultsData);
            } else {
              return new PredictSecondaryPhenotypeExpSet(resultsData);
            }
          } else {
            return null;
          }
        })
        .catch((error) => {
          app.winston.error(error);
          return null;
          // return new Error(error);
        })
    }, {concurrency: 4})
      .then((results: PredictPrimaryPhenotypeExpSet[] | PredictPrimaryPhenotypeExpSet[]) => {
        results = compact(results);
        results = orderBy(results, 'predictedScore', 'desc');
        resolve(results);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};

/**
 * Pull out all expAssay2reagents that have a FIRST_PASS score but not any other
 * scoresExist: True
 * Selects all assay2reagents that have a FIRST_PASS=1 but no HAS_MANUAL_SCORE
 * scoresExist: False
 * Selects all assay2reagents that have no HAS_MANUAL_SCORE
 * @param data
 * @param search
 * @param hasManualScores
 */
ExpSet.extract.buildNativeQueryByNotExistsModelPredictedPheno = function (data: ExpSetSearchResults, search: ExpSetSearch) {
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

  query = query
    .whereNotExists(function () {
      this.select(1)
        .from('model_predicted_pheno')
        .whereRaw('exp_assay2reagent.treatment_group_id = model_predicted_pheno.treatment_group_id');
    });

  return query;
};
