"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../../../server/server.js");
var Promise = require("bluebird");
var wellData_1 = require("../../../../../../types/custom/wellData");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
/**
 * This workflow goes from the upload screenData to building the interfaces
 * TODO Name this something more informative
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 */
ExpScreenUploadWorkflow.load.workflows.worms.primary.doWork = function (workflowData) {
    return new Promise(function (resolve, reject) {
        if (workflowData instanceof Array) {
            //@ts-ignore
            Promise.map(workflowData, function (data) {
                return ExpScreenUploadWorkflow.load.workflows.worms.primary.processWorkflow(data);
            }, { concurrency: 1 })
                .then(function () {
                resolve();
            })
                .catch(function (error) {
                app.winston.error(error.stack);
                reject(new Error(error));
            });
        }
        else {
            ExpScreenUploadWorkflow.load.workflows.worms.primary.processWorkflow(workflowData)
                .then(function () {
                resolve();
            })
                .catch(function (error) {
                app.winston.error(error.stack);
                reject(new Error(error));
            });
        }
    });
};
ExpScreenUploadWorkflow.load.getInstrumentPlates = function (workflowData) {
    var instrumentPlates = [];
    Object.keys(workflowData.experimentGroups).map(function (expGroup) {
        workflowData.experimentGroups[expGroup].plates.map(function (plate) {
            instrumentPlates.push(plate);
        });
    });
    return instrumentPlates;
};
ExpScreenUploadWorkflow.load.workflows.worms.primary.processWorkflow = function (workflowData) {
    app.winston.info('Processing workflow');
    return new Promise(function (resolve, reject) {
        var instrumentPlates = ExpScreenUploadWorkflow.load.getInstrumentPlates(workflowData);
        ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExperimentData(workflowData, instrumentPlates)
            .then(function (screenData) {
            return ExpScreenUploadWorkflow.load.workflows.worms.createExpInterfaces(workflowData, screenData);
        })
            // .then((screenData: ScreenCollection) => {
            //   app.winston.info('RETURNING Scores');
            //   return app.models.ModelPredictedPheno.load.workflows.parseScreen(workflowData, screenData)
            // })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            app.winston.error(error.stack);
            reject(new Error(error));
        });
    });
};
/**
 * ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExperimentData
 * @param workflowData
 * @param {PlateResultSet[]} instrumentPlates
 */
ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExperimentData = function (workflowData, instrumentPlates) {
    app.winston.info('Populating Experiment Data');
    return new Promise(function (resolve, reject) {
        var search = app.models[workflowData.libraryModel].load.createWorkflowSearchObj(workflowData);
        ExpScreenUploadWorkflow
            .findOrCreate({
            where: search,
        }, workflowData)
            .then(function (results) {
            //TODO Update the contactSheetResults with the current workflow
            app.winston.info('Populating Experiment Plate');
            results = JSON.parse(JSON.stringify(results));
            return ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData(results[0], instrumentPlates);
        })
            .then(function (results) {
            app.winston.info('Populating Experiment Design');
            return ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExpDesignData(workflowData, results);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error(error.stack);
            reject(new Error(error));
        });
    });
};
/**
 * This workflow populates:
 * 1. ExpPlate
 * 2. Gets the plate plan -> mapping of library to exp plate wells
 * 3. Creates the stock
 * 4. Creates the experiment groups - set of experiment condition (treat_rnai,ctrl_null,ctrL_strain,ctrl_rnai)
 * 5. Creates the ExpAssays (expGroupId is inline)
 * 6. Fires off a request to the service that converts images to non proprietary and web format
 * For all plates in an ExperimentSet
 * For the primary Screen this is a single plate from a library plus its controls
 * Barcodes Replicate 1: RNAiI.3A1E_M, RNAiI.3AE, L4440E_M, L4440E
 * Barcodes Replicate 2: RNAiI.3A1E_D_M, RNAiI.3AE_D, L4440E_D_M, L4440E_D
 * A single workflow (workflowData) maps to a SINGLE Experiment Set
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateResultSet[]} instrumentPlates
 */
ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData = function (workflowData, instrumentPlates) {
    return new Promise(function (resolve, reject) {
        app.models.ExpPlate.load.workflows.processInstrumentPlates(workflowData, instrumentPlates)
            .then(function (expPlatesList) {
            app.winston.info('Processing Exp Assays');
            return app.models.ExpAssay.load.workflows.processExpPlates(workflowData, expPlatesList);
        })
            .then(function (results) {
            app.winston.info('Completed ExpAssays');
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error(error.stack);
            reject(new Error(error));
        });
    });
};
/**
 * ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExpDesignData
 * This workflow creates the linking between the different wells to conditions, and conditions to other conditions
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {ScreenCollection} screenData
 */
ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExpDesignData = function (workflowData, plateDataList) {
    return new Promise(function (resolve, reject) {
        var expDesignRows = app.models.ExpDesign.transform.workflows.screenDataToExpSets(workflowData, plateDataList);
        app.models.ExpDesign.load.workflows.createExpDesigns(workflowData, expDesignRows)
            .then(function (results) {
            var screenData = new wellData_1.ScreenCollection({ plateDataList: plateDataList, expDesignList: results });
            resolve(screenData);
        })
            .catch(function (error) {
            app.winston.error(error.stack);
            reject(new Error(error));
        });
    });
};
/**
 *
 * Once the ExperimentData has been populated its time to make some interfaces
 * This is the part of the workflow that creates teh interfaces
 * It wires up to the wordpressDB to create actual interfaces
 * This is done after all the experiment plates in the set are finished
 * @param workflowData
 * @param {ScreenCollection} screenData
 */
// ExpScreenUploadWorkflow.load.workflows.worms.createExpInterfaces = function (workflowData: ExpScreenUploadWorkflowResultSet, screenData: ScreenCollection) {
//   app.winston.info('Creating Experiment Interfaces');
//   return new Promise((resolve, reject) => {
//     resolve();
//     // Promise.map(screenData.plateDataList, (plateData: PlateCollection) => {
//     //   app.winston.info('Creating Exp Plate Interfaces');
//     //   return app.models.ExpPlate.load.workflows.createExpPlateInterface(workflowData, screenData, plateData)
//     //     .then(() => {
//     //       //TODO Make sure to have plateUrl
//     //       app.winston.info('Creating Exp Assay Interfaces');
//     //       return app.models.ExpAssay.load.workflows.createExpAssayInterfaces(workflowData, screenData, plateData);
//     //     })
//     //     .catch((error) => {
//     //       app.winston.error(error.stack);
//     //       // reject(new Error(error));
//     //       return (new Error(error));
//     //     });
//     // }, {concurrency: 1})
//     //   .then(() => {
//     //     // I don't actually do anything with the contactSheetResults from the interfaces
//     //     // They are just there to look pretty
//     //     resolve(screenData);
//     //   })
//     //   .catch((error) => {
//     //     reject(new Error(error));
//     //   });
//   });
// };
//# sourceMappingURL=ExpScreenUploadWorkflow.js.map