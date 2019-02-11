import {ExpSetSearch, ExpSetSearchResults} from "../../../../types/custom/ExpSetTypes";
import assert = require('assert');
import app = require('../../../../../server/server');
import Promise = require('bluebird');
import {isEqual, includes, isArray, has, uniq} from 'lodash';
import {ExpScreenUploadWorkflowResultSet} from "../../../../types/sdk";
import * as client from "knex";
import config = require('config');

const knex = config.get('knex');

if (!isEqual(process.env.NODE_ENV, 'dev')) {
  process.exit(0);
}

describe('ExpSetScoringExtract.test.ts', function () {
  it('Should return the manualScoresAdvancedQuery for exp_assays', function () {
    let search = new ExpSetSearch({expWorkflowSearch: [String('ABCDEFG')]});
    let data = new ExpSetSearchResults({});
    let sqlQuery = app.models.ExpSet.extract.buildNativeQuery(data, search, false);
    let sqlString = sqlQuery.toString();
    let matchedSql = "select * from `exp_assay2reagent` where `reagent_type` like 'treat%' and `reagent_id` is not null and `exp_workflow_id` in ('ABCDEFG') and not exists (select 1 from `exp_manual_scores` where exp_assay2reagent.assay_id = exp_manual_scores.assay_id)"
    assert.equal(matchedSql, sqlString);
  });
  it('Should return the manualScoresAdvancedQuery for exp_assay2reagents by exp_workflow_id', function () {
    let search = new ExpSetSearch({expWorkflowSearch: [String('ABCDEFG')]});
    let data = new ExpSetSearchResults({});
    let sqlQuery = app.models.ExpSet.extract.buildNativeQueryExpWorkflowId(data, search, false);
    let sqlString = sqlQuery.toString();
    let matchedSql = "select distinct `exp_workflow_id` from `exp_assay2reagent` where `reagent_type` like 'treat%' and `reagent_id` is not null and `exp_workflow_id` in ('ABCDEFG') and not exists (select 1 from `exp_manual_scores` where exp_assay2reagent.assay_id = exp_manual_scores.assay_id)";
    assert.equal(matchedSql, sqlString);
  });

  it('Should return the manualScoresAdvancedQuery for getting scores with a FIRST_PASS and does no HAS_MANUAL_SCORE', function () {
    // let search = new ExpSetSearch({expWorkflowSearch: [String('ABCDEFG')]});
    let search = new ExpSetSearch({});
    let data = new ExpSetSearchResults({});
    let sqlQuery = app.models.ExpSet.extract.buildNativeQueryByFirstPass(data, search, true);
    let sqlString = sqlQuery.toString();
    assert.ok(sqlString);
  });

  it('Should filter by Scores', function (done) {
    let search = new ExpSetSearch({
      scoresQuery: {
        "or": [
          {
            "and": [
              {
                "manualscoreValue": "2"
              },
              {
                "manualscoreGroup": "M_EMB_LETH"
              }
            ]
          },
          {
            "and": [
              {
                "manualscoreValue": "3"
              },
              {
                "manualscoreGroup": "M_EMB_LETH"
              }
            ]
          }
        ]
      },
      screenSearch: [4],
    });
    //TODO Put some data in here!

    app.models.ExpSet.extract.workflows.filterByScores(search)
      .then((data: ExpSetSearchResults) => {
        let scores = data.expManualScores.filter((expManualScore) => {
          return isEqual(expManualScore.manualscoreValue, 3);
        });
        assert.ok(data);
      })
      .catch((error) => {
        done(new Error(error));
      })

  });

  it('Should filter by Scores Advanced', function (done) {
    let search = new ExpSetSearch({
      scoresQuery: {
        "and": [
          {
            "or": [
              {
                "and": [
                  {
                    "scoreCodeId": "14"
                  },
                  {
                    "manualscoreValue": "3"
                  }
                ]
              }
            ]
          },
          {
            "or": [
              {
                "and": [
                  {
                    "scoreCodeId": "52"
                  },
                  {
                    "manualscoreValue": {
                      "neq": "3"
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    });
    app.models.ExpSet.extract.workflows.filterByScores(search)
      .then((data: ExpSetSearchResults) => {
        assert.ok(data);
      })
      .catch((error) => {
        done(new Error(error));
      });
  });

  it('Should filter by Scores Advanced With Dummy Filter', function (done) {
    let search = new ExpSetSearch({
      scoresQuery: {
        "and": [
          {
            "or": [
              {
                "and": [
                  {
                    "scoreCodeId": "14"
                  },
                  {
                    "manualscoreValue": "3"
                  }
                ]
              }
            ]
          },
          {
            "or": [
              {
                "and": [
                  {
                    "scoreCodeId": "14"
                  },
                  {
                    "manualscoreValue": 3
                  }
                ]
              }
            ]
          }
        ]
      }
    });
    app.models.ExpSet.extract.workflows.filterByScores(search)
      .then((data: ExpSetSearchResults) => {
        assert.ok(data);
      })
      .catch((error) => {
        done(new Error(error));
      });

  });

  it('Should return a list of expWorkflowIds that have not gone through the first pass', function (done) {
    let search = new ExpSetSearch({});
    app.models.ExpScreenUploadWorkflow
      .find({fields: {id: true}})
      .then((expWorkflows: ExpScreenUploadWorkflowResultSet[]) => {
        //First get all the workflows from the exp_plates
        return knex('exp_plate')
          .distinct('exp_workflow_id')
          .groupBy('exp_workflow_id')
          .select()
          .then((expPlateWorkflowIds: Array<{ exp_workflow_id }>) => {
            // Then get all scored with first_pass
            return knex('exp_manual_scores')
              .distinct('exp_workflow_id')
              .groupBy('exp_workflow_id')
              .where({'manualscore_group': 'FIRST_PASS'})
              .then((expManualScoreWorkflowIds: Array<{ exp_workflow_id }>) => {
                return app.models.ExpSet.extract.workflows.getExpWorkflowIdsNotScoredContactSheet(search)
                  .then((unScoredExpWorkflowIds: String[]) => {
                    return {
                      unScoredExpWorkflowIds: unScoredExpWorkflowIds,
                      scoredExpWorkflowIds: expManualScoreWorkflowIds.map((t) => {
                        return t.exp_workflow_id;
                      }),
                      allExpWorkflowIds: expPlateWorkflowIds.map((t) => {
                        return t.exp_workflow_id;
                      }),
                    };
                  })
                  .catch((error) => {
                    return new Error(error);
                  })
              })
              .catch((error) => {
                return new Error(error);
              })
          })
          .catch((error) => {
            return new Error(error);
          })
      })
      .then((expWorkflowObjects) => {
        assert.ok(expWorkflowObjects);
        assert.equal(expWorkflowObjects.unScoredExpWorkflowIds.length, (expWorkflowObjects.allExpWorkflowIds.length - expWorkflowObjects.scoredExpWorkflowIds.length - 1));
        let unscoredNotInScored = true;
        expWorkflowObjects.unScoredExpWorkflowIds.map((id) => {
          if (includes(expWorkflowObjects.scoredExpWorkflowIds, id)) {
            unscoredNotInScored = true;
          }
        });
        assert.ok(unscoredNotInScored);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });
});
