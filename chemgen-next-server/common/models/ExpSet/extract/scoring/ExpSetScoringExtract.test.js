"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExpSetTypes_1 = require("../../../../types/custom/ExpSetTypes");
var assert = require("assert");
var app = require("../../../../../server/server");
var lodash_1 = require("lodash");
var config = require("config");
var knex = config.get('knex');
if (!lodash_1.isEqual(process.env.NODE_ENV, 'dev')) {
    process.exit(0);
}
describe('ExpSetScoringExtract.test.ts', function () {
    it('Should return the manualScoresAdvancedQuery for exp_assays', function () {
        var search = new ExpSetTypes_1.ExpSetSearch({ expWorkflowSearch: [String('ABCDEFG')] });
        var data = new ExpSetTypes_1.ExpSetSearchResults({});
        var sqlQuery = app.models.ExpSet.extract.buildNativeQuery(data, search, false);
        var sqlString = sqlQuery.toString();
        var matchedSql = "select * from `exp_assay2reagent` where `reagent_type` like 'treat%' and `reagent_id` is not null and `exp_workflow_id` in ('ABCDEFG') and not exists (select 1 from `exp_manual_scores` where exp_assay2reagent.assay_id = exp_manual_scores.assay_id)";
        assert.equal(matchedSql, sqlString);
    });
    it('Should return the manualScoresAdvancedQuery for exp_assay2reagents by exp_workflow_id', function () {
        var search = new ExpSetTypes_1.ExpSetSearch({ expWorkflowSearch: [String('ABCDEFG')] });
        var data = new ExpSetTypes_1.ExpSetSearchResults({});
        var sqlQuery = app.models.ExpSet.extract.buildNativeQueryExpWorkflowId(data, search, false);
        var sqlString = sqlQuery.toString();
        var matchedSql = "select distinct `exp_workflow_id` from `exp_assay2reagent` where `reagent_type` like 'treat%' and `reagent_id` is not null and `exp_workflow_id` in ('ABCDEFG') and not exists (select 1 from `exp_manual_scores` where exp_assay2reagent.assay_id = exp_manual_scores.assay_id)";
        assert.equal(matchedSql, sqlString);
    });
    it('Should return the manualScoresAdvancedQuery for getting scores with a FIRST_PASS and does no HAS_MANUAL_SCORE', function () {
        // let search = new ExpSetSearch({expWorkflowSearch: [String('ABCDEFG')]});
        var search = new ExpSetTypes_1.ExpSetSearch({});
        var data = new ExpSetTypes_1.ExpSetSearchResults({});
        var sqlQuery = app.models.ExpSet.extract.buildNativeQueryByFirstPass(data, search, true);
        var sqlString = sqlQuery.toString();
        assert.ok(sqlString);
    });
    it('Should filter by Scores', function (done) {
        var search = new ExpSetTypes_1.ExpSetSearch({
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
            .then(function (data) {
            var scores = data.expManualScores.filter(function (expManualScore) {
                return lodash_1.isEqual(expManualScore.manualscoreValue, 3);
            });
            assert.ok(data);
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('Should filter by Scores Advanced', function (done) {
        var search = new ExpSetTypes_1.ExpSetSearch({
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
            .then(function (data) {
            assert.ok(data);
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('Should filter by Scores Advanced With Dummy Filter', function (done) {
        var search = new ExpSetTypes_1.ExpSetSearch({
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
            .then(function (data) {
            assert.ok(data);
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('Should return a list of expWorkflowIds that have not gone through the first pass', function (done) {
        var search = new ExpSetTypes_1.ExpSetSearch({});
        app.models.ExpScreenUploadWorkflow
            .find({ fields: { id: true } })
            .then(function (expWorkflows) {
            //First get all the workflows from the exp_plates
            return knex('exp_plate')
                .distinct('exp_workflow_id')
                .groupBy('exp_workflow_id')
                .select()
                .then(function (expPlateWorkflowIds) {
                // Then get all scored with first_pass
                return knex('exp_manual_scores')
                    .distinct('exp_workflow_id')
                    .groupBy('exp_workflow_id')
                    .where({ 'manualscore_group': 'FIRST_PASS' })
                    .then(function (expManualScoreWorkflowIds) {
                    return app.models.ExpSet.extract.workflows.getExpWorkflowIdsNotScoredContactSheet(search)
                        .then(function (unScoredExpWorkflowIds) {
                        return {
                            unScoredExpWorkflowIds: unScoredExpWorkflowIds,
                            scoredExpWorkflowIds: expManualScoreWorkflowIds.map(function (t) {
                                return t.exp_workflow_id;
                            }),
                            allExpWorkflowIds: expPlateWorkflowIds.map(function (t) {
                                return t.exp_workflow_id;
                            }),
                        };
                    })
                        .catch(function (error) {
                        return new Error(error);
                    });
                })
                    .catch(function (error) {
                    return new Error(error);
                });
            })
                .catch(function (error) {
                return new Error(error);
            });
        })
            .then(function (expWorkflowObjects) {
            assert.ok(expWorkflowObjects);
            assert.equal(expWorkflowObjects.unScoredExpWorkflowIds.length, (expWorkflowObjects.allExpWorkflowIds.length - expWorkflowObjects.scoredExpWorkflowIds.length - 1));
            var unscoredNotInScored = true;
            expWorkflowObjects.unScoredExpWorkflowIds.map(function (id) {
                if (lodash_1.includes(expWorkflowObjects.scoredExpWorkflowIds, id)) {
                    unscoredNotInScored = true;
                }
            });
            assert.ok(unscoredNotInScored);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
});
//# sourceMappingURL=ExpSetScoringExtract.test.js.map