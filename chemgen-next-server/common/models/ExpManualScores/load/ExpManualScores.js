"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var ExpManualScores = app.models.ExpManualScores;
ExpManualScores.load.submitScores = function (scores) {
    app.winston.info('Submitting scores!');
    app.winston.info(JSON.stringify(scores));
    var dateNow = new Date(Date.now());
    return new Promise(function (resolve, reject) {
        if (lodash_1.isArray(scores)) {
            scores.map(function (score) {
                score.timestamp = dateNow;
            });
            app.models.ExpManualScores
                .create(scores)
                .then(function (results) {
                app.winston.info("Successfully submitted " + results.length + " scores");
                resolve();
            })
                .catch(function (error) {
                app.winston.error(error);
                reject(new Error(error));
            });
            //@ts-ignore
        }
        else if (lodash_1.isObject(scores)) {
            scores.timestamp = dateNow;
            app.models.ExpManualScores
                .create(scores)
                .then(function (results) {
                app.winston.info('Successfully submitted score');
                resolve();
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