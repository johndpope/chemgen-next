#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../server/server");
app.models.ExpScreenUploadWorkflow
    .find({ fields: { id: true } })
    .then(function (expWorkflows) {
    app.winston.info("There are " + expWorkflows.length + " workflows total");
    return app.models.ExpScreenUploadWorkflow
        .find({
        where: {
            id: {
                nin: expWorkflows.slice(0, 10).map(function (expWorkflow) {
                    return String(expWorkflow.id);
                })
            }
        }
    })
        .then(function (filteredExpWorkflows) {
        app.winston.info("There are " + filteredExpWorkflows.length + " workflows after filtering");
        // let expWorkflowFound = false;
        // filteredExpWorkflows.map((expWorkflow: ExpScreenUploadWorkflowResultSet) =>{
        //   if(find(expWorkflows, {id: String}))
        // });
        return;
    })
        .catch(function (error) {
        return new Error(error);
    });
})
    .catch(function (error) {
    return new Error(error);
});
//# sourceMappingURL=testMongoDBScratch.js.map