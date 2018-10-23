import app = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import {
  ChemicalLibraryResultSet,
  ExpAssay2reagentResultSet, ExpAssayResultSet, ExpDesignResultSet, ExpGroupResultSet, ExpPlateResultSet,
  ExpScreenResultSet, ExpScreenUploadWorkflowResultSet,
  ModelPredictedCountsResultSet,
  RnaiLibraryResultSet,
  RnaiWormbaseXrefsResultSet
} from "../../../types/sdk/models/index";
import {find, uniqBy, isEqual, slice, shuffle, isUndefined, isNull, isEmpty, isArray} from 'lodash';
import Promise = require('bluebird');
import {ExpSetSearch, ExpSetSearchResults} from "../../../types/custom/ExpSetTypes/index";

const RnaiExpSet = app.models.RnaiExpSet as (typeof WorkflowModel);


/**
 * Here be a few convenience methods to manualScoresAdvancedQuery for manualScoresAdvancedQuery RNAi sets
 * Most of the actual work is done over at app.models.ExpSet
 */

/**
 * Get ExpSets by GeneList
 * GeneList is an array of strings, with either the wormbase name of the cosmid name
 * Optionally, this also allows for searching by libraryId, screen, plate, expWorkflowId
 * If search.includeCounts == True, this will also fetch the includeCounts
 * @param {ExpSetSearch} search
 */
RnaiExpSet.extract.workflows.getExpSetsByGeneList = function (search?: ExpSetSearch) {
  return new Promise((resolve, reject) => {

    search = new ExpSetSearch(search);
    let data = new ExpSetSearchResults({});

    app.models.RnaiLibrary.extract.workflows
      .getRnaiLibraryFromUserGeneList(search.rnaiSearch, search)
      .then((results: RnaiLibraryResultSet[]) => {
        if (isEmpty(results)) {
          resolve(data);
        } else {
          data.rnaisList = results;
          app.models.ExpSet.extract.buildBasicPaginationData(data, search)
            .then((data: ExpSetSearchResults) => {
              return app.models.ExpSet.extract.searchExpAssay2reagents(data, search);
            })
            .then((results: ExpSetSearchResults) => {
              return app.models.ExpSet.extract.workflows.getReagentData(results, search);
            })
            .then((results: ExpSetSearchResults) => {
              resolve(results);
            })
            .catch((error) => {
              reject(new Error(error));
            });
        }
      })
  });
};

