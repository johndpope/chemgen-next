"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var ExpManualScores = app.models.ExpManualScores;
ExpManualScores.load.submitScores = function (scores) {
    console.log(JSON.stringify(scores));
    var dateNow = new Date(Date.now());
    return new Promise(function (resolve, reject) {
        if (lodash_1.isArray(scores)) {
            //@ts-ignore
            Promise.map(scores, function (score) {
                var value = score.manualscoreValue;
                delete score.manualscoreValue;
                if (lodash_1.get(score, 'timestamp')) {
                    delete score.timestamp;
                }
                var createObj = app.etlWorkflow.helpers.findOrCreateObj(score);
                score.timestamp = dateNow;
                score.manualscoreValue = value;
                app.winston.log("Score is : " + JSON.stringify(score));
                return ExpManualScores
                    .findOrCreate({ where: createObj }, score)
                    .then(function (results) {
                    return results[0];
                })
                    .catch(function (error) {
                    app.winston.error(error);
                    return new Error(error);
                });
            })
                .then(function (results) {
                resolve(results);
            })
                .catch(function (error) {
                app.winston.error(error);
                reject(new Error(error));
            });
        }
        else if (lodash_1.isObject(scores)) {
            var value = scores.manualscoreValue;
            delete scores.manualscoreValue;
            if (lodash_1.get(scores, 'timestamp')) {
                delete scores.timestamp;
            }
            var createObj = app.etlWorkflow.helpers.findOrCreateObj(scores);
            scores.timestamp = dateNow;
            scores.manualscoreValue = value;
            app.winston.log("Score is : " + JSON.stringify(scores));
            ExpManualScores
                .findOrCreate({ where: createObj }, scores)
                .then(function (results) {
                resolve(results[0]);
            })
                .catch(function (error) {
                app.winston.error(error);
                reject(new Error(error));
            });
        }
        else {
            resolve([]);
        }
    });
};
//# sourceMappingURL=ExpManualScores.js.map