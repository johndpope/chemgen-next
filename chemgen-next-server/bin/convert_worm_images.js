"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../server/server');
var jsonfile = require('jsonfile');
var path = require('path');
var models_1 = require("../common/types/sdk/models");
var axios = require("axios");
var moment = require("moment");
var now = moment().format();
var fs = require('fs');
var request = require('request-promise');
var Promise = require('bluebird');
var uri = "http://pyrite.abudhabi.nyu.edu:8089/api/experimental/dags/image_conversion/dag_runs";
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
    var outDir = '/mnt/image/';
    var makeDir = outDir + folder + '/' + plateId;
    var exts = [''];
    // range(0, 1).map((field) => {
    //   range(0, 1).map((channel) => {
    //     exts.push(`f0${field}d${channel}`);
    //   });
    // });
    // console.log(JSON.stringify(exts));
    // process.exit(0);
    return exts.map(function (ext) {
        var assayName = expPlate.barcode + '_' + well + ext;
        var instrumentImage = imagePath + '_' + well + 'f00d0' + '.C01';
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
var generateImageJob = function (imagesList, plateData) {
    return new Promise(function (resolve, reject) {
        Promise.map(imagesList, function (images) {
            return app.models.ExpAssay.helpers.genConvertImageCommands(images)
                .then(function (commands) {
                return commands;
            })
                .catch(function (error) {
                console.log(JSON.stringify(error));
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function (commands) {
            var commandStr = commands.join("\n");
            // commandStr = "#!/usr/bin/env bash\nset -x -e\n\n" + commandStr;
            var imageJob = {
                run_id: "convertWell-" + plateData.barcode + "-" + imagesList[0].assayName,
                task_id: "convertWell-" + plateData.barcode + "-" + imagesList[0].assayName,
                conf: JSON.stringify({ image_convert_command: commandStr })
            };
            resolve(commandStr);
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            console.log(JSON.stringify(error));
            reject(new Error(error));
        });
    });
};
app.models.Plate.find({
    where: {
        or: [
            {
                name: { like: '%RNA%am%' }
            },
            {
                name: { like: '%RNA%vi%' }
            },
        ]
    }
})
    .then(function (platesDataList) {
    app.winston.info("Found: " + platesDataList.length + " plates");
    platesDataList.map(function (plateData) {
        app.winston.info("Found Plate: " + plateData.name);
    });
    // platesDataList = platesDataList.slice(0, 1);
    // platesDataList = shuffle(platesDataList);
    return Promise.map(platesDataList, function (plateData) {
        var expPlate = new models_1.ExpPlateResultSet({
            barcode: plateData.name,
            instrumentPlateImagePath: plateData.imagepath,
            instrumentPlateId: plateData.csPlateid
        });
        // app.winston.info(`Processing Plate: ${expPlate.barcode}`);
        // let wells = app.etlWorkflow.helpers.list384Wells();
        var wells = app.etlWorkflow.helpers.list96Wells();
        // wells = shuffle(wells);
        return Promise.map(wells, function (well) {
            var imageData = genImageFileNames(expPlate, well);
            return generateImageJob(imageData, expPlate);
        }, { concurrency: 1 })
            .then(function (commands) {
            var commandStr = commands.join("\n");
            commandStr = "#!/usr/bin/env bash\n\n" + commandStr;
            var imageJob = {
                run_id: "convertWell-" + expPlate.barcode,
                task_id: "convertWell-" + expPlate.barcode,
                conf: JSON.stringify({ image_convert_command: commandStr })
            };
            return submitImageJob(imageJob, expPlate);
        })
            .catch(function (error) {
            return new Error(error);
        });
    }, { concurrency: 1 })
        .then(function (results) {
        console.log('I think this is done!');
    })
        .catch(function (error) {
        app.winston.error("Received Error: " + error);
    });
})
    .catch(function (error) {
    app.winston.error(error);
});
function submitImageJob(imageJob, expPlate) {
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        axios.post(uri, imageJob)
            .then(function (response) {
            app.winston.info("Successfully submitted " + imageJob.run_id);
            return {
                plate: expPlate.barcode,
                convert: 1
            };
        })
            .then(function () {
            return Promise.delay(500);
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            app.winston.error("Error submitting " + imageJob.run_id);
            app.winston.error("" + error);
            app.winston.error(error);
            resolve();
        });
    });
}
//# sourceMappingURL=convert_worm_images.js.map