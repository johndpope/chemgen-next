import {ExpSetSearch, ExpSetSearchResults} from "../../../../types/custom/ExpSetTypes";
import assert = require('assert');
import app = require('../../../../../server/server');
import Promise = require('bluebird');
import {isEqual, has, uniq} from 'lodash';
import {ExpScreenUploadWorkflowResultSet} from "../../../../types/sdk";

if (!isEqual(process.env.NODE_ENV, 'dev')) {
  process.exit(0);
}

describe('ExpSetScoringExtractByManualScores.test.ts', function () {
  it('should run the min/max/avg query for emb leth', function (done) {
    let search = new ExpSetSearch({
      // screenSearch: [9],
      expGroupTypeAlbums: false,
      expManualScores: false,
      expPlates: false,
      expSets: false
    });
    app.models.ExpSet.extract.workflows.orderByExpManualScoresEmbLeth({})
      .then((results) => {
        // results = app.models.ExpSet.extract.workflows.createDataFrame(results);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });
  it('should run the min/max/avg query for enh ste', function (done) {
    let search = new ExpSetSearch({
      // screenSearch: [9],
      expGroupTypeAlbums: false,
      expManualScores: false,
      expPlates: false,
      expSets: false
    });
    app.models.ExpSet.extract.workflows.orderByExpManualScoresEnhSte({})
      .then((results) => {
        // results = app.models.ExpSet.extract.workflows.createDataFrame(results);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });
});