"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExpSetTypes_1 = require("../../../../types/custom/ExpSetTypes");
var assert = require("assert");
var app = require("../../../../../server/server");
var lodash_1 = require("lodash");
if (!lodash_1.isEqual(process.env.NODE_ENV, 'dev')) {
    process.exit(0);
}
describe('ExpSetExtractByPlate', function () {
    it('Should run the function and get expGroups by same plate', function (done) {
        this.timeout(10000);
        app.models.ExpScreenUploadWorkflow.findOne({ where: { name: 'CHEM Primary 140 2015-02-26' } })
            .then(function (workflowData) {
            return app.models.ExpScreenUploadWorkflow.load.workflows.doWork(workflowData)
                .then(function () {
                var search = new ExpSetTypes_1.ExpSetSearch({ expWorkflowSearch: [String(workflowData.id)] });
                return app.models.ExpSet.extract.workflows.getUnscoredExpSetsByPlate(search);
            });
        })
            .then(function (data) {
            var ctrlNullPlateIds = lodash_1.uniq(data.expGroupTypeAlbums.ctrlNull.map(function (ctrlNullAlbum) {
                return ctrlNullAlbum.plateId;
            }));
            var ctrlStrainPlateIds = lodash_1.uniq(data.expGroupTypeAlbums.ctrlStrain.map(function (ctrlStrainAlbum) {
                return ctrlStrainAlbum.plateId;
            }));
            var treatReagentPlateIds = lodash_1.uniq(data.expGroupTypeAlbums.treatReagent.map(function (treatReagentAlbum) {
                return treatReagentAlbum.plateId;
            }));
            var ctrlReagentPlateIds = lodash_1.uniq(data.expGroupTypeAlbums.ctrlReagent.map(function (ctrlReagentAlbum) {
                return ctrlReagentAlbum.plateId;
            }));
            assert.ok(data);
            assert.deepEqual(ctrlNullPlateIds, ctrlReagentPlateIds);
            assert.deepEqual(ctrlStrainPlateIds, treatReagentPlateIds);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('Should run the function and not get expGroups by same plate', function (done) {
        //TODO This is ridiculous
        this.timeout(30000);
        app.models.ExpScreenUploadWorkflow.findOne({ where: { and: [{ name: 'AHR2 2016-04-19 mel-28 N2 Chr III Plate 3 Q Q4' }, { screenStage: 'primary' }] } })
            .then(function (workflowData) {
            return app.models.ExpScreenUploadWorkflow.load.workflows.doWork(workflowData)
                .then(function () {
                var search = new ExpSetTypes_1.ExpSetSearch({ expWorkflowSearch: [String(workflowData.id)] });
                return app.models.ExpSet.extract.workflows.getUnscoredExpSetsByPlate(search);
            });
        })
            .then(function (data) {
            var ctrlNullPlateIds = lodash_1.uniq(data.expGroupTypeAlbums.ctrlNull.map(function (ctrlNullAlbum) {
                return ctrlNullAlbum.plateId;
            }));
            var ctrlStrainPlateIds = lodash_1.uniq(data.expGroupTypeAlbums.ctrlStrain.map(function (ctrlStrainAlbum) {
                return ctrlStrainAlbum.plateId;
            }));
            var treatReagentPlateIds = lodash_1.uniq(data.expGroupTypeAlbums.treatReagent.map(function (treatReagentAlbum) {
                return treatReagentAlbum.plateId;
            }));
            var ctrlReagentPlateIds = lodash_1.uniq(data.expGroupTypeAlbums.ctrlReagent.map(function (ctrlReagentAlbum) {
                return ctrlReagentAlbum.plateId;
            }));
            assert.ok(data);
            assert.ok(lodash_1.has(data.expGroupTypeAlbums, 'ctrlStrain'));
            assert.ok(lodash_1.has(data.expGroupTypeAlbums, 'ctrlNull'));
            assert.notDeepEqual(ctrlNullPlateIds, ctrlReagentPlateIds);
            assert.notDeepEqual(ctrlStrainPlateIds, treatReagentPlateIds);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
});
//# sourceMappingURL=ExpSetScoringExtractByPlate.test.js.map