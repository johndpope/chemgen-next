import app = require('../../server/server.js');
import Promise = require('bluebird');
import {isEqual, isNull, has, uniq} from 'lodash';
import {ExpScreenUploadWorkflowResultSet} from "../types/sdk";
import {ExpPlateResultSet, RnaiLibraryResultSet, RnaiLibraryStockResultSet} from "../types/sdk/models";
import {ExpSetSearch, ExpSetSearchResults} from "../types/custom/ExpSetTypes";
import {ReagentDataCriteria} from "../types/custom/search";
// import assert = require('assert');

if (!isEqual(process.env.NODE_ENV, 'dev')) {
  process.exit(0);
}

function addWorkflowGetReagents() {
  return new Promise((resolve, reject) => {
    // let search = new ExpSetSearch({});
    let search = new ReagentDataCriteria();
    app.models.ExpScreenUploadWorkflow
      .findOne({where: {and: [{name: /RNA/}]}})
      .then((expWorkflow: ExpScreenUploadWorkflowResultSet) => {
        expWorkflow = JSON.parse(JSON.stringify(expWorkflow));
        return app.models.ExpPlate
          .find({where: {expWorkflowId: expWorkflow.id, fields: {plateId: true}}})
          .then((expPlateResults: ExpPlateResultSet[]) => {
            return app.models.RnaiLibraryStock
              .find({
                where: {
                  plateId: {
                    inq: expPlateResults.map((expPlateResult) => {
                      return expPlateResult.plateId;
                    })
                  }
                },
                fields: {
                  rnaiId: true,
                  libraryId: true,
                }
              })
          })
          .then((rnaiLibraryStockResults: RnaiLibraryStockResultSet[]) => {
            rnaiLibraryStockResults = rnaiLibraryStockResults.filter((rnaiLibraryStockResult) => {
              return !isNull(rnaiLibraryStockResult.rnaiId);
            });
            return app.models.RnaiLibrary
              .find({
                where: {
                  or: rnaiLibraryStockResults.map((rnaiLibraryStockResult) => {
                    return {
                      and: [
                        {
                          rnaiId: rnaiLibraryStockResult.rnaiId,
                          libraryId: rnaiLibraryStockResult.libraryId
                        }
                      ]
                    }
                  }),
                }
              });
          })
          .then((rnaiLibraryResults: RnaiLibraryResultSet[]) => {
            search.rnaiList = rnaiLibraryResults.map((rnaiLibraryResult) => {
              return rnaiLibraryResult.geneName;
            });
            // search.expWorkflowSearch = [expWorkflow.id];
            return search;
          })
          .catch((error) => {
            return new Error(error);
          })
      })
      .then(() => {
        resolve(search);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

describe('ExpSetSearchByExpWorkflow.test.ts', function () {
  before(function (done) {
    app.models.ExpScreenUploadWorkflow
      .findOne({where: {and: [{name: /RNA/}]}})
      .then((expWorkflow: ExpScreenUploadWorkflowResultSet) => {
        expWorkflow = JSON.parse(JSON.stringify(expWorkflow));
        return app.models.ExpScreenUploadWorkflow.load.workflows.doWork(expWorkflow)
      })
      .then(() => {
        done();
      })
      .catch((error) => {
        done(new Error(error));
      });

  });

  it('Should return correct query for RnaiList', function (done) {
    addWorkflowGetReagents()
      .then((search) => {
        return app.models.ExpSet.extract.getExpWorkflowsByRNAiReagentData(search)
      })
      .then((expWorkflowIds: Array<string>) => {
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });

  it('Should return correct expGroupIds', function (done) {
    addWorkflowGetReagents()
      .then((search) => {
        return app.models.ExpSet.extract.getExpSetsByRNAiReagentData(search)
      })
      .then((expWorkflowIds: Array<string>) => {
        console.log(expWorkflowIds);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });
});
