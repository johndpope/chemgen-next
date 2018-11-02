import {ExpSetSearch, ExpSetSearchResults} from "../../../../types/custom/ExpSetTypes";
import assert = require('assert');
import app = require('../../../../../server/server');
import Promise = require('bluebird');
import {isEqual, has, uniq} from 'lodash';
import {ExpScreenUploadWorkflowResultSet} from "../../../../types/sdk";
import {ModelPredictedCountsResultSet} from "../../../../types/sdk/models";

if (!isEqual(process.env.NODE_ENV, 'dev')) {
  process.exit(0);
}

describe('ExpSetPredictPhenotype.test.ts', function () {
  it('Should create the dataframe for predicting counts', function (done) {
    app.models.ModelPredictedCounts
      .findOne({
        where: {
          and: [
            {screenId: 1}, {assayImagePath: {like: '%L4440%'}}
          ]
        }
      })
      .then((modelPredictedCounts: ModelPredictedCountsResultSet) => {
        return app.models.ExpSet.extract.workflows.predictEmbLeth({expWorkflowSearch: modelPredictedCounts.expWorkflowId})
      })
      .then((results: any) => {
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })


  });
});
