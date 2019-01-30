"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../../../server/server');
var jsonfile = require('jsonfile');
var path = require('path');
var models_1 = require("../../../common/types/sdk/models");
var lodash_1 = require("lodash");
var axios = require("axios");
var moment = require("moment");
var now = moment().format();
var fs = require('fs');
var request = require('request-promise');
var Promise = require('bluebird');
var genImageFileNames = function (expPlate, well) {
    var imageArray = expPlate.instrumentPlateImagePath.split('\\');
    var folder = imageArray[4];
    var imageId = imageArray[5];
    var plateId = expPlate.instrumentPlateId;
    var imagePath = [
        '/mnt/Plate_Data/',
        folder, '/',
        imageId, '/',
        imageId
    ].join('');
    //This is only for worms - cells are different
    var outDir = '/mnt/image/cells/';
    var makeDir = outDir + folder + '/' + plateId;
    var exts = [];
    lodash_1.range(0, 9).map(function (field) {
        lodash_1.range(0, 5).map(function (channel) {
            exts.push("f0" + field + "d" + channel);
        });
    });
    // console.log(JSON.stringify(exts));
    // process.exit(0);
    return exts.map(function (ext) {
        var assayName = expPlate.barcode + '_' + well + ext;
        var instrumentImage = imagePath + '_' + well + ext + '.C01';
        var baseImage = makeDir + '/' + assayName;
        var random = Math.random().toString(36).substring(7);
        var tmpImage = '/tmp/' + random + '/' + random + '.C01';
        //TODO Get rid of all the base images - just have 1 and make the extensions
        return {
            convertImage: baseImage + '.tiff',
            convertBmp: baseImage + '.bmp',
            instrumentImage: instrumentImage,
            makeDir: makeDir,
            baseImage: baseImage,
            assayName: assayName,
            plateId: plateId,
            random: random,
            tmpImage: tmpImage,
            thumbSizes: [],
        };
    });
};
var submitImageJob = function (imagesList) {
    return new Promise(function (resolve, reject) {
        Promise.map(imagesList, function (images) {
            var uri = "http://pyrite.abudhabi.nyu.edu:8080/api/experimental/dags/image_conversion/dag_runs";
            return app.models.ExpAssay.helpers.cells.genConvertImageCommands(images)
                .then(function (commands) {
                app.winston.info(commands);
                // return;
                var imageJob = {
                    run_id: "convertImage-" + images.plateId + "-" + images.assayName + "-" + now,
                    task_id: "convertImage-" + images.plateId + "-" + images.assayName + "-" + now,
                    conf: JSON.stringify({ image_convert_command: commands })
                };
                // @ts-ignore
                return axios.post(uri, imageJob)
                    .then(function (response) {
                    app.winston.info('All fine');
                    return {
                        baseImage: images.baseImage,
                        // @ts-ignore
                        script: imageJob.title,
                        convert: 1
                    };
                })
                    .then(function () {
                    return Promise.delay(5000);
                })
                    .catch(function (error) {
                    app.winston.error('Got an error');
                    // app.winston.error(error.error);
                    return {
                        baseImage: images.baseImage,
                        // @ts-ignore
                        script: imageJob.title,
                        convert: 0
                    };
                });
            })
                .catch(function (error) {
                console.log(JSON.stringify(error));
                throw new Error(error);
            });
        }, { concurrency: 1 })
            .then(function () {
            return Promise.delay(5000);
        })
            .then(function (results) {
            console.log('resolving contactSheetResults!');
            resolve();
            // resolve(results);
        })
            .catch(function (error) {
            console.log(JSON.stringify(error));
            reject(new Error(error));
        });
    });
};
var plateDataList = jsonfile.readFileSync(path.resolve(__dirname, 'upload_these.json'));
plateDataList = lodash_1.shuffle(plateDataList);
plateDataList = plateDataList.slice(0, 10);
Promise.map(plateDataList, function (plateData) {
    var expPlate = new models_1.ExpPlateResultSet({
        barcode: plateData.name,
        instrumentPlateImagePath: plateData.imagepath,
        instrumentPlateId: plateData.csPlateid
    });
    var wells = app.etlWorkflow.helpers.list384Wells();
    return Promise.map(wells, function (well) {
        var imageData = genImageFileNames(expPlate, well);
        return submitImageJob(imageData);
    }, { concurrency: 1 })
        .then(function (results) {
        console.log(JSON.stringify(results));
        return results;
    })
        .catch(function (error) {
        console.log(JSON.stringify(error));
        throw new Error(error);
    });
}, { concurrency: 1 })
    .then(function (results) {
    console.log('I think this is done!');
})
    .catch(function (error) {
    console.log(JSON.stringify(error));
});
//# sourceMappingURL=convert_cell_images.js.map