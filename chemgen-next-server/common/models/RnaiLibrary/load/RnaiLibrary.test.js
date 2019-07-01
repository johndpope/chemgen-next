"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var app = require("../../../../server/server");
var Promise = require("bluebird");
var ExpPlate = app.models['ExpPlate'];
var Plate = app.models['Plate'];
var RnaiLibrary = app.models['RnaiLibrary'];
var shared = require("../../../../test/shared");
shared.makeMemoryDb();
var rnaiLibraries = require('../../../../test/data/rnai_library.json');
//@ts-ignore
var expPlates = [
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
var workflowData = {
    wells: ['A01', 'A02', 'A03', 'A12'],
    screenId: 1,
    instrumentId: 1,
    libraryId: 1,
    screenStage: 'primary',
    search: { rnaiLibrary: { plate: '3', chrom: 'I' } }
};
// {"stocktitle":"I-3--A1"}
describe('RnaiLibrary.load', function () {
    before(function (done) {
        //@ts-ignore
        Promise.map(rnaiLibraries, function (row) {
            return RnaiLibrary.create(row);
        })
            .then(function () {
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    //TODO Update this test
    it('Should expSetSearch for things in the RnaiWormbaseXrefs', function (done) {
        app.models.RnaiWormbaseXrefs.extract.genTaxTerms({
            where: {
                wbGeneSequenceId: 'None',
            },
        })
            .then(function (results) {
            // assert.deepEqual(contactSheetResults, {xrefs: [], taxTerms: []});
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('RnaiLibrary.load.workflows.processExpPlates', function (done) {
        RnaiLibrary.load.workflows.processExpPlates(workflowData, expPlates)
            .then(function (results) {
            //Results is a list plates, libraryDataList is the list of Library Entries
            assert.equal(results[0].wellDataList.length, 4);
            assert.equal(results[0].wellDataList[0].stockLibraryData.well, 'A01');
            assert.equal(results[0].wellDataList[0].stockLibraryData.rnaiId, 701);
            assert.equal(results[0].wellDataList[3].annotationData.geneName, 'empty');
            assert.equal(results[0].wellDataList[3].annotationData.taxTerm, 'empty');
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    after(function (done) {
        //@ts-ignore
        Promise.map(Object.keys(app.models), function (modelName) {
            return app.models[modelName].deleteAll();
        })
            .then(function () {
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
});
//# sourceMappingURL=RnaiLibrary.test.js.map