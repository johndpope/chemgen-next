import app = require('../../server/server.js');
import {WorkflowModel} from "../models";
import {RnaiLibraryResultSet} from "../types/sdk/models";
import {ChemicalLibraryResultSet} from "../types/sdk/models";

import {
  isEmpty,
  isEqual,
  isArray,
  camelCase,
} from 'lodash';

import decamelize = require('decamelize');
import * as client from "knex";

import config = require('config');
import {ExpSetSearch, ExpSetSearchResults} from "../types/custom/ExpSetTypes";

const knex = config.get('knex');

/**
 * Most of the scoring workflows require more complex sql queries than we can get with loopback
 * Complex sql queries are built with knex and executed directly as SQL
 */

const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 * The ExpSetSearch has filtering for basic exp data -
 * such as the screenId, libraryId, expWorkflowId, plateId, expGroupId, assayIdId
 * Example:
 * search = new ExpSetSearch({
 *   "screenSearch": [1,2]
 * })
 * Would filter the ExpAssay2Reagent score table to only those with a screenId of 1 or 2
 * @param query
 * @param search
 * @param fields
 */
ExpSet.extract.buildNativeQueryExpSearch = function (query, search: ExpSetSearch, fields: Array<string> | null) {
  if (!isArray(fields) || isEmpty(fields)) {
    fields = ['screen', 'library', 'expWorkflow', 'plate', 'expGroup', 'assay'];
  }

  //Add Base experiment lookup
  fields.map((searchType) => {
    if (!isEmpty(search[`${searchType}Search`])) {
      let sql_col = decamelize(`${searchType}Id`);
      let sql_values = search[`${searchType}Search`];
      query = query.whereIn(sql_col, sql_values);
    }
  });

  return query;
};

/**
 * ExpSet.extract.buildNativeQueryReagents is used in conjunction with the getByGenes or getByChemicals
 * First you need to know the ID of the reagents and their corresponding libraries
 * Then query for them
 * @param data
 * @param query
 * @param search
 */
ExpSet.extract.buildNativeQueryReagents = function(data: ExpSetSearchResults, query, search: ExpSetSearch){

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

  return query;
};

/**
 * ExpSet.extract.serializeNativeSqlToLoopbackModel
 * Loopback models are in camel case - screen_id in the DB becomes screenId in the model def
 * We can take the rows returned from knex, camelcase them, delete the extra keys, and then return them as regular loopback resultsets
 * @param rows
 * @param model
 */
ExpSet.extract.serializeNativeSqlToLoopbackModel = function (rows: Array<any>, model: string) {
  return rows.map(rawRowData => {
    Object.keys(rawRowData).map((rowKey) => {
      rawRowData[camelCase(rowKey)] = rawRowData[rowKey];
      if (!isEqual(camelCase(rowKey), rowKey)) {
        delete rawRowData[rowKey];
      }
    });
    return new app.models[model](JSON.parse(JSON.stringify(rawRowData)));
  });
};


