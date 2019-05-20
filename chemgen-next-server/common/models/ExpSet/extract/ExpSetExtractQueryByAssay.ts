import app = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');
import {ExpSetSearch, ExpSetSearchResults} from "../../../types/custom/ExpSetTypes";
import {isArray, uniq, isNull} from 'lodash';
import * as client from "knex";
import config = require('config');
import {ExpAssay2reagentResultSet} from "../../../types/sdk/models";

const knex = config.get('knex');

//@ts-ignore
const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 *  ExpSetSearch the expAssay2reagents table given the expSetSearch contactSheetResults
 *  From there get assays, and get includeCounts
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.searchExpAssay2reagents = function (search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    search = new ExpSetSearch(search);
    let data = new ExpSetSearchResults({});
    let expAssay2reagentSearch = app.models.ExpSet.extract.buildExpAssay2reagentSearch(data, search);

    app.winston.info(`ExpAssay2reagentSearch: ${JSON.stringify(expAssay2reagentSearch, null, 2)}`);

    app.models.ExpAssay2reagent
      .find(expAssay2reagentSearch)
      .then((results) => {
        app.winston.info(`Got ${results.length} expAssay2reagentResults`);
        let expWorkflowIds = results.map((expAssay2reagent: ExpAssay2reagentResultSet) => {
          return expAssay2reagent.expWorkflowId;
        });
        expWorkflowIds = uniq(expWorkflowIds);
        app.winston.info(`From ${JSON.stringify(expWorkflowIds)}`);
        data.expAssay2reagents = results;
        return app.models.ExpSet.extract.buildExpSets(data, search);
      })
      .then((data: ExpSetSearchResults) => {
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};

ExpSet.extract.workflows.getRelatedExpSets = function (search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    search = new ExpSetSearch(search);
    let data = new ExpSetSearchResults({});
    let expAssay2reagentSearch = app.models.ExpSet.extract.buildExpAssay2reagentSearch(data, search);

    app.models.ExpAssay2reagent
      .find(expAssay2reagentSearch)
      .then((results) => {
        app.winston.info(`Got ${results.length} expAssay2reagentResults`);
        results = results.filter((result: ExpAssay2reagentResultSet) => {
          return !isNull(result.libraryId) && !isNull(result.reagentId);
        });
        let reagentSearch = {or: []};
        results.map((result: ExpAssay2reagentResultSet) => {
          reagentSearch.or.push({and: [{libraryId: result.libraryId}, {reagentId: result.reagentId}]});
        });
        if (reagentSearch.or.length) {
          return app.models.ExpAssay2reagent
            .find({where: reagentSearch})
        } else {
          resolve(data);
        }
      })
      .then((results: ExpAssay2reagentResultSet[]) => {
        data.expAssay2reagents = results;
        if (results.length) {
          return app.models.ExpSet.extract.buildExpSets(data, search);
        } else {
          resolve(data);
        }
      })
      .then((data: ExpSetSearchResults) => {
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};


/**
 * Given a set of libraryIds and reagentIds
 * Get all corresponding expSets
 * @param reagentSearch
 */
ExpSet.extract.getExpSetsByLibraryData = function (reagentSearch: Array<{ reagentId, libraryId }>) {
  return new Promise((resolve, reject) => {
    let data = new ExpSetSearchResults({});
    let search = new ExpSetSearch({});
    let expAssay2reagentSearch = {or: []};
    reagentSearch.map((searchCriteria) => {
      expAssay2reagentSearch.or.push({and: [{libraryId: searchCriteria.libraryId}, {reagentId: searchCriteria.reagentId}]});
    });
    if (isArray(reagentSearch) && reagentSearch.length) {
      app.models.ExpAssay2reagent
        .find({where: expAssay2reagentSearch})
        .then((results: ExpAssay2reagentResultSet[]) => {
          data.expAssay2reagents = results;
          search.expGroupSearch = data.expAssay2reagents.map((expAssay2reagent) => {
            return expAssay2reagent.treatmentGroupId;
          });
          search.expGroupSearch = uniq(search.expGroupSearch);
          if (results.length) {
            return app.models.ExpSet.extract.buildExpSets(data, search);
          } else {
            resolve(data);
          }
        })
        .then((data: ExpSetSearchResults) => {
          resolve(data);
        })
        .catch((error) => {
          app.winston.error(error);
          reject(new Error(error));
        });
    } else {
      resolve(data);
    }
  });
};
