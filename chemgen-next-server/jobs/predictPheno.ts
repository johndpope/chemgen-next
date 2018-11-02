#!/usr/bin/env node

import {ExpSetSearch, ExpSetSearchResults} from "../common/types/custom/ExpSetTypes";

const app = require('../server/server');
const axios = require('axios');
import Promise = require('bluebird');
import {
  ExpAssay2reagentResultSet,
  ExpAssayResultSet, ExpGroupResultSet, ExpPlateResultSet,
  ModelPredictedCountsResultSet
} from "../common/types/sdk/models/";
import {isFinite, isNaN, isNull, find, shuffle, isEqual, range, isUndefined} from 'lodash';
import {camelCase, round, add, divide} from 'lodash';

let data = new ExpSetSearchResults({});
let search = new ExpSetSearch({screenSearch: [1]});

predictTheThings()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    app.winston.error(error);
    process.exit(1);
  });

function predictTheThings() {
  return new Promise((resolve, reject) => {
    let query = app.models.ExpSet.extract.buildNativeQueryByNotExistsModelPredictedPheno(data, search);
    query
      .limit(1000)
      .then((rows) => {
        return rows.map((rawRowData) => {
          Object.keys(rawRowData).map((rowKey) => {
            rawRowData[camelCase(rowKey)] = rawRowData[rowKey];
            if (!isEqual(camelCase(rowKey), rowKey)) {
              delete rawRowData[rowKey];
            }
          });
          return new app.models.ExpAssay2reagent(JSON.parse(JSON.stringify(rawRowData)));
        });
      })
      .then((expAssay2reagents: ExpAssay2reagentResultSet[]) => {
        expAssay2reagents = shuffle(expAssay2reagents);
        if (expAssay2reagents.length) {
          search.expWorkflowSearch = [expAssay2reagents[0].expWorkflowId];
          return app.models.ExpSet.extract.workflows.predictEmbLeth(search)
        } else {
          return data;
        }
      })
      .then((results: any) => {
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}
