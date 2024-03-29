"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var app = require("../../../../server/server");
var Promise = require("bluebird");
var ExpPlate = app.models.ExpPlate;
var Plate = app.models.Plate;
var shared = require("../../../../test/shared");
shared.makeMemoryDb();
//@ts-ignore
var instrumentPlates = [
    {
        'csPlateid': 9281,
        'id': 'cx5-pc171218150005',
        'name': 'RNAiI.3A1E',
        'description': null,
        'statusid': 70,
        'logstat': 10,
        'creator': 'cell',
        'creationdate': '2017-12-18T00:00:00.000Z',
        'creationtime': '1899-12-30T15:56:26.000Z',
        'protocolid': 742,
        'detaildatapath': 'UNCShare',
        'imagepath': '\\\\aduae120-wap\\CS_DATA_SHARE\\2017Dec18\\cx5-pc171218150005\\',
        'platestarttime': '2017-12-18T15:56:26.000Z',
        'platefinishtime': '2017-12-18T15:58:22.000Z',
        'protocoldata': null,
        'wellcount': 96,
        'wfieldcount': 96,
        'fimagecount': 96,
        'cellcount': 0,
        'scanid': 'RNAiI.3A1E',
        'zsystemlistid': 'cx5-pc',
        'logtype': 100,
        'platestackid': null,
        'savemodeid': null,
        'instrumentid': null,
        'runid': null,
        'platebarcode': 'RNAII.3A1E',
        'stackid': null,
        'intervalcount': 1,
        'formfactordata': '8;12;C;96 Well CX5',
        'paId': null,
        'paVersion': null,
        'parentId': null,
        'auxSource': null,
        'owner': null,
        'siloId': 14,
        'guid': '673DD534-9128-4E29-91EE-61F707A4F879'
    }
];
describe('ExpPlate.load', function () {
    before(function (done) {
        app.dataSources.db.automigrate('ExpPlate')
            .then(function () {
            //@ts-ignore
            return Promise.map(instrumentPlates, function (row) {
                return Plate.findOrCreate({ where: app.etlWorkflow.helpers.findOrCreateObj(row) }, row);
            });
        })
            .then(function () {
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('ExpPlate.load.workflows.processInstrumentPlates', function (done) {
        ExpPlate.load.workflows.processInstrumentPlates({
            screenId: 1,
            instrumentId: 1,
            screenStage: 'primary'
        }, instrumentPlates)
            .then(function (results) {
            var t = JSON.stringify(results);
            results = JSON.parse(t);
            assert.deepEqual(results, [
                {
                    "plateId": 1,
                    "screenId": 1,
                    "plateImageDate": "2017-12-18T00:00:00.000Z",
                    "plateImagePath": "2017Dec18/9281",
                    "barcode": "RNAiI.3A1E",
                    "instrumentId": 1,
                    "instrumentPlateId": 9281,
                    "instrumentPlateImagePath": "\\\\aduae120-wap\\CS_DATA_SHARE\\2017Dec18\\cx5-pc171218150005\\",
                    "screenStage": "primary"
                }
            ]);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    shared.sharedAfter();
});
//# sourceMappingURL=ExpPlate.test.js.map