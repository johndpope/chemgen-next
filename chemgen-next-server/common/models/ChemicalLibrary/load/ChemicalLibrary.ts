import app  = require('../../../../server/server.js');

import {
  ExpPlateResultSet, ExpScreenUploadWorkflowResultSet,
  RnaiWormbaseXrefsResultSet
} from "../../../types/sdk/models";
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');

import {PlateCollection, WellCollection} from "../../../types/custom/wellData";

const ChemicalLibrary = app.models['ChemicalLibrary'] as (typeof WorkflowModel);

ChemicalLibrary.load.workflows.processExpPlates = function (workflowData: any, expPlates: ExpPlateResultSet[]) {
  app.winston.info(`ChemicalLibrary.load. Processing plates ${workflowData.name}`);
  return new Promise(function (resolve, reject) {
    Promise.map(expPlates, function (plateInfo) {
      return ChemicalLibrary.load.workflows.processExpPlate(workflowData, plateInfo);
    })
      .then(function (results) {
        resolve(results);
      })
      .catch(function (error) {
        app.winston.warn(error);
        reject(new Error(error));
      });
  });
};

ChemicalLibrary.load.workflows.processExpPlate = function (workflowData: any, expPlate: ExpPlateResultSet) {
  app.winston.info(`ChemicalLibrary.load. Processing plate ${workflowData.name} ${expPlate.barcode}`);
  return new Promise(function (resolve, reject) {
    ChemicalLibrary['extract'][workflowData.screenStage].getParentLibrary(workflowData, expPlate.barcode)
      .then(function (libraryResults) {
        return ChemicalLibrary.extract.parseLibraryResults(workflowData, expPlate, libraryResults);
      })
      .then(function (libraryDataList) {
        let plateData: PlateCollection = new PlateCollection({expPlate: expPlate, wellDataList: libraryDataList});
        resolve(plateData);
      })
      .catch(function (error) {
        app.winston.warn(error);
        reject(new Error(error));
      });
  });
};

ChemicalLibrary.load.createWorkflowSearchObj = function (workflowData: any) {
  return ChemicalLibrary.load[workflowData.screenStage].createWorkflowSearchObj(workflowData);
};

//TODO These are the same for all screens - only expSetSearch terms are different
ChemicalLibrary.load.primary.createWorkflowSearchObj = function (workflowData: any) {
  return {
    and: [
      {
        name: workflowData.name,
      },
      {
        libraryId: workflowData.libraryId,
      },
      {
        screenId: workflowData.screenId,
      },
      {
        instrumentId: workflowData.instrumentId,
      },
      {
        screenStage: workflowData.screenStage,
      },
      {
        stockPrepDate: workflowData.stockPrepDate,
      },
      // {
      //   'replicates.1.0': workflowData.replicates[1][0],
      // },
      //   "expSetSearch": {
      // "library": {
      //   "chemical": {
      //     "chembridge": {

      // {
      //   'expSetSearch.library.chemical.chembridge.plate': workflowData.expSetSearch.library.chemical.chembridge.plate,
      // },
    ]
  };
};

//TODO This is the same as the RNAi
ChemicalLibrary.load.secondary.createWorkflowSearchObj = function (workflowData: any) {
  return {
    and: [
      {
        libraryId: workflowData.libraryId,
      },
      {
        screenId: workflowData.screenId,
      },
      {
        instrumentId: workflowData.instrumentId,
      },
      {
        screenStage: workflowData.screenStage,
      },
      {
        stockPrepDate: workflowData.stockPrepDate,
      },
      {
        'platePlan.platePlanName': workflowData.platePlan.platePlanName,
      },
      // {
      //   'replicates.1.0': workflowData.replicates[1][0],
      // }
    ]
  };
};

ChemicalLibrary.load.primary.genTaxTerms = function (workflowData) {
  return [
    {taxonomy: 'chemical_plate', taxTerm: workflowData.search.library.chemical.chembridge.plate},
  ]
};

ChemicalLibrary.load.secondary.genTaxTerms = function (workflowData) {
  return []
};

ChemicalLibrary.load.genLibraryViewData = function (workflowData: ExpScreenUploadWorkflowResultSet, wellData: WellCollection) {
  return {};
};
