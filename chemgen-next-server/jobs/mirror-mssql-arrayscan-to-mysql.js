"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../server/server');
var lodash_1 = require("lodash");
var Promise = require("bluebird");
getPlateRecords()
    .then(function () {
    app.winston.info('migrated platerecords!');
})
    .catch(function (error) {
    app.winston.error(error);
});
function getPlateRecords() {
    return new Promise(function (resolve, reject) {
        countPlateRecords()
            .then(function (paginationResults) {
            Promise.map(paginationResults.pages, function (page) {
                var skip = Number(page) * Number(paginationResults.limit);
                app.winston.info("Querying for Skip: " + skip + " Limit: " + paginationResults.limit);
                return app.models.Plate
                    .find({
                    limit: paginationResults.limit,
                    skip: skip,
                })
                    .then(function (results) {
                    return mirrorToMysqlDB(results);
                })
                    .catch(function (error) {
                    return new Error(error);
                });
            }, { concurrency: 1 })
                .then(function () {
                resolve();
            })
                .catch(function (error) {
                console.log(error);
                reject(new Error(error));
            });
        });
    });
}
function mirrorToMysqlDB(plateResults) {
    return new Promise(function (resolve, reject) {
        Promise.map(plateResults, function (plateResult) {
            return app.models.ArrayScanPlateMirror
                .findOrCreate({ where: { id: plateResult.id } }, JSON.parse(JSON.stringify(plateResult)));
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function countPlateRecords() {
    return new Promise(function (resolve, reject) {
        app.models.Plate
            .count()
            .then(function (count) {
            var limit = 1000;
            var numPages = Math.round(count / limit);
            var pages = lodash_1.range(0, numPages + 2);
            console.log("count is " + count);
            resolve({ count: count, pages: pages, limit: limit });
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
//# sourceMappingURL=mirror-mssql-arrayscan-to-mysql.js.map