#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require('commander');
var app = require("../server/server");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
/**
 * Sometimes we need to remove improperly added workflows
 */
app.models.ExpScreenUploadWorkflow
    .find({
    where: {
        name: {
            like: /CHEM Primary/
        }
    },
})
    .then(function (expWorkflows) {
    app.winston.info("Removing " + expWorkflows.length + " from the DB");
    // return;
    return Promise.map(lodash_1.shuffle(expWorkflows), function (expWorkflow) {
        app.winston.info("Removing Name: " + expWorkflow.name + " ID: " + expWorkflow.id);
        // return app.models.ExpScreenUploadWorkflow.load.removeWorkflowsFromDB(expWorkflow)
        // console.log(createSqlStatement(expWorkflow));
        return;
    }, { concurrency: 1 });
})
    .catch(function (error) {
    app.winston.error(error);
});
function createSqlStatement(expWorkflow) {
    var statements = [
        "DELETE FROM exp_plate where exp_workflow_id = '" + String(expWorkflow.id) + "';",
        "DELETE FROM exp_assay2reagent where exp_workflow_id = '" + String(expWorkflow.id) + "';",
        "DELETE FROM exp_assay where exp_workflow_id = '" + String(expWorkflow.id) + "';",
        "DELETE FROM exp_group where exp_workflow_id = '" + String(expWorkflow.id) + "';",
        "DELETE FROM exp_design where exp_workflow_id = '" + String(expWorkflow.id) + "';",
        "DELETE FROM exp_manual_scores where exp_workflow_id = '" + String(expWorkflow.id) + "';",
        "DELETE FROM model_predicted_counts where exp_workflow_id = '" + String(expWorkflow.id) + "';",
    ];
    return statements.join("\n");
}
//# sourceMappingURL=removeExpWorkflows.js.map