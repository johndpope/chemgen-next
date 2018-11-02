"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExpSetTypes_1 = require("../../../../types/custom/ExpSetTypes");
var app = require("../../../../../server/server");
var lodash_1 = require("lodash");
if (!lodash_1.isEqual(process.env.NODE_ENV, 'dev')) {
    process.exit(0);
}
describe('ExpSetScoringExtractByManualScores.test.ts', function () {
    it('should run the min/max/avg query for emb leth', function (done) {
        var search = new ExpSetTypes_1.ExpSetSearch({
            // screenSearch: [9],
            expGroupTypeAlbums: false,
            expManualScores: false,
            expPlates: false,
            expSets: false
        });
        app.models.ExpSet.extract.workflows.orderByExpManualScoresEmbLeth({})
            .then(function (results) {
            // results = app.models.ExpSet.extract.workflows.createDataFrame(results);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('should run the min/max/avg query for enh ste', function (done) {
        var search = new ExpSetTypes_1.ExpSetSearch({
            // screenSearch: [9],
            expGroupTypeAlbums: false,
            expManualScores: false,
            expPlates: false,
            expSets: false
        });
        app.models.ExpSet.extract.workflows.orderByExpManualScoresEnhSte({})
            .then(function (results) {
            // results = app.models.ExpSet.extract.workflows.createDataFrame(results);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
});
//# sourceMappingURL=ExpSetScoringExtractByManualScores.test.js.map