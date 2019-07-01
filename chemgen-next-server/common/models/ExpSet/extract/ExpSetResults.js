"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var lodash_1 = require("lodash");
var d3_1 = require("d3");
var config = require("config");
var ExpSet = app.models.ExpSet;
/**
 * Once we have the expSetData - which should be cached anyways
 * Do some transformations on it, mostly various groupings of image data
 */
/**
 * Normally the expAssay2reagents is the same as the data.expAssay2reagents, except when we are grouping by plate
 * TODO Update per site
 * @param data
 * @param expAssay2reagents
 */
ExpSet.extract.genImageMeta = function (data, expAssay2reagents) {
    var getTreatmentGroupIdFromDesign = lodash_1.memoize(function (expGroupId) {
        return data.expSets.filter(function (expSet) {
            return expSet.filter(function (expDesignRow) {
                return lodash_1.isEqual(expGroupId, expDesignRow.treatmentGroupId) || lodash_1.isEqual(expGroupId, expDesignRow.controlGroupId);
            })[0];
        })[0];
    });
    return expAssay2reagents.map(function (expAssay2reagent) {
        var expAssay = lodash_1.find(data.expAssays, { assayId: expAssay2reagent.assayId });
        var treatmentGroupId = expAssay2reagent.treatmentGroupId;
        if (!expAssay) {
            throw (new Error("could not find expAssay for assayId: " + expAssay2reagent.assayId + " ExpAssay2reagent: " + JSON.stringify(expAssay2reagent)));
        }
        else {
            var imageData_1 = {
                expGroupId: expAssay2reagent.expGroupId,
                expWorkflowId: expAssay2reagent.expWorkflowId,
                screenId: expAssay2reagent.screenId,
                treatmentGroupId: treatmentGroupId,
                plateId: expAssay2reagent.plateId,
                well: expAssay.assayWell,
            };
            var imageSrcData_1 = ExpSet.extract["buildImageObj" + config.get('site')](expAssay);
            Object.keys(imageSrcData_1).map(function (key) {
                imageData_1[key] = imageSrcData_1[key];
            });
            return imageData_1;
        }
    });
};
/**
 * Insert counts data into the image meta - including d3 color schemas for phenotypes
 * @param data
 */
ExpSet.extract.insertCountsDataImageMeta = function (data) {
    Object.keys(data.expGroupTypeAlbums).map(function (expGroupType) {
        data.expGroupTypeAlbums[expGroupType].map(function (imageMeta) {
            var wellCounts = lodash_1.find(data.modelPredictedCounts, { assayId: imageMeta.assayId });
            var countsData = ExpSet.extract.insertCountsData(wellCounts);
            Object.keys(countsData).map(function (key) {
                imageMeta[key] = countsData[key];
            });
        });
    });
    return data;
};
/**
 * Insert the manual scores into the imageMeta - useful for marking which wells have been scored
 * Even if by other methods
 * @param data
 * @param imageMeta
 */
