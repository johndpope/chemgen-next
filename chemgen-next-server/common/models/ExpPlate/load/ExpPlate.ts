import app = require('../../../../server/server.js');
import {ExpPlateResultSet, PlateResultSet} from "../../../types/sdk/models";
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');
import path = require('path');
import {ExpScreenUploadWorkflowResultSet} from "../../../types/sdk/models";
import {ScreenCollection} from "../../../types/custom/wellData";
import Mustache = require('mustache');
// import deepclone = require('deepclone');
import * as _ from "lodash";
import {get, isEqual, compact} from 'lodash';

//@ts-ignore
const readFile = Promise.promisify(require('fs').readFile);

const ExpPlate = app.models.ExpPlate as (typeof WorkflowModel);

//TODO Consider moving these to worm/cell specific logic

/**
 *
 * @param workflowData
 * @param {PlateResultSet[]} instrumentPlates
 */
ExpPlate.load.workflows.processInstrumentPlates = function (workflowData, instrumentPlates: PlateResultSet[]) {
  return new Promise(function (resolve, reject) {
    // @ts-ignore
    Promise.map(instrumentPlates, function (plate) {
      return ExpPlate.load.createExperimentPlate(workflowData, plate);
    }, {
      concurrency: 1,
    })
      .then(function (results: ExpPlateResultSet[]) {
        resolve(results);
      })
      .catch(function (error) {
        app.winston.warn(error.stack);
        reject(new Error(error));
      });
  });
};

/**
 * Create the experiment plate
 * Carry around an object that has instrumentPlate data and ExpPlate data
 * @param workflowData
 * @param {PlateResultSet} instrumentPlate
 */
ExpPlate.load.createExperimentPlate = function (workflowData, instrumentPlate: PlateResultSet) {

  return new Promise(function (resolve, reject) {
    let createObjList: PlateResultSet[];
    try {
      createObjList = ExpPlate.load.transformInstrumentPlate(workflowData, instrumentPlate);
    } catch (error) {
      reject(new Error(`Unable to parse instrument plate ${workflowData.screenName} ${workflowData.name} ${instrumentPlate.csPlateid}`));
    }

    ExpPlate
      .findOrCreate({
        where: app.etlWorkflow.helpers.findOrCreateObj(createObjList[1]),
      }, createObjList[0])
      .then(function (result) {
        resolve(result[0]);
      })
      .catch(function (error) {
        app.winston.warn('ERROR ' + JSON.stringify(error));
        reject(new Error(error));
      });
  });
};

/**
 * Given the experimentalData (workflowData) transform the instrument plate to a expPlate
 * @param workflowData
 * @param instrumentPlate
 * @returns [ExpPlateResultSet, ExpPlateResultSet]
 */
ExpPlate.load.transformInstrumentPlate = function (workflowData: ExpScreenUploadWorkflowResultSet, instrumentPlate: PlateResultSet) {

  let csPlateid = instrumentPlate.csPlateid;
  let imagepath = instrumentPlate.imagepath;
  let barcode = instrumentPlate.name;
  let creationdate = instrumentPlate.creationdate;

  let imagePath = imagepath;

  let plateImagePath =`${imagePath}`;
  //TODO Add in site specific parsers for the plate Path
  if (! get(workflowData, 'site') || (get(workflowData, 'site') && isEqual(workflowData.site, 'AD'))){
    let imagePath = imagepath.split('\\');
    imagePath = _.compact(imagePath);
    if (!imagePath[2] || _.isNull(imagePath[2])) {
      app.winston.error('Image Path is Null!!');
      throw new Error('Plate Path is invalid');
    }
    plateImagePath = `${imagePath[2]}/${csPlateid}`;
  } else if (get(workflowData, 'site') && isEqual(workflowData.site, 'NY')){
    plateImagePath =`${imagePath}`;
  }


  /*
  For some reason if I searched on the whole plate object it was always returning not found
  So I just expSetSearch for a subset of the plate object
   */
  let lookUpPlateObj: ExpPlateResultSet = new ExpPlateResultSet({
    //Screen Info
    screenId: workflowData.screenId,
    expWorkflowId: workflowData.id,
    //Instrument Plate Things
    instrumentId: workflowData.instrumentId,
    instrumentPlateId: csPlateid,
  });
  let plateObj: ExpPlateResultSet = new ExpPlateResultSet({
    //Screen Info
    screenId: workflowData.screenId,
    screenStage: workflowData.screenStage,
    screenType: workflowData.screenType,
    expWorkflowId: workflowData.id,
    //Instrument Plate Things
    instrumentId: workflowData.instrumentId,
    instrumentPlateId: csPlateid,
    instrumentPlateImagePath: imagepath,
    //Plate Data
    plateImagePath: plateImagePath,
    barcode: barcode,
    plateAssayDate: workflowData.stockPrepDate,
    plateImageDate: creationdate,
    plateTemperature: workflowData.temperature,
  });
  return [plateObj, lookUpPlateObj];
};


/**
 * WIP
 * TODO MAKE THIS A REAL FUNCTION
 * ExpPlate.load.workflows.createExpPlateInterface
 * Create the ExpPlate interface in WP
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {ScreenCollection} screenData
 * @param plateData
 */
ExpPlate.load.workflows.createExpPlateInterface = function (workflowData: ExpScreenUploadWorkflowResultSet, screenData: ScreenCollection, plateData) {
  const templateName = `${workflowData.librarycode}-${workflowData.screenStage}.mustache`;
  let templateFile = path.join(path.dirname(__filename), `../../../../common/views/exp/assay/${workflowData.biosampleType}/${workflowData.libraryModel}/expPlate-${templateName}`);

  return new Promise((resolve, reject) => {
    readFile(templateFile, 'utf8')
      .then((contents) => {
        let assayView = Mustache.render(contents, {
          expPlate: plateData.expPlate,
          workflowData: workflowData,
        });
        resolve(assayView);
      })
      .catch(function (error) {
        reject(new Error(error));
      });
  })
};

