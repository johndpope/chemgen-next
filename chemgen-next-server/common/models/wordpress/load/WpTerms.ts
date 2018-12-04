import app = require('../../../../server/server.js');
import config = require('config');

import {WorkflowModel} from "../../index";
import {annotationData, WellCollection} from "../../../types/custom/wellData";
import {ExpPlateResultSet, ExpScreenUploadWorkflowResultSet, WpTermsResultSet} from "../../../types/sdk/models";
import {PlateCollection, ScreenCollection} from "../../../types/custom/wellData";
import {WpTermTaxonomyResultSet} from "../../../types/sdk/models";
import slug = require('slug');
import Promise = require('bluebird');
import * as _ from "lodash";
import {uniq, shuffle, find, isEqual} from 'lodash';

const WpTerms = app.models['WpTerms'] as (typeof WorkflowModel);

/**
 * This is the workflow that creates the initial annotation data records
 * This is WpTerms -> WpTermTaxonomy
 * Later, after the post is created, the WpTermTaxonomy gets associated to the postId in the WpTermRelations table
 * @param workflowData
 * @param {PlateCollection} screenData
 */
WpTerms.load.workflows.createAnnotationData = function (workflowData, screenData: ScreenCollection) {
  app.winston.info(`Begin: WpTerms.load.workflows.createAnnotationData ${workflowData.name}`);
  return new Promise((resolve, reject) => {
    WpTerms.load.prepareAnnotationData(workflowData, screenData)
      .then((taxTermsList: WpTermsResultSet) => {
        return app.models.WpTerms.load.createTerms(taxTermsList)
      })
      .then((results: WpTermsResultSet[]) => {
        return app.models.WpTermTaxonomy.load.createTaxTerms(results);
      })
      .then((results: WpTermTaxonomyResultSet[]) => {
        app.winston.info(JSON.stringify(results[0]));
        screenData.annotationData = new annotationData({taxTerms: results});
        app.winston.info(`Complete: WpTerms.load.workflows.createAnnotationData ${workflowData.name}`);
        // screenData.annotationData.taxTerms = contactSheetResults;
        resolve(screenData);
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
};

/**
 * The taxTerms declarations get really clunky
 * Instead of making a million calls to WpTerms.createTerms
 * Instead first get all unique taxTerms - then make slightly less than 1 million calls
 * @param workflowData
 * @param {ScreenCollection} screenData
 */
WpTerms.load.prepareAnnotationData = function (workflowData, screenData: ScreenCollection) {
  return new Promise((resolve) => {
    let taxTermsTotal = [];
    screenData.plateDataList.map((plateData: PlateCollection) => {
      plateData.wellDataList.map(function (wellData: WellCollection) {
        //@ts-ignore
        wellData.annotationData.taxTerms.map(function (taxTerm) {
          taxTermsTotal.push(taxTerm);
        });
      });
    });

    resolve(_.uniqWith(taxTermsTotal, _.isEqual));
  });
};

WpTerms.load.getBiosampleName = function (workflowData: ExpScreenUploadWorkflowResultSet, expPlate: ExpPlateResultSet) {

  let treatGroup = find(Object.keys(workflowData.experimentGroups), (group) => {
    return find(workflowData.experimentGroups[group].plates, (plate: ExpPlateResultSet) => {
      return isEqual(Number(plate.instrumentPlateId), Number(expPlate.instrumentPlateId));
    });
  });
  let biosampleId = workflowData.experimentGroups[treatGroup].biosampleId;
  let biosampleType = find(Object.keys(workflowData.biosamples), (biosampleTypeKey) => {
    return isEqual(workflowData.biosamples[biosampleTypeKey].id, biosampleId);
  });
  let biosampleName = workflowData.biosamples[biosampleType].name;
  return biosampleName;
};

/**
 * Get the tax terms for a plate
 * TODO memoize this
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @returns {({taxonomy: string; taxTerm: Date} | {taxonomy: string; taxTerm: string} | {taxonomy: string; taxTerm: string | string} | {taxonomy: string; taxTerm} | {taxonomy: string; taxTerm: number})[]}
 */
WpTerms.load.genPlateTaxTerms = function (workflowData: ExpScreenUploadWorkflowResultSet, expPlate: ExpPlateResultSet) {
  //TODO Add biosample_name
  //This is only applicable if the whole plate has the same biosample, but so far we haven't seen any other cases
  // let biosampleName = '';

  return [{
    taxonomy: 'image_date',
    taxTerm: expPlate.plateImageDate,
  }, {
    taxonomy: 'screen_type',
    taxTerm: workflowData.screenType,
  }, {
    taxonomy: 'screen_stage',
    taxTerm: workflowData.screenStage,
  }, {
    taxonomy: 'exp_upload_name',
    taxTerm: workflowData.name,
  }, {
    taxonomy: 'screen_name',
    taxTerm: workflowData.screenName,
  }, {
    taxonomy: 'exp_plate_id',
    taxTerm: expPlate.plateId,
  }, {
    taxonomy: 'instrument_plate_id',
    taxTerm: expPlate.instrumentPlateId,
  }, {
    taxonomy: 'barcode',
    taxTerm: expPlate.barcode,
  }, {
    taxonomy: 'temperature',
    taxTerm: workflowData.temperature,
  }, {
    taxonomy: 'biosample_name',
    taxTerm: WpTerms.load.getBiosampleName(workflowData, expPlate)
  }
  ];
};

/**
 * DEPRECATED - We no longer use WP for experiment interfaces!!
 * For primary add in library_plate, library_chrom, library_quadrant
 * WP Uses what it calls a taxonomy to relate posts to stuff
 * A Post has 1 or more taxonomies, and a taxonomy has 1 or more terms
 * The envira-tags are a taxonomy for creating custom galleries based on tags
 * SI - ScreenId
 * BS - BiosampleID
 * PI - ExpPlateId
 * TT - TaxTerm (gene, chemical, etc - this comes from the library and may not be the preferred name of the team)
 * W - Well
 * B - Barcode
 * A1 - ExpAssayId
 * R - Row
 * C - Column
 * EGI - ExpGroupId (This gets added later, after the expgroup is created)
 * EGT - ExpGroupType (This gets added later, after the expgroup is created)
 * @param workflowData
 * @param {ExpPlateResultSet} expPlate
 * @param {WellCollection} wellData
 * @returns {({taxonomy: string; taxTerm: Date} | {taxonomy: string; taxTerm: string} | {taxonomy: string; taxTerm: number} | {taxonomy: string; taxTerm})[]}
 */
WpTerms.load.genWellTaxTerms = function (workflowData: any, expPlate: ExpPlateResultSet, wellData: WellCollection) {
  //TODO Upto barcode are for the plate
  return [];
  // let regexp = /([a-zA-Z]+)(\d+)/g;
  // let groups = regexp.exec(wellData.stockLibraryData.well);
  // let plateTaxTerms = null;
  // try {
  //   plateTaxTerms = WpTerms.load.genPlateTaxTerms(workflowData, expPlate);
  // } catch (error) {
  //   return [];
  //   // throw new Error('Unable to generatore plateTaxTerms!');
  // }
  // let wellTaxTerms = [
  //   {
  //     taxonomy: 'envira-tag',
  //     taxTerm: slug([
  //       `AI-${wellData.expAssay.assayId}`,
  //     ].join('')),
  //   },
  //   {
  //     taxonomy: 'envira-tag',
  //     taxTerm: slug([
  //       `SI-${workflowData.screenId}`,
  //       `_PI-${expPlate.plateId}`,
  //       `_R-${groups[1]}`,
  //     ].join('')),
  //   },
  // ];
  //
  // return _.concat(plateTaxTerms, wellTaxTerms);
};

/**
 * Deprecated - No Longer using WP for experiment interfaces - instead using Angular2+
 * @param taxTermsList
 */
WpTerms.load.createTerms = function (taxTermsList: Array<Object>) {
  return new Promise((resolve, reject) => {
    // Shuffle added to ensure we aren't creating multiples of the same thing
    // We do this so that if we process multiple screens at a time
    //We don't end up with duplicated wpTerms
    resolve([]);
    // @ts-ignore
    // Promise.map(shuffle(taxTermsList), (createTermObj) => {
    //   //This is just a sanity check, but probably shouldn't ever happen
    //   if (_.isEmpty(createTermObj) || !_.get(createTermObj, 'taxTerm')) {
    //     return {};
    //   }
    //   else {
    //     let createObj = {
    //       name: createTermObj.taxTerm,
    //       slug: slug(createTermObj.taxTerm) || '',
    //       termGroup: 0,
    //     };
    //
    //     return WpTerms
    //       .findOrCreate({where: app.etlWorkflow.helpers.findOrCreateObj(createObj)}, createObj)
    //       .then((results) => {
    //         //This is technically not ok, but will save some processing time later
    //         results[0].taxonomy = createTermObj.taxonomy;
    //         results[0].term = createTermObj.taxTerm;
    //         results[0].taxTerm = createTermObj.taxTerm;
    //         return results[0];
    //       });
    //   }
    // })
    //   .then((results: WpTermsResultSet[]) => {
    //     let nonEmptyResults = results.filter((row) => {
    //       return !_.isEmpty(row);
    //     });
    //     resolve(nonEmptyResults);
    //   })
    //   .catch((error) => {
    //     reject(new Error(error));
    //   });
  });
};


WpTerms.load.genTermTable = function (taxTermList) {
  var table = '';
  taxTermList = _.uniqWith(taxTermList, _.isEqual);
  taxTermList.map(function (createTerm) {
    if (createTerm.taxonomy.match('envira')) {
      return;
    } else if (!createTerm.taxTerm) {
      return;
    }
    table = table + '<tr>';
    let taxTerm = createTerm.taxTerm;
    // let taxTermUrl = '<a href="' + config.get('wpUrl') + '/' + createTerm.taxonomy + '/' +
    //   slug(taxTerm) + '/">' + taxTerm + '</a>';
    let taxTermUrl = taxTerm;

    table = table + '<td><b>';
    table = table + createTerm.taxonomy.replace(/\b\w/g, function (l) {
      return l.toUpperCase();
    });
    table = table + '</b></td><td>' + taxTermUrl + '</td>';
    table = table + '</tr>';
  });
  return table;
};
