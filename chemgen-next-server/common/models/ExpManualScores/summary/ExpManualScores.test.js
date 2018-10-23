"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var app = require("../../../../server/server");
var lodash_1 = require("lodash");
if (!lodash_1.isEqual(process.env.NODE_ENV, 'dev')) {
    process.exit(0);
}
describe('Summary ExpManualScores', function () {
    it('should return the manualScoresAdvancedQuery for a single expWorkflow', function () {
        var query = app.models.ExpManualScores.extract.buildNativeQueryDistinctTreatmentIds({ id: 'ABCDEF' });
        var sqlString = query.toString();
        assert.ok(query);
    });
    it('should return score status', function (done) {
        app.models.ExpPlate
            .findOne()
            .then(function (expPlate) {
            return app.models.ExpManualScores.extract.workflows.getScoresStatsPerScreen({ expWorkflowSearch: expPlate.expWorkflowId });
        })
            .then(function (results) {
            assert.ok(results);
            assert.ok(results.length);
            assert.ok(lodash_1.get(results[0], 'allExpSets'));
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
});
//# sourceMappingURL=ExpManualScores.test.js.map