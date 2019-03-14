#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require('commander');
var app = require("../server/server");
var Promise = require("bluebird");
program
    .version('0.1.0')
    .option('-l, --limit [value]', 'Max number of workflows to process [1]', 1)
    .option('-s, --site [value]', 'Site - AD, NY, DEV [DEV]', 'DEV')
    .option('-p --search-pattern [value]', 'Search pattern - CHEM, AHR, RNAi, etc')
    .option('-e --exit', 'Exit after completing the queueing process.', false)
    .parse(process.argv);
processWorkflows(program);
var search = {};
search = {
    // screenId: {inq: [3,4]},
    screenId: 3,
};
function processWorkflows(program) {
    if (program.searchPattern) {
        // search = {
        //   screenId: {inq: [3,4]},
        //   screenId: 3,
        //   name: new RegExp(program.searchPattern),
        // }
    }
    app.models.ExpScreenUploadWorkflow
        .find({
        where: {
            name: /lgl/
        },
    })
        .then(function (results) {
        //@ts-ignore
        return Promise.map(results, function (result) {
            if (result.name) {
                app.winston.info("Queueing: ScreenId: " + result.screenName + " Name: " + result.name);
                // app.winston.info(`ScreenId: ${result.screenId}`);
                // jobQueues.workflowQueue.add({workflowData: result});
                return app.models.ExpScreenUploadWorkflow.load.workflows.doWork(result);
            }
        })
            .then(function () {
            app.winston.info('Completed queueing.');
            if (program.exit) {
                process.exit(0);
            }
            else {
                app.winston.info("You should see output to the screen. Continue to run this script in the background with ctrl+c");
            }
        })
            .catch(function (error) {
            console.error(error);
        });
    })
        .catch(function (error) {
        console.log(error);
        process.exit(1);
    });
}
//# sourceMappingURL=processScreens.js.map