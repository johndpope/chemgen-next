#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../server/server");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var search = {};
search = {
    screenStage: 'primary',
    screenName: /RNAi/,
};
var libraryCode = 'AHR';
var site = 'AD';
var reagentType = 'RNAi';
processWorkflows();
function processWorkflows() {
    app.models.ExpScreenUploadWorkflow
        .find({
        where: search,
    })
        .then(function (results) {
        // console.log(results);
        var names = results.map(function (expWorkflow) {
            var name = createExpWorkflowName(expWorkflow);
            expWorkflow.name = name;
            return name;
            // console.log(name);
        });
        // console.log(names);
        return Promise.map(results, function (expWorkflow) {
            return app.models.ExpScreenUploadWorkflow
                .upsert(expWorkflow)
                .then(function (upsertResults) {
                return upsertResults;
            })
                .catch(function (error) {
                return new Error(error);
            });
        });
    })
        .then(function () {
        console.log('DONE!');
        process.exit(0);
    })
        .catch(function (error) {
        console.log(error);
        console.log('DONE WITH ERROR!');
        process.exit(1);
        return new Error(error);
    });
}
function createExpWorkflowName(expWorkflow) {
    var date = new Date(expWorkflow.assayDates[0]);
    var year, month, day;
    try {
        year = date.getFullYear();
        month = lodash_1.padStart(String(date.getMonth() + 1), 2, '0');
        day = lodash_1.padStart(String(date.getDate()), 2, '0');
    }
    catch (error) {
        console.log('WTH');
        console.log(error);
    }
    var conditionCode = '';
    if (lodash_1.isEqual(expWorkflow.screenType, 'restrictive')) {
        conditionCode = 'S';
    }
    else {
        conditionCode = 'E';
    }
    // expWorkflow.site = site;
    var name = '';
    try {
        name = [site + " " + reagentType + " " + libraryCode + " ",
            year + "-" + month + "-" + day + " ",
            expWorkflow.biosamples.experimentBiosample.name + " ",
            expWorkflow.biosamples.ctrlBiosample.name + " ",
            getTemperature(expWorkflow) + " ",
            conditionCode + " Chr " + expWorkflow.search.rnaiLibrary.chrom + " " + expWorkflow.search.rnaiLibrary.plate + " " + expWorkflow.search.rnaiLibrary.quadrant + " "].join('');
        return name;
    }
    catch (error) {
        console.log('error!');
    }
}
function getTemperature(expWorkflow) {
    if (lodash_1.isObject(expWorkflow.temperature)) {
        if (lodash_1.get(expWorkflow, ['temperature', '$numberDouble'])) {
            return lodash_1.get(expWorkflow, ['temperature', '$numberDouble']);
        }
    }
    else {
        return expWorkflow.temperature;
    }
}
//# sourceMappingURL=cleanUpExpWorkflowNames.js.map