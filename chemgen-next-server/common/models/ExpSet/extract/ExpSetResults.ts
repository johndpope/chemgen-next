import app = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');
import {memoize, get, groupBy, shuffle, isEqual, find, round, filter, has, isObject} from 'lodash';
import {interpolateYlOrBr} from 'd3';
import {ExpSetSearch, ExpSetSearchResults} from "../../../types/custom/ExpSetTypes/index";
import {
  ExpAssay2reagentResultSet,
  ExpAssayResultSet, ExpDesignResultSet, ExpManualScoresResultSet,
  ExpScreenResultSet,
  ExpScreenUploadWorkflowResultSet,
  ModelPredictedCountsResultSet,
} from "../../../types/sdk/models/index";
import decamelize = require('decamelize');

import config = require('config');

const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

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
ExpSet.extract.genImageMeta = function (data: ExpSetSearchResults, expAssay2reagents: ExpAssay2reagentResultSet[]) {
  const getTreatmentGroupIdFromDesign = memoize(function (expGroupId: number) {
    return data.expSets.filter((expSet: Array<ExpDesignResultSet>) => {
      return expSet.filter((expDesignRow: ExpDesignResultSet) => {
        return isEqual(expGroupId, expDesignRow.treatmentGroupId) || isEqual(expGroupId, expDesignRow.controlGroupId);
      })[0];
    })[0];
  });

  return expAssay2reagents.map((expAssay2reagent: ExpAssay2reagentResultSet) => {
    const expAssay: ExpAssayResultSet = find(data.expAssays, {assayId: expAssay2reagent.assayId});
    let treatmentGroupId: number = expAssay2reagent.treatmentGroupId;

    if (!expAssay) {
      throw(new Error(`could not find expAssay for assayId: ${expAssay2reagent.assayId} ExpAssay2reagent: ${JSON.stringify(expAssay2reagent)}`));
    } else {
      let imageData: any = {
        expGroupId: expAssay2reagent.expGroupId,
        expWorkflowId: expAssay2reagent.expWorkflowId,
        screenId: expAssay2reagent.screenId,
        treatmentGroupId: treatmentGroupId,
        plateId: expAssay2reagent.plateId,
        well: expAssay.assayWell,
      };
      let imageSrcData = ExpSet.extract[`buildImageObj${config.get('site')}`](expAssay);
      Object.keys(imageSrcData).map((key) => {
        imageData[key] = imageSrcData[key];
      });
      return imageData;
    }

  });
};

/**
 * Insert counts data into the image meta - including d3 color schemas for phenotypes
 * @param data
 */
ExpSet.extract.insertCountsDataImageMeta = function (data: ExpSetSearchResults) {
  Object.keys(data.expGroupTypeAlbums).map((expGroupType) => {
    data.expGroupTypeAlbums[expGroupType].map((imageMeta: any) => {
      const wellCounts: ModelPredictedCountsResultSet = find(data.modelPredictedCounts, {assayId: imageMeta.assayId});
      const countsData = ExpSet.extract.insertCountsData(wellCounts);
      Object.keys(countsData).map((key) => {
        imageMeta[key] = countsData[key];
      });
    })
  });
  return data;
};

/**
 * Insert the manual scores into the imageMeta - useful for marking which wells have been scored
 * Even if by other methods
 * @param data
 * @param imageMeta
 */
ExpSet.extract.insertExpManualScoresImageMeta = function (data: ExpSetSearchResults) {
  data.expGroupTypeAlbums.treatReagent.map((imageMeta: any) => {
    const expManualScoreByAssayId = find(data.expManualScores, {assayId: imageMeta.assayId});
    const expManualScoreByTreatmentIds: ExpManualScoresResultSet[] = filter(data.expManualScores, {treatmentGroupId: imageMeta.treatmentGroupId});
    imageMeta.manualScoreByAssay = get(expManualScoreByAssayId, 'manualscoreId') || null;
    imageMeta.manualScoreByTreatment = expManualScoreByTreatmentIds || null;
  });
  return data;
};

ExpSet.extract.mapExpGroupTypes = function (expGroupType: string) {
  if (isEqual(expGroupType, 'treat_rnai')) {
    return 'treatReagent';
  } else if (isEqual(expGroupType, 'treat_chemical') || isEqual(expGroupType, 'treat_compound')) {
    return 'treatReagent';
  } else if (isEqual(expGroupType, 'ctrl_rnai')) {
    return 'ctrlReagent';
  } else if (isEqual(expGroupType, 'ctrl_compound') || isEqual(expGroupType, 'ctrl_chemical')) {
    return 'ctrlReagent';
  } else if (isEqual(expGroupType, 'ctrl_strain')) {
    return 'ctrlStrain';
  } else if (isEqual(expGroupType, 'ctrl_null')) {
    return 'ctrlNull';
  } else {
    return expGroupType;
  }
};

