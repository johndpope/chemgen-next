"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var config = require("config");
var index_1 = require("../../../types/sdk/models/index");
var wellData_1 = require("../../../types/custom/wellData");
var Promise = require("bluebird");
var _ = require("lodash");
var lodash_1 = require("lodash");
var request = require('request-promise');
var uri = "http://" + config.get('imageConversionHost') + ":" + config.get('imageConversionPort');
var ExpAssay = app.models['ExpAssay'];
/**
 * Workflows for loading data into the Exp*Tables
 */
//This is probably very very bad
var expGroups = [];
/**
 * ExpAssay.load.workflows.processExpPlates
 * Loop through the plates of a given Exp Set
 * Exp Set is a List of Plates with 1 Grouping
 * For primary this looks like:
 * treat_rnai - RNAiI.3A1E_M
 * ctrl_rnai - RNAiI.3A1E
 * ctrl_strain - L4440E_M
 * ctrl_null - L4440E
 * Exp Set has two different groupings
 * Treatment Vs Controls
 * {treat_rnai: ['ctrl_strain', 'ctrl_null', 'ctrl_rnai']
 * ExpBiosample vs ControlBiosample (There are places in the code where this may be referred to as Mutant vs Wildtype)
 * {treat_rnai: ctrl_rnai}
 * {ctrl_strain: ctrl_null}
 * For the secondary screens this looks similar, except there are no L4440 Plates
 * Instead there are L4440 wells
 * Plate Plan is developed in the RnaiLibrary.getParentLibrary functions
 * IMPORTANT - Using a plate per condition is a handy designation, but actual experiment groups are assigned per WELL, NOT per plate
 * @param workflowData
 * @param {ExpPlateResultSet[]} expPlates
 */
ExpAssay.load.workflows.processExpPlates = function (workflowData, expPlates) {
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        Promise.map(lodash_1.shuffle(expPlates), function (expPlate) {
            app.winston.info("Begin Exp Plate: " + expPlate.barcode + " load experiment data");
            return ExpAssay.load.workflows.processExpPlate(workflowData, expPlate)
                .then(function (results) {
                //This should probably be done at the expGroups stage
                app.winston.info("Begin Exp Plate: " + expPlate.barcode + " load annotation data");
                return ExpAssay.load.prepareAnnotationData(workflowData, results);
            });
        }, { concurrency: 1 })
            // @ts-ignore
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.warn(error.stack);
            reject(new Error(error));
        });
    });
};
/**
 * ExpAssay.load.workflows.processExpPlate
 * This workflow populates the experimental database in the chemgenDB
 * 1. Library Based - generate the plan plan
 * 2. Create the Exp Groups
 * 3. Create the Assays (Exp Group inline)
 * 4. Create the Stocks
 * It does not create interfaces
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 */
ExpAssay.load.workflows.processExpPlate = function (workflowData, expPlate) {
    return new Promise(function (resolve, reject) {
        app.models[workflowData.libraryModel].load.workflows.processExpPlate(workflowData, expPlate)
            .then(function (results) {
            // TODO We should create the expGroups based on the PlateDataList
            return ExpAssay.load.createExpGroups(workflowData, results);
        })
            .then(function (results) {
            return ExpAssay.load.createExpAssays(workflowData, { expPlate: expPlate, wellDataList: results });
        })
            .then(function (results) {
            //TODO Clean this up - shouldn't be creating new objects all over the place
            // let plateData = new PlateCollection({expPlate: expPlate, wellDataList: contactSheetResults});
            return app.models[workflowData.libraryStockModel].load.createStocks(workflowData, {
                expPlate: expPlate,
                wellDataList: results
            });
        })
            .then(function (results) {
            return app.models.ExpAssay2reagent.load.createAssayStock(workflowData, {
                expPlate: expPlate,
                wellDataList: results
            });
        })
            .then(function (results) {
            var plateData = new wellData_1.PlateCollection({ expPlate: expPlate, wellDataList: results });
            return ExpAssay.load.workflows.imageConversionPipeline.all(workflowData, plateData);
        })
            .then(function (results) {
            // let plateData = new PlateCollection({expPlate: expPlate, wellDataList: contactSheetResults});
            // resolve({expPlate: expPlate, wellDataList: contactSheetResults});
            resolve(results);
        })
            .catch(function (error) {
            app.winston.warn(error);
            reject(new Error(error));
        });
    });
};
/**
 * TODO Do this in the beginning of the workflow when the platePlan is gathered
 * TODO All the ExpGroups should be created at once to ensure they are uniq
 * ExpGroup is a grouping that is used later to match wells their matching conditions
 * Match ExpBiosample (mel-28) to CtrlBiosample (N2) with some particular gene
 * Match ExpBiosample (mel-28) to its L4440 (L4440E_M) controls
 * Match CtrlBiosample (N2) to its L4440 (L4440E) controls
 * @param workflowData
 * @param {PlateCollection} expPlateData
 */
