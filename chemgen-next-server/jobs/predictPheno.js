#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExpSetTypes_1 = require("../common/types/custom/ExpSetTypes");
var app = require('../server/server');
var axios = require('axios');
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var lodash_2 = require("lodash");
var data = new ExpSetTypes_1.ExpSetSearchResults({});
var search = new ExpSetTypes_1.ExpSetSearch({ screenSearch: [1] });
predictTheThings()
    .then(function () {
    process.exit(0);
})
    .catch(function (error) {
    app.winston.error(error);
    process.exit(1);
});
function predictTheThings() {
    return new Promise(function (resolve, reject) {
        var query = app.models.ExpSet.extract.buildNativeQueryByNotExistsModelPredictedPheno(data, search);
        query
            .limit(1000)
            .then(function (rows) {
            return rows.map(function (rawRowData) {
                Object.keys(rawRowData).map(function (rowKey) {
                    rawRowData[lodash_2.camelCase(rowKey)] = rawRowData[rowKey];
                    if (!lodash_1.isEqual(lodash_2.camelCase(rowKey), rowKey)) {
                        delete rawRowData[rowKey];
                    }
                });
                return new app.models.ExpAssay2reagent(JSON.parse(JSON.stringify(rawRowData)));
            });
        })
            .then(function (expAssay2reagents) {
            expAssay2reagents = lodash_1.shuffle(expAssay2reagents);
            if (expAssay2reagents.length) {
                search.expWorkflowSearch = [expAssay2reagents[0].expWorkflowId];
                return app.models.ExpSet.extract.workflows.predictEmbLeth(search);
            }
            else {
                return data;
            }
        })
            .then(function (results) {
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
//# sourceMappingURL=predictPheno.js.map