ExpSet.extract.insertCountsData = function (wellCounts: ModelPredictedCountsResultSet) {
  if (isObject(wellCounts)) {
    return {
      percEmbLeth: Number(round(wellCounts.percEmbLeth, 3)),
      broodSize: Number(round(wellCounts.broodSize, 3)),
      percSter: Number(round(wellCounts.percSter, 3)),
      // Just counts
      wormCount: Number(wellCounts.wormCount),
      larvaCount: Number(wellCounts.larvaCount),
      eggCount: Number(wellCounts.eggCount),
      // Colorize all the things!
      percEmbLethColor: String(interpolateYlOrBr(wellCounts.percEmbLeth / 100)),
      percSteColor: String(interpolateYlOrBr(wellCounts.percSter / 100)),
      percSurvivalColor: String(interpolateYlOrBr(wellCounts.broodSize / 100)),
    };
  } else {
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
ExpSet.extract.getExpSet = function (data: ExpSetSearchResults, expAssay: ExpAssayResultSet) {

  const findExpWorkflow = memoize(function (expWorkflowId: string) {
    return find(data.expWorkflows, (expWorkflow: ExpScreenUploadWorkflowResultSet) => {
      return isEqual(String(expWorkflowId), String(expWorkflow.id));
    });
  });

  const findExpScreen = memoize(function (screenId: number) {
    return find(data.expScreens, (screen: ExpScreenResultSet) => {
      return isEqual(screenId, screen.screenId);
    });
  });

  const getTreatmentGroupIdFromDesign = memoize(function (expGroupId: number) {
    return data.expSets.filter((expSet: Array<ExpDesignResultSet>) => {
      return expSet.filter((expDesignRow: ExpDesignResultSet) => {
        return isEqual(expGroupId, expDesignRow.treatmentGroupId) || isEqual(expGroupId, expDesignRow.controlGroupId);
      })[0];
    })[0];
  });

  const findModelPredictedCounts = memoize(function (treatmentGroupId: number) {
    return data.modelPredictedCounts.filter((counts: ModelPredictedCountsResultSet) => {
      return isEqual(counts.treatmentGroupId, treatmentGroupId);
    });
  });

  const findExpSets = memoize(function (treatmentGroupId) {
    return data.expSets.filter((expSet: Array<ExpDesignResultSet>) => {
      return isEqual(treatmentGroupId, expSet[0].treatmentGroupId);
    })[0];
  });

  const findAlbums = memoize(function (treatmentGroupId) {
    return data.albums.filter((album: any) => {
      return isEqual(treatmentGroupId, album.treatmentGroupId);
    })[0];
  });


  const o: any = {};

  o.treatmentGroupId = null;
  o.expWorkflow = findExpWorkflow(expAssay.expWorkflowId);
  o.expScreen = findExpScreen(expAssay.screenId);

  // There is no treatmentGroupId for ctrl_strain and ctrl_null in the counts,
  // because those can belong to many treatments - have to get it from the expDesigns
  if (!o.treatmentGroupId) {
    const expSet = getTreatmentGroupIdFromDesign(expAssay.expGroupId);
    if (expSet) {
      o.treatmentGroupId = expSet[0].treatmentGroupId;
    }
  }

  if (o.treatmentGroupId) {
    // o.modelPredictedCounts = findModelPredictedCounts(o.treatmentGroupId);
    // o.expSets = findExpSets(o.treatmentGroupId);
    o.albums = findAlbums(o.treatmentGroupId);
  } else {
    // This should never happen....
    // o.modelPredictedCounts = [];
    // o.expSets = [];
    o.albums = {};
  }
  ['ctrlNullImages', 'ctrlStrainImages'].map((ctrlKey) => {
    if (get(o.albums, ctrlKey)) {
      o.albums[ctrlKey] = shuffle(o.albums[ctrlKey]).slice(0, 4);
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
ExpSet.extract.cleanUp = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  ['compoundsXRefs', 'expAssays', 'expAssay2reagents', 'modelPredictedCounts',
    'expPlates', 'expScreens', 'expWorkflows', 'expManualScores', 'expSets',
    'albums', 'expGroupTypeAlbums'].map((key) => {
    if (!search[key]) {
      delete data[key];
    }
  });
  return data;
};