ExpAssay.load.createExpGroups = function (workflowData, expPlateData) {
    return new Promise(function (resolve, reject) {
        var expGroupData;
        try {
            expGroupData = ExpAssay.load.getExpGroup(workflowData, expPlateData.expPlate);
        }
        catch (error) {
            app.winston.warn(error);
            reject(new Error(error));
        }
        //@ts-ignore
        Promise.map(lodash_1.shuffle(expPlateData.wellDataList), function (wellData) {
            /*
            Check status of well
            1. Its a well with a reagent
            2. Its a well that is a control (For both primary and secondary screens)
            3. Its an empty well
             */
            if (wellData.parentLibraryData[workflowData.reagentLookUp]) {
                ///Well has a reagent associated to it
                var createObj = new index_1.ExpGroupResultSet({
                    screenId: workflowData.screenId,
                    libraryId: workflowData.libraryId,
                    biosampleId: expGroupData.biosampleId,
                    expGroupType: expGroupData.expGroupType,
                    well: wellData.stockLibraryData.well,
                    expWorkflowId: workflowData.id,
                });
                var expGroupFound = ExpAssay.load.findExpGroup(expGroups, createObj);
                if (expGroupFound) {
                    wellData.expGroup = expGroupFound;
                    return wellData;
                }
                else {
                    return app.models.ExpGroup
                        .findOrCreate({ where: app.etlWorkflow.helpers.findOrCreateObj(createObj) }, createObj)
                        .then(function (results) {
                        return ExpAssay.load.addExpGroupAnnotation(wellData, results[0]);
                    });
                }
            }
            else if (wellData.annotationData.taxTerm.match('L4440') || wellData.annotationData.taxTerm.match('DMSO')) {
                /*
                TODO Add L4440/DMSO as controlLookUp to workflowData
                Well is a control well
                If the biosample is an expBiosample get the corresponding ctrl for that biosample
                 */
                var expGroupType = void 0;
                try {
                    expGroupType = ExpAssay.load[workflowData.screenStage].getControlCondition(workflowData, expPlateData.expPlate, expGroupData);
                }
                catch (error) {
                    app.winston.warn(error);
                    reject(new Error(error));
                }
                var createObj = new index_1.ExpGroupResultSet({
                    screenId: workflowData.screenId,
                    libraryId: workflowData.libraryId,
                    biosampleId: expGroupData.biosampleId,
                    expWorkflowId: workflowData.id,
                    expGroupType: expGroupType,
                });
                var expGroupFound = ExpAssay.load.findExpGroup(expGroups, createObj);
                if (expGroupFound) {
                    wellData.expGroup = expGroupFound;
                    return wellData;
                }
                else {
                    return app.models.ExpGroup
                        .findOrCreate({ where: app.etlWorkflow.helpers.findOrCreateObj(createObj) }, createObj)
                        .then(function (results) {
                        expGroups.push(results[0]);
                        return ExpAssay.load.addExpGroupAnnotation(wellData, results[0]);
                    })
                        .catch(function (error) {
                        app.winston.warn(error);
                        return new Error(error);
                    });
                }
            }
            else {
                //Well is an empty well
                wellData['expGroup'] = new index_1.ExpGroupResultSet({
                    screenId: workflowData.screenId,
                    libraryId: workflowData.libraryId,
                    biosampleId: expGroupData.biosampleId,
                    well: wellData.stockLibraryData.well,
                    expWorkflowId: workflowData.id,
                });
                return wellData;
            }
        }, { concurrency: 1 })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.warn(error);
            reject(new Error(error));
        });
    });
};
ExpAssay.load.findExpGroup = function (expGroups, expGroup) {
    // return find(expGroups, (expGroupRow) => {
    //   return isEqual(expGroupRow.expGroupType, expGroup.expGroupType) && isEqual(expGroupRow.libraryId, expGroup.libraryId)
    //     && isEqual(expGroupRow.screenId, expGroup.screenId) && isEqual(expGroupRow.biosampleId, expGroup.biosampleId);
    // });
    return lodash_1.find(expGroups, {
        expGroupType: expGroup.expGroupType,
        libraryId: expGroup.libraryId,
        biosampleId: expGroup.biosampleId,
        well: expGroup.well
    });
};
ExpAssay.load.addExpGroupAnnotation = function (wellData, expGroup) {
    wellData.expGroup = expGroup;
    // @ts-ignore
    wellData.annotationData.taxTerms.push({ taxonomy: 'exp_group_id', taxTerm: expGroup.expGroupId });
    // @ts-ignore
    wellData.annotationData.taxTerms.push({ taxonomy: 'envira-tag', taxTerm: "EGI-" + expGroup.expGroupId });
    // @ts-ignore
    wellData.annotationData.taxTerms.push({
        taxonomy: 'envira-tag',
        taxTerm: "EGT-" + expGroup.expGroupType + "-EGI-" + expGroup.expGroupId
    });
    return wellData;
};
/**
 * ExpAssay.load.createExpAssays
 * @param workflowData
 * @param {PlateCollection} expPlateData
 */
