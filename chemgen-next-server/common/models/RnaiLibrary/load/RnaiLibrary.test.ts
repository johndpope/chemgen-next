import {WorkflowModel} from "../../index";
import {PlateResultSet, ExpPlateResultSet} from "../../../types/sdk/models";

import assert = require('assert');

import loopback = require('loopback');
import app = require('../../../../server/server');
import Promise = require('bluebird');

const ExpPlate = app.models['ExpPlate'] as (typeof WorkflowModel);
const Plate = app.models['Plate'] as (typeof WorkflowModel);
const RnaiLibrary = app.models['RnaiLibrary'] as (typeof WorkflowModel);

import shared = require('../../../../test/shared');
shared.makeMemoryDb();

const rnaiLibraries = require('../../../../test/data/rnai_library.json');

//@ts-ignore
const expPlates: ExpPlateResultSet[] = [
  {
    "plateId": 1,
    "screenId": 1,
    "plateImagePath": "2017Dec18/9281",
    "barcode": "RNAiI.3A1E",
    "instrumentId": 1,
    "screenStage": 1,
    "instrumentPlateId": 9281,
    //@ts-ignore
    "plateStartTime": "2017-12-18T15:56:26.000Z",
    "plateCreationDate": "2017-12-18T00:00:00.000Z"
  }
];

const workflowData = {
  wells: ['A01', 'A02', 'A03', 'A12'],
  screenId: 1,
  instrumentId: 1,
  libraryId: 1,
  screenStage: 'primary',
  search: {rnaiLibrary: {plate: '3', chrom: 'I'}}
};

// {"stocktitle":"I-3--A1"}

describe('RnaiLibrary.load', function () {
  before(function (done) {
    //@ts-ignore
    Promise.map(rnaiLibraries, function (row) {
      return RnaiLibrary.create(row)
    })
      .then(() => {
        done();
      })
      .catch((error) => {
        done(new Error(error))
      })
  });

  //TODO Update this test
  it('Should expSetSearch for things in the RnaiWormbaseXrefs', function (done) {
    app.models.RnaiWormbaseXrefs.extract.genTaxTerms({
      where: {
        wbGeneSequenceId: 'None',
      },
    })
      .then((results) => {
        // assert.deepEqual(contactSheetResults, {xrefs: [], taxTerms: []});
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })

  });

  it('RnaiLibrary.load.workflows.processExpPlates', function (done) {
    RnaiLibrary.load.workflows.processExpPlates(workflowData, expPlates)
      .then((results) => {
        //Results is a list plates, libraryDataList is the list of Library Entries
        assert.equal(results[0].wellDataList.length,4);
        assert.equal(results[0].wellDataList[0].stockLibraryData.well, 'A01');
        assert.equal(results[0].wellDataList[0].stockLibraryData.rnaiId, 701);
        assert.equal(results[0].wellDataList[3].annotationData.geneName, 'empty');
        assert.equal(results[0].wellDataList[3].annotationData.taxTerm, 'empty');
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });
  after(function (done) {
    //@ts-ignore
    Promise.map(Object.keys(app.models), (modelName) => {
      return app.models[modelName].deleteAll();
    })
      .then(() => {
        done()
      })
      .catch((error) => {
        done(new Error(error));
      });
  });
});

