import app  = require('../../../../server/server.js');
import * as _ from "lodash";
import {RnaiLibraryResultSet} from "../../../types/sdk/models";
import {WorkflowModel} from "../../index";

//TODO This file needs a lot of cleaning up - lots of leftover logic from the last codebase

const RnaiLibrary = app.models['RnaiLibrary'] as (typeof WorkflowModel);

RnaiLibrary.helpers.buildControlBarcode = function(barcode) {
  let controlBarCode = 'L4440';
  if (barcode.match('E')) {
    controlBarCode = controlBarCode + 'E';
  }
  if (barcode.match('D')) {
    controlBarCode = controlBarCode + '_D';
  }
  if (barcode.match('M')) {
    controlBarCode = controlBarCode + '_M';
  }

  return controlBarCode;
};

RnaiLibrary.helpers.primary.buildControlTag = function(workflowData: any , contentObj : any) {
  let cnTag = `_C-Restrictive_WS-${workflowData.controlStrain}`;
  let cmTag = `_C-Restrictive_WS-${workflowData.mutantStrain}`;

  /**
   Restrictive N2
   **/
  contentObj.enviraCRNTag = [
    'SN-', contentObj.screenNameSlug,
    cnTag,
    '_TT-', 'none',
  ].join('');

  contentObj.enviraCRMTag = [
    'SN-', contentObj.screenNameSlug,
    cmTag,
    '_TT-', 'none',
  ].join('');

  cnTag = `_C-Restrictive_WS-${workflowData.controlStrain}`;
  cmTag = `_C-Restrictive_WS-${workflowData.mutantStrain}`;

  contentObj.enviraCPNTag = [
    'SN-', contentObj.screenNameSlug,
    cnTag,
    '_TT-', 'none',
  ].join('');

  contentObj.enviraCPMTag = [
    'SN-', contentObj.screenNameSlug,
    cmTag,
    '_TT-', 'none',
  ].join('');

  return contentObj;
};

RnaiLibrary.helpers.secondary.buildControlTag = function(workflowData, contentObj) {
  let cnTag = `_C-Restrictive_WS-${workflowData.controlStrain}`;
  let cmTag = `_C-Restrictive_WS-${workflowData.mutantStrain}`;

  let strain = RnaiLibrary.helpers.wormStrain(contentObj.barcode);

  if (strain === 'M' && contentObj.condition === 'Restrictive') {
    cmTag = `_PI-${contentObj.plateId}_C-Restrictive_WS-${workflowData.mutantStrain}`;
  } else if (strain === 'N2' && contentObj.condition === 'Restrictive') {
    cnTag = `_PI-${contentObj.plateId}_C-Restrictive_WS-${workflowData.controlStrain}`;
  }

  //Restrictive N2
  contentObj.enviraCRNTag = [
    'SN-', contentObj.screenNameSlug,
    cnTag,
    '_TT-', 'none',
  ].join('');

  //Restrictive M
  contentObj.enviraCRMTag = [
    'SN-', contentObj.screenNameSlug,
    cmTag,
    '_TT-', 'none',
  ].join('');

  cnTag = `_C-Permissive_WS-${workflowData.controlStrain}`;
  cmTag = `_C-Permissive_WS-${workflowData.mutantStrain}`;

  if (strain === 'M' && contentObj.condition === 'Permissive') {
    cmTag = `_PI-${contentObj.plateId}_C-Permissive_WS-${workflowData.mutantStrain}`;
  } else if (strain === 'N2' && contentObj.condition === 'Permissive') {
    cnTag = `_PI-${contentObj.plateId}_C-Permissive_WS-${workflowData.controlStrain}`;
  }

  //Permissive N2
  contentObj.enviraCPNTag = [
    'SN-', contentObj.screenNameSlug,
    cnTag,
    '_TT-', 'none',
  ].join('');

  //Permissive M
  contentObj.enviraCPMTag = [
    'SN-', contentObj.screenNameSlug,
    cmTag,
    '_TT-', 'none',
  ].join('');

  return contentObj;
};

RnaiLibrary.helpers.buildControlTags = function(workflowData, contentObj) {
  contentObj.enviraCTCol = 6;
  contentObj = RnaiLibrary.helpers
    [workflowData.screenStage]['buildControlTags'](workflowData, contentObj);

  return contentObj;
};

RnaiLibrary.helpers.barcodeIsControl = function(barcode) {
  let control = 'not_control';
  if (barcode.match('L4440')) {
    control = 'control';
  }
  return control;
};

/**
 * Get the quadrant
 * If it matches Q{1-4} - translate to {A,B}{1,2}
 * @param  {string} barcode [Barcode from the arrayscan - RNAiI.1A1_E_D]
 * @return {string}         [{A,B},{1,2}]
 */