ExpAssay.load.createExpAssays = function (workflowData, expPlateData) {
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        Promise.map(expPlateData.wellDataList, function (wellData) {
            var createObj;
            var assayCodeName = expPlateData.expPlate.barcode + "_" + wellData.stockLibraryData.well;
            createObj = new index_1.ExpAssayResultSet({
                assayImagePath: ExpAssay.load.resolveImagePath[workflowData.instrumentLookUp](workflowData, expPlateData.expPlate, wellData),
                screenId: workflowData.screenId,
                plateId: expPlateData.expPlate.plateId,
                biosampleId: wellData.expGroup.biosampleId,
                assayCodeName: assayCodeName,
                assayWell: wellData.stockLibraryData.well,
                expGroupId: wellData.expGroup.expGroupId,
                assayReplicateNum: ExpAssay.load.getExpGroupReplicate(workflowData, expPlateData.expPlate),
                expWorkflowId: workflowData.id,
            });
            return ExpAssay
                .findOrCreate({ where: app.etlWorkflow.helpers.findOrCreateObj(createObj) }, createObj)
                .then(function (results) {
                wellData.expAssay = results[0];
                return wellData;
            })
                .catch(function (error) {
                app.winston.warn(error);
                reject(new Error(error));
            });
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.info(error);
            reject(new Error(error));
        });
    });
};
/**
 * ExpAssay.load.resolveImagePath.default
 * This is the default logic for NYUAD  - images are just named instrumentPlateId/barcode_well
 * In NY there is a weird tile lookup thing
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @param {WellCollection} wellData
 * @returns {string}
 */
ExpAssay.load.resolveImagePath.default = function (workflowData, expPlate, wellData) {
    return expPlate.plateImagePath + "/" + expPlate.barcode + "_" + wellData.stockLibraryData.well;
};
/**
 * This is the logic for resolving the image path from the arrayscan instruments
 * its instrumentPlateId/barcode_well
 * Base path is not put in here, but in AD its /mnt/image/PlateData/
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @param {WellCollection} wellData
 */
ExpAssay.load.resolveImagePath.arrayScan = function (workflowData, expPlate, wellData) {
    return ExpAssay.load.resolveImagePath.default(workflowData, expPlate, wellData);
};
/**
 * ExpAssay.load.resolveImagePath.nyu
 * This is not complete! The default is only in there as a placeholder
 * TODO Get a mapping of Tile000N -> Well (A01)
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @param {WellCollection} wellData
 */
