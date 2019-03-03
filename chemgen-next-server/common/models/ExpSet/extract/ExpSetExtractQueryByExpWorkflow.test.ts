import {ExpSetSearchResults, ExpSetSearch} from "../../../types/custom/ExpSetTypes";
import assert = require('assert');
import {isEqual, includes, isArray, has, uniq} from 'lodash';
import app = require('../../../../server/server');
import {error} from "util";

if (!isEqual(process.env.NODE_ENV, 'dev')) {
  process.exit(0);
}

describe('ExpSetExtractQueryByExpWorkflow.test', function () {
  it('Should return the expSet for the Amelia test', function (done) {
    let search = new ExpSetSearch({});
    search.expWorkflowSearch = ['5c739017c39f511b61c30b64'];
    app.models.ExpSet.extract.workflows.getExpSets(search)
      .then((data: ExpSetSearchResults) => {
        done();
      })
      .catch((error) => {
        done(new Error(error));
      });
  });
});
