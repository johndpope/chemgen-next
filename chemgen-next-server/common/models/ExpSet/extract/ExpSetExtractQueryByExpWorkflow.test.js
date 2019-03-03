"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExpSetTypes_1 = require("../../../types/custom/ExpSetTypes");
var lodash_1 = require("lodash");
var app = require("../../../../server/server");
if (!lodash_1.isEqual(process.env.NODE_ENV, 'dev')) {
    process.exit(0);
}
describe('ExpSetExtractQueryByExpWorkflow.test', function () {
    it('Should return the expSet for the Amelia test', function (done) {
        var search = new ExpSetTypes_1.ExpSetSearch({});
        search.expWorkflowSearch = ['5c739017c39f511b61c30b64'];
        app.models.ExpSet.extract.workflows.getExpSets(search)
            .then(function (data) {
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
});
//# sourceMappingURL=ExpSetExtractQueryByExpWorkflow.test.js.map