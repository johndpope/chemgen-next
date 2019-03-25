import app  = require('../../../../server/server.js');
import path = require('path');

import {ExpPlateResultSet} from "../../../types/sdk/models";
import {WorkflowModel} from "../../index";

import Promise = require('bluebird');
import Mustache = require('mustache');
import * as _ from "lodash";
const readFile = Promise.promisify(require('fs').readFile);

const ExpAssay = app.models['ExpAssay'] as (typeof WorkflowModel);

//TODO This is worm nyuad only logic
//TODO Preface all basename(baseImage) with the instrumentPlateId, that way we get unique image names
ExpAssay.helpers.genImageFileNames = function(expPlate: ExpPlateResultSet, well: string) {
  let imageArray = expPlate.instrumentPlateImagePath.split('\\');
  let folder = imageArray[4];
  let imageId = imageArray[5];
  let plateId = expPlate.instrumentPlateId;
  let assayName = expPlate.barcode + '_' + well;

  let imagePath = [
    '/mnt/Plate_Data/',
    folder, '/',
    imageId, '/',
    imageId
  ].join('');

  //This is only for worms - cells are different
  let ext = 'f00d0.C01';
  let instrumentImage = imagePath + '_' + well + ext;
  let outDir = '/mnt/image/';
  let makeDir = outDir + folder + '/' + plateId;
  let baseImage = makeDir + '/' + assayName;

  let random = Math.random().toString(36).substring(7);
  let tmpImage = '/tmp/' + random + '/' + random + '.C01';

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
      '1080x1080',
      '768x768',
      '600x600',
      // '400x400',
      // '300x300',
      // '150x150',
    ],
  };
};

//TODO This is NYUAD Specific
//TODO This is WORM specific
ExpAssay.helpers.genConvertImageCommands = function(images) {
  let templateFile = path.join(path.dirname(__filename), '../../../views/exp/assay/worm/convertImages.mustache');
  return new Promise(function(resolve, reject) {
    // @ts-ignore
    readFile(templateFile, 'utf8')
      .then(function(contents) {
        var commands = Mustache.render(contents, {
          random: images.random,
          thumbSizes: images.thumbSizes,
          images: images
        });
        resolve(commands);
      })
      .catch(function(error) {
        reject(new Error(error));
      });
  });
};

ExpAssay.helpers.cells = {};
ExpAssay.helpers.cells.genConvertImageCommands = function(images) {
  let templateFile = path.join(path.dirname(__filename), '../../../views/exp/assay/cell/convertImages.mustache');
  return new Promise(function(resolve, reject) {
    // @ts-ignore
    readFile(templateFile, 'utf8')
      .then(function(contents) {
        const commands = Mustache.render(contents, {
          random: images.random,
          thumbSizes: images.thumbSizes,
          images: images
        });
        resolve(commands);
      })
      .catch(function(error) {
        reject(new Error(error));
      });
  });
};
