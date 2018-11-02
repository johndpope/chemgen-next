"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var config = require("config");
var axios = require("axios");
var decamelize = require("decamelize");
var ExpSetTypes_1 = require("../../../../types/custom/ExpSetTypes");
var knex = config.get('knex');
var ExpSet = app.models.ExpSet;
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
    return new Promise(function (resolve, reject) {
        ExpSet.extract.workflows.getExpSetsByWorkflowId(search)
            .then(function (results) {
            results = ExpSet.extract.createPredictDataFrame(results);
            return ExpSet.extract.getPredictionEmbLeth(results);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.createPredictDataFrame = function (data) {
    //TODO Sanity checks to ensure we have all the right counts
    var expSetModule = new ExpSetTypes_1.ExpsetModule(data);
    var dataFrame = [];
    data.albums.map(function (album) {
        var mGroup = ExpSet.extract.getExpSetCounts(expSetModule, album, { treatmentGroupId: album.treatmentGroupId }, 'treatmentReagentImages', 'ctrlStrainImages');
        mGroup.manualscoreGroup = 'M_EMB_LETH';
        dataFrame.push(mGroup);
        var n2Group = ExpSet.extract.getExpSetCounts(expSetModule, album, { treatmentGroupId: album.treatmentGroupId }, 'ctrlReagentImages', 'ctrlNullImages');
        n2Group.manualscoreGroup = 'WT_EMB_LETH';
        dataFrame.push(n2Group);
    });
    return { expSet: data, dataFrame: dataFrame };
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
ExpSet.extract.getPredictionEmbLeth = function (results) {
    return new Promise(function (resolve, reject) {
        results.dataFrame = results.dataFrame.slice(0, 10);
        //@ts-ignore
        Promise.map(results.dataFrame, function (df) {
            var data = {
                screenStage: df.screenStage,
                phenotype: 'emb_leth',
                expSet: df,
            };
            //@ts-ignore
            return axios.post(config.get('predictPhenoUrl'), data)
                .then(function (results) {
                if (lodash_1.has(results, ['data', 'results', 0])) {
                    var resultsData = results.data.results[0];
                    if (lodash_1.isEqual(resultsData.screenStage, 'primary')) {
                        return new ExpSetTypes_1.PredictPrimaryPhenotypeExpSet(resultsData);
                    }
                    else {
                        return new ExpSetTypes_1.PredictSecondaryPhenotypeExpSet(resultsData);
                    }
                }
                else {
                    return null;
                }
            })
                .catch(function (error) {
                app.winston.error(error);
                return null;
                // return new Error(error);
            });
        }, { concurrency: 4 })
            .then(function (results) {
            results = lodash_1.compact(results);
            results = lodash_1.orderBy(results, 'predictedScore', 'desc');
            resolve(results);
        })
            .catch(function (error) {
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
ExpSet.extract.buildNativeQueryByNotExistsModelPredictedPheno = function (data, search) {
    var query = knex('exp_assay2reagent');
    query = query
        .where('reagent_type', 'LIKE', 'treat%')
        .whereNot({ reagent_id: null });
    //Add Base experiment lookup
    ['screen', 'library', 'expWorkflow', 'plate', 'expGroup', 'assay'].map(function (searchType) {
        if (!lodash_1.isEmpty(search[searchType + "Search"])) {
            var sql_col = decamelize(searchType + "Id");
            var sql_values = search[searchType + "Search"];
            query = query.whereIn(sql_col, sql_values);
        }
    });
    //Add Rnai reagent Lookup
    if (!lodash_1.isEmpty(data.rnaisList)) {
        query = query
            .where(function () {
            var firstVal = data.rnaisList.shift();
            var firstWhere = this.orWhere({ 'reagent_id': firstVal.rnaiId, library_id: firstVal.libraryId });
            data.rnaisList.map(function (rnai) {
                firstWhere = firstWhere.orWhere({ reagent_id: rnai.rnaiId, library_id: firstVal.libraryId });
            });
            data.rnaisList.push(firstVal);
        });
    }
    //Add Chemical Lookup
    if (!lodash_1.isEmpty(data.compoundsList)) {
        query = query
            .where(function () {
            var firstVal = data.compoundsList.shift();
            var firstWhere = this.orWhere({ 'reagent_id': firstVal.compoundId, library_id: firstVal.libraryId });
            data.compoundsList.map(function (compound) {
                firstWhere = firstWhere.orWhere({ reagent_id: compound.compoundId, library_id: firstVal.libraryId });
            });
            data.compoundsList.push(firstVal);
        });
    }
    query = query
        .whereNotExists(function () {
        this.select(1)
            .from('model_predicted_pheno')
            .whereRaw('exp_assay2reagent.treatment_group_id = model_predicted_pheno.treatment_group_id');
    });
    return query;
};
//# sourceMappingURL=ExpSetPredictPhenotype.js.map