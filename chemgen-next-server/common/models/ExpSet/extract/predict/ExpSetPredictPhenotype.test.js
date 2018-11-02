"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server");
var lodash_1 = require("lodash");
if (!lodash_1.isEqual(process.env.NODE_ENV, 'dev')) {
    process.exit(0);
}
describe('ExpSetPredictPhenotype.test.ts', function () {
    it('Should create the dataframe for predicting counts', function (done) {
        app.models.ModelPredictedCounts
            .findOne({
            where: {
                and: [
                    { screenId: 1 }, { assayImagePath: { like: '%L4440%' } }
                ]
            }
        })
            .then(function (modelPredictedCounts) {
            return app.models.ExpSet.extract.workflows.predictEmbLeth({ expWorkflowSearch: modelPredictedCounts.expWorkflowId });
        })
            .then(function (results) {
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
});
//# sourceMappingURL=ExpSetPredictPhenotype.test.js.map