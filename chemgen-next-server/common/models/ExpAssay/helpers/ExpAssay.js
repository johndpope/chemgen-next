"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var path = require("path");
var Promise = require("bluebird");
var Mustache = require("mustache");
var readFile = Promise.promisify(require('fs').readFile);
var ExpAssay = app.models['ExpAssay'];
//TODO This is worm nyuad only logic
//TODO Preface all basename(baseImage) with the instrumentPlateId, that way we get unique image names
ExpAssay.helpers.genImageFileNames = function (expPlate, well) {
    var imageArray = expPlate.instrumentPlateImagePath.split('\\');
    var folder = imageArray[4];
    var imageId = imageArray[5];
    var plateId = expPlate.instrumentPlateId;
    var assayName = expPlate.barcode + '_' + well;
    var imagePath = [
        '/mnt/Plate_Data/',
        folder, '/',
        imageId, '/',
        imageId
    ].join('');
    //This is only for worms - cells are different
    var ext = 'f00d0.C01';
    var instrumentImage = imagePath + '_' + well + ext;
    var outDir = '/mnt/image/';
    var makeDir = outDir + folder + '/' + plateId;
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
        thumbSizes: [
            '1024x1024',
        ],
    };
};
//TODO This is NYUAD Specific
//TODO This is WORM specific
ExpAssay.helpers.genConvertImageCommands = function (images) {
    var templateFile = path.join(path.dirname(__filename), '../../../views/exp/assay/worm/convertImages.mustache');
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        readFile(templateFile, 'utf8')
            .then(function (contents) {
            var commands = Mustache.render(contents, {
                random: images.random,
                thumbSizes: images.thumbSizes,
                images: images
            });
            resolve(commands);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpAssay.helpers.cells = {};
ExpAssay.helpers.cells.genConvertImageCommands = function (images) {
    var templateFile = path.join(path.dirname(__filename), '../../../views/exp/assay/cell/convertImages.mustache');
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        readFile(templateFile, 'utf8')
            .then(function (contents) {
            var commands = Mustache.render(contents, {
                random: images.random,
                thumbSizes: images.thumbSizes,
                images: images
            });
            resolve(commands);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ExpAssay.js.map