ExpAssay.load.resolveImagePath.nyMicroscope = function (workflowData, expPlate, wellData) {
    // app.etlWorkflow.helpers.nyWellToTile = {
    // return ExpAssay.load.resolveImagePath.default(workflowData, expPlate, wellData);
    var tile = app.etlWorkflow.helpers.nyWellToTile[wellData.stockLibraryData.well];
    return expPlate.plateImagePath + "/" + tile;
};
/**
 * Get the exp Group from the workflow Data and the instrumentPlateId
 * ExpDesign is a bit different for primary/secondary screens
 * primary each condition is its own plate
 * secondary the control wells are on the same plate
 * Weird things happen when saving the workflow as a mongodb object that do not happen on an in memory object
 * The deeply nested things are saved as strings instead of integers, which is a huge pain
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @returns {{expGroupType: string; biosampleId: any}}
 */
ExpAssay.load.getExpGroup = function (workflowData, expPlate) {
    //TODO need to return the index here
    var expGroupType;
    try {
        expGroupType = Object.keys(workflowData.experimentGroups).filter(function (condition) {
            return lodash_1.find(workflowData.experimentGroups[condition]['plates'], ['instrumentPlateId', String(expPlate.instrumentPlateId)]) || lodash_1.find(workflowData.experimentGroups[condition]['plates'], ['instrumentPlateId', expPlate.instrumentPlateId]);
        })[0];
    }
    catch (error) {
        app.winston.info(error);
        throw new Error(error);
    }
    if (!expGroupType) {
        app.winston.error('Unable to get expGroupType');
        app.winston.error(JSON.stringify(expPlate, null, 2));
        app.winston.error("WorkflowID: " + JSON.stringify(workflowData.id));
        throw new Error('unable to get expGroupType WTF');
    }
    var biosample;
    try {
        biosample = workflowData.experimentGroups[expGroupType]['biosampleId'];
    }
    catch (error) {
        app.winston.error('Unable to get the experiment group type');
        app.winston.error(error);
        throw new Error(error);
    }
    return { expGroupType: expGroupType, biosampleId: biosample };
};
/**
 * Get the replicate number from the workflowData
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @returns {number}
 */
ExpAssay.load.getExpGroupReplicate = function (workflowData, expPlate) {
    return Object.keys(workflowData.replicates).filter(function (replicate) {
        return _.includes(workflowData.replicates[replicate], expPlate.instrumentPlateId);
    })[0];
};
/**
 * This gets the control condition for the primary screen
 * RNAi
 * In the primary screen the controls are on a separate plate with barcode L4440 or L4440M
 * For the secondary they are on the same plate
 * Chemical
 * In the primary screens DMSO controls are columns 1 and 12
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @param expGroup
 * @returns {any | string | {name: string; type: string} | {name; type} | string}
 */
ExpAssay.load.primary.getControlCondition = function (workflowData, expPlate, expGroup) {
    // return expGroup.expGroupType;
    if (lodash_1.get(workflowData.biosampleMatchConditions, expGroup.expGroupType)) {
        return workflowData.biosampleMatchConditions[expGroup.expGroupType];
    }
    else {
        return expGroup.expGroupType;
    }
    // return workflowData.biosampleMatchConditions[expGroup.expGroupType] || expGroup.expGroupType;
};
ExpAssay.load.secondary.getControlCondition = function (workflowData, expPlate, expGroup) {
    // return workflowData.biosampleMatchConditions[expGroup.expGroupType];
    if (lodash_1.get(workflowData.biosampleMatchConditions, expGroup.expGroupType)) {
        return workflowData.biosampleMatchConditions[expGroup.expGroupType];
    }
    else {
        return expGroup.expGroupType;
    }
};
/**
 * TODO This should get moved to after the screen , in the same spot as ExperimentDesign
 * This is the workflow that creates the initial annotation data records
 * This is WpTerms -> WpTermTaxonomy
 * Later, after the post is created, the WpTermTaxonomy gets associated to the postId in the WpTermRelations table
 * @param {Array<Object>} taxTermsList
 */
