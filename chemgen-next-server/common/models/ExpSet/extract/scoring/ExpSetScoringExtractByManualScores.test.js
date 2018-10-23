"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server");
var lodash_1 = require("lodash");
if (!lodash_1.isEqual(process.env.NODE_ENV, 'dev')) {
    process.exit(0);
}
describe('ExpSetScoringExtractByManualScores.test.ts', function () {
    it('should run the min/max/avg query', function (done) {
        app.models.ExpSet.extract.workflows.orderByExpManualScoresPrimaryPhenotypes({})
            .then(function (results) {
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
});
//# sourceMappingURL=ExpSetScoringExtractByManualScores.test.js.map