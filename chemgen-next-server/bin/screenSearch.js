#!/usr/bin/env node
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../server/server");
var url = 'mongodb://root:password@localhost:27017/chemgen?authSource=admin';
var dbName = 'chemgen';
var assert = require('assert');
var Promise = require('bluebird');
// Promise.promisifyAll(require("mongoose"));
var ExpSetTypes_1 = require("../common/types/custom/ExpSetTypes");
var expWorkflowDeepSearch = { 'screenStage': 'primary', 'screenType': 'permissive' };
// @ts-ignore
// const search = new ExpSetSearch({'expWorkflowDeepSearch': expWorkflowDeepSearch});
// const search = new ExpSetSearch({expWorkflowDeepSearch: {instrumentPlateIds: ['RNAi--2012-10-03--15.0--pod-2--ye60-F2--53171', 53116]}});
var search = new ExpSetTypes_1.ExpSetSearch({
    expWorkflowDeepSearch: {
        instrumentPlateIds: ['51184',
            'RNAi--2012-01-18--25.0--dhc-1--universal-F1--51185',
            'RNAi--2012-10-03--15.0--rme-8--or178-F2--53226']
    }
});
app.models.ExpSet.extract.searchByInstrumentPlateIds(search)
    .then(function (results) {
    console.log(results);
})
    .catch(function (error) {
    console.log(error);
});
//# sourceMappingURL=screenSearch.js.map