import app = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');
import {ExpSetSearch, ExpSetSearchResults} from "../../../types/custom/ExpSetTypes";

import * as client from "knex";
import config = require('config');
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

    app.models.ExpAssay2reagent
      .find(expAssay2reagentSearch)
      .then((results) => {
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