ExpAssay.load.workflows.createAnnotationData = function (workflowData, plateData) {
    return new Promise(function (resolve, reject) {
        ExpAssay.load.prepareAnnotationData(workflowData, plateData)
            .then(function (taxTermsList) {
            return app.models.WpTerms.load.createTerms(taxTermsList);
        })
            .then(function (results) {
            return app.models.WpTermTaxonomy.load.createTaxTerms(results);
        })
            .then(function (results) {
            plateData.annotationData = new wellData_1.annotationData({ taxTerms: results });
            resolve(plateData);
        })
            .catch(function (error) {
            app.winston.info(error);
            reject(new Error(error));
        });
    });
};
/**
 * The taxTerms declarations get really clunky
 * Instead of making a million calls to WpTerms.createTerms
 * Instead first get all unique taxTerms - then make slightly less than 1 million calls
 * @param workflowData
 * @param {PlateCollection} plateData
 */
ExpAssay.load.prepareAnnotationData = function (workflowData, plateData) {
    return new Promise(function (resolve) {
        plateData.wellDataList.map(function (wellData) {
            var wellTerms = app.models.WpTerms.load
                .genWellTaxTerms(workflowData, plateData.expPlate, wellData);
            wellTerms.map(function (taxTerm) {
                // @ts-ignore
                wellData.annotationData.taxTerms.push(taxTerm);
            });
            wellData.annotationData.taxTerms = _.uniqWith(wellData.annotationData.taxTerms, _.isEqual);
        });
        resolve(plateData);
    });
};
/**
 * ExpAssay.load.workflows.imageConversionPipeline.all
 * This is a wrapper around the actual imageConversion pipeline, in order to keep that function isolated
 * We may at some point need to know what gets returned from the request to the image processing service, but we need the experimental data
 * to carry on with the workflow
 * @param workflowData
 * @param {PlateCollection} plateData
 */
ExpAssay.load.workflows.imageConversionPipeline.all = function (workflowData, plateData) {
    return new Promise(function (resolve, reject) {
        ExpAssay.load.workflows.imageConversionPipeline[workflowData.instrumentLookUp](workflowData, plateData)
            .then(function () {
            resolve(plateData);
        })
            .catch(function (error) {
            app.winston.info(error);
            reject(new Error(error));
        });
    });
};
ExpAssay.load.workflows.imageConversionPipeline.nyMicroscope = function (workflowData, plateData) {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};
/**
 * This workflow converts the image from the arrayscan properiary format to tiff, bmp, png, and jpeg
 * Jpegs are for wordpress/web interfaces, pngs and bmps are for machine learning / stats models
 * This is a separate service that gets called out, that sits on a different machine
 * The service has to be run by a more privileged user in order to have write access to the mounted filesystem
 * Which we don't give to 'this' user
 * @param workflowData
 * @param {PlateCollection} plateData
 */
ExpAssay.load.workflows.imageConversionPipeline.arrayScan = function (workflowData, plateData) {
    return new Promise(function (resolve, reject) {
        app.winston.info('Converting arrayscan images!');
        //@ts-ignore
        Promise.map(plateData.wellDataList, function (wellData) {
            var images = ExpAssay.helpers.genImageFileNames(plateData.expPlate, wellData.stockLibraryData.well);
            return ExpAssay.helpers.genConvertImageCommands(images)
                .then(function (commands) {
                var imageJob = {
                    title: "convertImage-" + plateData.expPlate.instrumentPlateId + "-" + wellData.expAssay.assayCodeName,
                    commands: commands,
                    plateId: plateData.expPlate.instrumentPlateId,
                };
                if (true) {
                    // if (!fs.existsSync(`${images.baseImage}-autolevel.png`) || true) {
                    //This is being refactored to a separate service using airflow. see the chemgen-next-convert-images dir for more details
                    return;
                    //@ts-ignore
                    // return axios.post(uri, imageJob)
                    //   .then((response) => {
                    //     app.winston.info('Successfully submitted convert image command');
                    //     // app.winston.info(JSON.stringify(response.data));
                    //     return {
                    //       baseImage: images.baseImage,
                    //       script: imageJob.title,
                    //       convert: 1
                    //     };
                    //   })
                    //   .catch((error) => {
                    //     app.winston.info('Error converting images');
                    //     // app.winston.error(error);
                    //     return {
                    //       baseImage: images.baseImage,
                    //       script: imageJob.title,
                    //       convert: 0
                    //     };
                    //   });
                }
                else {
                    // @ts-ignore
                    return {
                        baseImage: images.baseImage,
                        script: imageJob.title,
                        convert: 0
                    };
                }
            });
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ExpAssay.js.map