import app = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');
import {ExpSetSearch, ExpSetSearchResults} from "../../../types/custom/ExpSetTypes";
import {uniq} from 'lodash';
import * as client from "knex";
import config = require('config');
import {ExpAssay2reagentResultSet} from "../../../types/sdk/models";
const knex = config.get('knex');

//@ts-ignore
const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 *  ExpSetSearch the expAssay2reagents table given the search contactSheetResults
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
        let expWorkflowIds = results.map((expAssay2reagent: ExpAssay2reagentResultSet) =>{
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
