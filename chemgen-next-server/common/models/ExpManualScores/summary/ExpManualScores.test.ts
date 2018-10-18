import assert = require('assert');
import app = require('../../../../server/server');
import Promise = require('bluebird');
import {isEqual, get, has, uniq} from 'lodash';
import {ExpPlateResultSet, ExpScreenUploadWorkflowResultSet} from "../../../types/sdk";

if (!isEqual(process.env.NODE_ENV, 'dev')) {
  process.exit(0);
}

describe('Summary ExpManualScores', function () {
  it('should return the query for a single expWorkflow', function () {
    let query = app.models.ExpManualScores.extract.buildNativeQueryDistinctTreatmentIds({id: 'ABCDEF'});
    let sqlString = query.toString();
    assert.ok(query);
  });
  it('should return score status', function (done) {
    app.models.ExpPlate
      .findOne()
      .then((expPlate: ExpPlateResultSet) => {
        return app.models.ExpManualScores.extract.workflows.getScoresStatsPerScreen({expWorkflowSearch: expPlate.expWorkflowId})
      })
      .then((results) => {
        assert.ok(results);
        assert.ok(results.length);
        assert.ok(get(results[0], 'allExpSets'));
        done();
      })
      .catch((error) => {
        done(new Error(error));
      });
  });
});
