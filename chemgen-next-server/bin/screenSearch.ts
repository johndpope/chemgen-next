#!/usr/bin/env node

'use strict';

import app = require('../server/server');
import {ExpScreenUploadWorkflowResultSet} from "../common/types/sdk/models";
import {intersection, reduce, compact, isEqual} from 'lodash';

const url = 'mongodb://root:password@localhost:27017/chemgen?authSource=admin';
const dbName = 'chemgen';
const assert = require('assert');
const Promise = require('bluebird');
// Promise.promisifyAll(require("mongoose"));


import {ExpSetSearch} from "../common/types/custom/ExpSetTypes";

let expWorkflowDeepSearch: { screenStage, screenType } = {'screenStage': 'primary', 'screenType': 'permissive'};

// @ts-ignore
// const expSetSearch = new ExpSetSearch({'expWorkflowDeepSearch': expWorkflowDeepSearch});
// const expSetSearch = new ExpSetSearch({expWorkflowDeepSearch: {instrumentPlateIds: ['RNAi--2012-10-03--15.0--pod-2--ye60-F2--53171', 53116]}});
const search = new ExpSetSearch({
  expWorkflowDeepSearch: {
    instrumentPlateIds: ['51184',
      'RNAi--2012-01-18--25.0--dhc-1--universal-F1--51185',
      'RNAi--2012-10-03--15.0--rme-8--or178-F2--53226']
  }
});

app.models.ExpSet.extract.searchByInstrumentPlateIds(search)
  .then((results) => {
    console.log(results);
  })
  .catch((error) => {
    console.log(error);
  });

