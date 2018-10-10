import {ExpPlateResultSet, PlateResultSet} from "../../../../../../types/sdk/models";
import app = require('../../../../../../../server/server.js');
import Promise = require('bluebird');
import {PlateCollection, ScreenCollection} from "../../../../../../types/custom/wellData";
import {WorkflowModel} from "../../../../../index";
import jsonfile = require('jsonfile');
import {orderBy, find, filter, isEqual} from 'lodash';

import assert = require('assert');

import * as _ from "lodash";

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);
const instrumentPlates: PlateResultSet[] = require('../../../../../../../test/data/rnai_instrument_plate_data_list.json');
const workflowData: any = require('../../../../../../../test/data/rnai_workflow_data.json');
const screenData: ScreenCollection = require('../../../../../../../test/data/rnai_primary_results_screen_data.json');

import shared = require('../../../../../../../test/shared');

shared.makeMemoryDb();

describe('ExpScreenUploadWorkflow.worms.primary', function () {
  shared.prepareRnai();

  it('ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData - Create the Things', function (done) {
    this.timeout(5000);
    ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData(workflowData, instrumentPlates)
      .then((results: PlateCollection[]) => {
        assert.equal(results.length, 8);
        // contactSheetResults = orderBy(contactSheetResults, 'instrumentPlateId');
        let expPlates: ExpPlateResultSet[] = results.map((result) => {
          return result.expPlate;
        });
        expPlates = orderBy(expPlates, 'instrumentPlateId');
        assert.equal(expPlates[0].barcode, 'L4440E');
        assert.equal(expPlates[0].instrumentPlateId, 9277);
        assert.equal(expPlates[0].plateId, 1);

        assert.equal(results[0].hasOwnProperty('wellDataList'), true);
        assert.equal(results[0].hasOwnProperty('expPlate'), true);
        assert.equal(results[0].wellDataList[0].hasOwnProperty('annotationData'), true);
        assert.equal(results[0].wellDataList[0].hasOwnProperty('expAssay'), true);
        assert.equal(results[0].wellDataList[0].hasOwnProperty('parentLibraryData'), true);
        assert.equal(results[0].wellDataList[0].hasOwnProperty('stockLibraryData'), true);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });

  it('ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExperimentData - Create Relationships between things', function (done) {
    this.timeout(5000);
    //TODO This should not be set - figure out how/why it is set
    delete workflowData.id;
    ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExperimentData(workflowData, instrumentPlates)
      .then((results: ScreenCollection) => {
        assert.equal(results.expDesignList.length, 9);
        assert.equal(results.plateDataList.length, 8);
        let treatmentId = results.expDesignList[0].treatmentGroupId;
        let countTreatment = filter(results.expDesignList, (expDesign) => {
          return isEqual(expDesign.treatmentGroupId, treatmentId)
        }).length;
        assert.equal(countTreatment, 3);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      });
  });

  it('ExpScreenUploadWorkflow.load.workflows.worms.primary.createExpInterfaces', function (done) {
    this.timeout(30000);
    delete workflowData.id;
    ExpScreenUploadWorkflow.load.workflows.worms.createExpInterfaces(workflowData, screenData)
      .then((results) => {
        assert.equal(workflowData.biosamples.ctrlBiosample.name, 'N2');
        assert.equal(workflowData.biosamples.experimentBiosample.name, 'mel-28');
        assert.equal(results.hasOwnProperty('annotationData'), true);
        assert.equal(results.hasOwnProperty('expDesignList'), true);
        assert.equal(results.hasOwnProperty('plateDataList'), true);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      });
  });

  shared.sharedAfter();
});