RnaiLibrary.helpers.getQuad = function(barcode) {
  let codes = {
    Q1: 'A1',
    Q2: 'A2',
    Q3: 'B1',
    Q4: 'B2',
  };

  let plateQuadrant : string | number;

  Object.keys(codes).map((key: string) => {
    if (barcode.match(key)) {
      plateQuadrant = codes[key];
    } else if (barcode.match(codes[key])) {
      plateQuadrant = codes[key];
    }
  });

  if (plateQuadrant) {
    return plateQuadrant;
  } else {
    return 0;
  }
};

RnaiLibrary.helpers.getPlate = function(plateNo) {
  if (!plateNo) {
    return '';
  }
  plateNo = `${plateNo}`;

  let matches = ['A1', 'B1', 'A2', 'B2', 'Q1', 'Q2', 'Q3', 'Q4'];
  let plate : string  = '';
  matches.map(function(match) {
    plate = plateNo.replace(match, '');
  });
  return plate;
};

/**
 * Get condition from barcode
 * If it has an 'E' its Permissive
 * If it has an S its Restrictive
 * If it doesn't have either its still restrictive
 * @param  {string} barcode [Barcode from the arrayscan - RNAiI.1A1_E_D]
 * @return {string}         [Enhancer/Suppressor] <- NO MORE
 */
RnaiLibrary.helpers.parseCond = function(barcode :string) {
  if (barcode.match('E')) {
    return 'Permissive';
  } else if (barcode.match('S')) {
    return 'Restrictive';
  } else {
    return 'Restrictive';
  }
};

/**
 * If a barcode has a D its replicate plate
 * TODO This should return true/false instead of 0/1
 * @param {string} barcode
 * @returns {number}
 */
RnaiLibrary.helpers.isDuplicate = function(barcode : string) {
  if (barcode.match('D')) {
    return 1;
  } else {
    return 0;
  }
};

/**
 *
 * TODO This will just be TEMP at a later date
 * @param {string} barcode
 * @param workflowData
 * @returns {any}
 */
RnaiLibrary.helpers.getTemp = function(barcode : string, workflowData : any) {
  let cond = RnaiLibrary.helpers.parseCond(barcode);
  if (cond === 'Permissive') {
    return workflowData.EnhancerTemp || 0;
  } else if (cond === 'Restrictive') {
    return workflowData.SuppressorTemp || 0;
  } else {
    return 0;
  }
};

/**
 Worm Specific
 TODO Should Return Control/Mutant
 TODO Deprecate this - it will be in the initial workflowData from the screen upload interface
 **/
RnaiLibrary.helpers.wormStrain = function(barcode) {
  var strain = 'N2';
  if (barcode.match('M') || barcode.match('mel')) {
    strain = 'M';
  }
  return strain;
};

RnaiLibrary.search = function(where : object) {
  RnaiLibrary.find({
    where: where
  })
    .then(function(results : RnaiLibraryResultSet[]) {
      return Promise.resolve(results);
    })
    .catch(function(error) {
      return Promise.reject(new Error(error));
    });
};

/**
 * Check and see if we have a library result of if this is an empty well
 * TODO This should be combined with checkLibraryResult
 * @param {string} barcode
 * @param {RnaiLibraryResultSet[]} libraryResults
 * @param {string} well
 * @returns {{}}
 */
RnaiLibrary.helpers.genLibraryResult = function(barcode : string, libraryResults : RnaiLibraryResultSet[], well : string) {
  let thisWellLibraryResults = [];
  // @ts-ignore
  let libraryResult : RnaiLibraryResultSet = new RnaiLibraryResultSet({});
  if (barcode.match('L4440')) {
    // @ts-ignore
    libraryResult.name = 'L4440';
    libraryResult.geneName = 'L4440';
  } else {
    // I'm sure I use the quadrant for something  - just not sure what
    // var quadrant = RnaiLibrary.helpers.getQuad(barcode);
    // TODO
    //Return all the wells - change to filter
    libraryResult = _.find(libraryResults, {
      well: well,
    });
    libraryResult = RnaiLibrary.helpers.checkLibraryResult(libraryResult);
  }

  return libraryResult;
};

/**
 * Library is undef for empty wells
 * Add in a name and a taxTerm
 * @param  {Object | Undefined} libraryResult [Library record for that well]
 * @return {Object}               [Create a library result if it doesn't exist]
 */
RnaiLibrary.helpers.checkLibraryResult = function(libraryResult : RnaiLibraryResultSet) {
  if (!libraryResult) {
    libraryResult = {};
    libraryResult.name = 'empty';
    libraryResult.geneName = 'empty';
  }
  return libraryResult;
};