ExpSet.extract.insertExpManualScoresImageMeta = function (data) {
    if (lodash_1.get(data, ['expGroupTypeAlbums', 'treatReagent'])) {
        data.expGroupTypeAlbums.treatReagent.map(function (imageMeta) {
            var expManualScoreByAssayId = lodash_1.find(data.expManualScores, { assayId: imageMeta.assayId });
            var expManualScoreByTreatmentIds = lodash_1.filter(data.expManualScores, { treatmentGroupId: imageMeta.treatmentGroupId });
            imageMeta.manualScoreByAssay = lodash_1.get(expManualScoreByAssayId, 'manualscoreId') || null;
            imageMeta.manualScoreByTreatment = expManualScoreByTreatmentIds || null;
        });
        return data;
    }
    else {
        return data;
    }
};
ExpSet.extract.mapExpGroupTypes = function (expGroupType) {
    if (lodash_1.isEqual(expGroupType, 'treat_rnai')) {
        return 'treatReagent';
    }
    else if (lodash_1.isEqual(expGroupType, 'treat_chemical') || lodash_1.isEqual(expGroupType, 'treat_compound')) {
        return 'treatReagent';
    }
    else if (lodash_1.isEqual(expGroupType, 'ctrl_rnai')) {
        return 'ctrlReagent';
    }
    else if (lodash_1.isEqual(expGroupType, 'ctrl_compound') || lodash_1.isEqual(expGroupType, 'ctrl_chemical')) {
        return 'ctrlReagent';
    }
    else if (lodash_1.isEqual(expGroupType, 'ctrl_strain')) {
        return 'ctrlStrain';
    }
    else if (lodash_1.isEqual(expGroupType, 'ctrl_null')) {
        return 'ctrlNull';
    }
    else {
        return expGroupType;
    }
};
ExpSet.extract.insertCountsData = function (wellCounts) {
    if (lodash_1.isObject(wellCounts)) {
        return {
            percEmbLeth: Number(lodash_1.round(wellCounts.percEmbLeth, 3)),
            broodSize: Number(lodash_1.round(wellCounts.broodSize, 3)),
            percSter: Number(lodash_1.round(wellCounts.percSter, 3)),
            // Just counts
            wormCount: Number(wellCounts.wormCount),
            larvaCount: Number(wellCounts.larvaCount),
            eggCount: Number(wellCounts.eggCount),
            // Colorize all the things!
            percEmbLethColor: String(d3_1.interpolateYlOrBr(wellCounts.percEmbLeth / 100)),
            percSteColor: String(d3_1.interpolateYlOrBr(wellCounts.percSter / 100)),
            percSurvivalColor: String(d3_1.interpolateYlOrBr(wellCounts.broodSize / 100)),
        };
    }
    else {
        return {
            percEmbLeth: null,
            broodSize: null,
            percSter: null,
            // Just counts
            wormCount: null,
            larvaCount: null,
            eggCount: null,
            // Colorize all the things!
            percEmbLethColor: null,
            percSteColor: null,
            percSurvivalColor: null,
        };
    }
};
// TODO Decide where to put this
// TODO Create common module for server/client
ExpSet.extract.getExpSet = function (data, expAssay) {
    var findExpWorkflow = lodash_1.memoize(function (expWorkflowId) {
        return lodash_1.find(data.expWorkflows, function (expWorkflow) {
            return lodash_1.isEqual(String(expWorkflowId), String(expWorkflow.id));
        });
    });
    var findExpScreen = lodash_1.memoize(function (screenId) {
        return lodash_1.find(data.expScreens, function (screen) {
            return lodash_1.isEqual(screenId, screen.screenId);
        });
    });
    var getTreatmentGroupIdFromDesign = lodash_1.memoize(function (expGroupId) {
        return data.expSets.filter(function (expSet) {
            return expSet.filter(function (expDesignRow) {
                return lodash_1.isEqual(expGroupId, expDesignRow.treatmentGroupId) || lodash_1.isEqual(expGroupId, expDesignRow.controlGroupId);
            })[0];
        })[0];
    });
    var findModelPredictedCounts = lodash_1.memoize(function (treatmentGroupId) {
        return data.modelPredictedCounts.filter(function (counts) {
            return lodash_1.isEqual(counts.treatmentGroupId, treatmentGroupId);
        });
    });
    var findExpSets = lodash_1.memoize(function (treatmentGroupId) {
        return data.expSets.filter(function (expSet) {
            return lodash_1.isEqual(treatmentGroupId, expSet[0].treatmentGroupId);
        })[0];
    });
    var findAlbums = lodash_1.memoize(function (treatmentGroupId) {
        return data.albums.filter(function (album) {
            return lodash_1.isEqual(treatmentGroupId, album.treatmentGroupId);
        })[0];
    });
    var o = {};
    o.treatmentGroupId = null;
    o.expWorkflow = findExpWorkflow(expAssay.expWorkflowId);
    o.expScreen = findExpScreen(expAssay.screenId);
    // There is no treatmentGroupId for ctrl_strain and ctrl_null in the counts,
    // because those can belong to many treatments - have to get it from the expDesigns
    if (!o.treatmentGroupId) {
        var expSet = getTreatmentGroupIdFromDesign(expAssay.expGroupId);
        if (expSet) {
            o.treatmentGroupId = expSet[0].treatmentGroupId;
        }
    }
    if (o.treatmentGroupId) {
        // o.modelPredictedCounts = findModelPredictedCounts(o.treatmentGroupId);
        // o.expSets = findExpSets(o.treatmentGroupId);
        o.albums = findAlbums(o.treatmentGroupId);
    }
    else {
        // This should never happen....
        // o.modelPredictedCounts = [];
        // o.expSets = [];
        o.albums = {};
    }
    ['ctrlNullImages', 'ctrlStrainImages'].map(function (ctrlKey) {
        if (lodash_1.get(o.albums, ctrlKey)) {
            o.albums[ctrlKey] = lodash_1.shuffle(o.albums[ctrlKey]).slice(0, 4);
        }
    });
    return o;
};
/**
 * The result set is really big if all returned
 * Add in some variables for cleaning up
 * This would actually be a good case for graphql....
 * @param data
 * @param search
 */
ExpSet.extract.cleanUp = function (data, search) {
    ['compoundsXRefs', 'expAssays', 'expAssay2reagents', 'modelPredictedCounts',
        'expPlates', 'expScreens', 'expWorkflows', 'expManualScores', 'expSets',
        'albums', 'expGroupTypeAlbums'].map(function (key) {
        if (!search[key]) {
            delete data[key];
        }
    });
    return data;
};
//# sourceMappingURL=ExpSetResults.js.map