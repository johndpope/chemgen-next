"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var ExpSetTypes_1 = require("../../../../types/custom/ExpSetTypes");
var config = require("config");
var knex = config.get('knex');
var ExpSet = app.models.ExpSet;
/**
 * These are functions related to the Exp Batch QC
 * A Batch is a group of plates that are imaged together - (RNAiIII.1A_M_1, RNAiIII.1A_M_2, RNAiIII.1A_N2_1, RNAiIII.1A_N2_2, L4440_1, L4440_2 in suppressor or enhancer)
 * A single batch corresponds to a single ExpScreeUploadWorkflow ResultSet
 * Ultimately, it returns an ExpSetSearchResults Object
 */
/**
 * Angular Interface
 * Route - /#/exp-workflow-qc
 * Component - <app-exp-workflow-qc>
 */
/**
 * ExpSet.extract.workflows.getUnscoredExpWorkflowsByQCBatch
 * Get Exp Batches that haven't been through QC
 * 1. Find an exp_workflow_id that doesn't have a corresponding manualscoreGroup='BATCH_QC' in the ExpManualScores Table
 * 2. Return the ExpSet Data from the exp_workflow_id we returned previously
 * @param search
 */
ExpSet.extract.workflows.getUnscoredExpWorkflowsByQCBatch = function (search) {
    return new Promise(function (resolve, reject) {
        search = new ExpSetTypes_1.ExpSetSearch(search);
        var data = new ExpSetTypes_1.ExpSetSearchResults({});
        if (!search.scoresExist) {
            search.scoresExist = false;
        }
        else {
            search.scoresExist = true;
        }
        //TODO REFACTOR
        ExpSet.extract.workflows.getExpAssay2reagentsByBatchQC(data, search, search.scoresExist)
            .then(function (data) {
            return app.models.ExpSet.extract
                .buildExpSetsByExpWorkflowId(data, search, data.expAssay2reagents[0].expWorkflowId);
        })
            .then(function (data) {
            data = ExpSet.extract.cleanUp(data, search);
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * TODO Refactor this
 * ExpSet.extract.workflows.getExpAssay2reagentsByBatchQC
 * This executes the raw SQL Query built by Knex to get the ExpWorkflows we want
 * @param data
 * @param search
 * @param scoresExist
 */
ExpSet.extract.workflows.getExpAssay2reagentsByBatchQC = function (data, search, scoresExist) {
    return new Promise(function (resolve, reject) {
        var sqlQuery = ExpSet.extract.buildNativeQueryByQC(data, search, scoresExist);
        app.winston.info('Executing sql query');
        //ORDER BY RAND() takes a huge performance hit
        //Instead get 5000 (which is a basically arbitrary number) results, and randomly select the page size
        sqlQuery = sqlQuery
            .limit(1000)
            .offset(data.skip);
        sqlQuery
            .then(function (rows) {
            var count = rows.length;
            var totalPages = Math.round(lodash_1.divide(Number(count), Number(search.pageSize)));
            data.currentPage = search.currentPage;
            data.pageSize = search.pageSize;
            data.skip = search.skip;
            data.totalPages = totalPages;
            var rowData = ExpSet.extract.serializeNativeSqlToLoopbackModel(rows, 'ExpAssay2reagent');
            if (rowData.length) {
                data.expAssay2reagents = [lodash_1.shuffle(rowData)[0]];
            }
            else {
                data.expAssay2reagents = [];
            }
            app.winston.info('Complete sql query');
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error("buildUnscoredPaginationData: " + error);
            var totalPages = 0;
            data.currentPage = search.currentPage;
            data.pageSize = search.pageSize;
            data.skip = search.skip;
            data.totalPages = totalPages;
            app.winston.info('Complete sql query');
            resolve(data);
        });
    });
};
/**
 * Experiments batches can (and should) go through an initial QC
 * This ensures that the plates are all correct
 * And the user can also indicate junk/not junk of each well, or junk an entire plate
 * Pull out all expAssay2reagents that have a QC score but not any other
 * scoresExist: True
 * Selects all assay2reagents that have a QC=1
 * scoresExist: False
 * Here we don't actually care much if there are manual scores or first pass scores
 * @param data
 * @param search
 * @param hasManualScores
 */
ExpSet.extract.buildNativeQueryByQC = function (data, search, hasManualScores) {
    var query = knex('exp_assay2reagent');
    query = query
        .distinct('exp_workflow_id')
        .groupBy('exp_workflow_id')
        .where('reagent_type', 'LIKE', 'treat%')
        .whereNot({ reagent_id: null });
    query = ExpSet.extract.buildNativeQueryExpSearch(query, search, null);
    query = ExpSet.extract.buildNativeQueryReagents(data, query, search);
    if (hasManualScores) {
        query = query
            .whereExists(function () {
            this.select(1)
                .from('exp_manual_scores')
                .whereRaw('(exp_assay2reagent.treatment_group_id = exp_manual_scores.treatment_group_id ) AND (exp_manual_scores.manualscore_group = \'BATCH_QC\')');
        });
    }
    else {
        query = query
            .whereNotExists(function () {
            this.select(1)
                .from('exp_manual_scores')
                .whereRaw('exp_assay2reagent.treatment_group_id = exp_manual_scores.treatment_group_id AND exp_manual_scores.manualscore_group = \'BATCH_QC\'');
        });
    }
    return query;
};
//# sourceMappingURL=ExpSetScoringExtractByBatchQC.js.map