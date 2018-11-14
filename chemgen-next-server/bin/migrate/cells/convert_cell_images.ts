const app = require('../../../server/server');
const jsonfile = require('jsonfile');
const path = require('path');
import {ExpPlateResultSet, PlateResultSet} from '../../../common/types/sdk/models';
import {range, shuffle} from 'lodash';

const fs = require('fs');
import config = require('config');

const request = require('request-promise');
const Promise = require('bluebird');

let genImageFileNames = function (expPlate: ExpPlateResultSet, well: string) {
  let imageArray = expPlate.instrumentPlateImagePath.split('\\');
  let folder = imageArray[4];
  let imageId = imageArray[5];
  let plateId = expPlate.instrumentPlateId;

  let imagePath = [
    '/mnt/Plate_Data/',
    folder, '/',
    imageId, '/',
    imageId
  ].join('');

  //This is only for worms - cells are different
  let outDir = '/mnt/image/cells/';
  let makeDir = outDir + folder + '/' + plateId;
  let exts = [];
  range(0, 9).map((field) => {
    range(0, 5).map((channel) => {
      exts.push(`f0${field}d${channel}`);
    });
  });

  // console.log(JSON.stringify(exts));
  // process.exit(0);

  return exts.map((ext) => {
    let assayName = expPlate.barcode + '_' + well + ext;
    let instrumentImage = imagePath + '_' + well + ext + '.C01';
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
      ],
    };
  });
};

let submitImageJob = function (imagesList) {
  console.log('In submitImageJob');
  return new Promise((resolve, reject) => {
    Promise.map(imagesList, (images) => {
      console.log(JSON.stringify(images));
      return app.models.ExpAssay.helpers.genConvertImageCommands(images)
        .then((commands: string) => {
          const imageJob = {
            title: `convertImage-${images.plateId}-${images.assayName}`,
            commands: commands,
            plateId: images.plateId,
          };
          let requestParams = {
            uri: `http://${config.get('imageConversionHost')}:${config.get('imageConversionPort')}`,
            body: imageJob,
            method: 'POST',
            json: true,
          };
          console.log(JSON.stringify(requestParams));
          if (!fs.existsSync(`${images.baseImage}-autolevel.png`)) {
            //TODO Make this a parameter somewhere
            return request({
              uri: `http://${config.get('imageConversionHost')}:${config.get('imageConversionPort')}`,
              body: imageJob,
              method: 'POST',
              json: true,
            })
              .then((response) => {
                console.log(JSON.stringify(response));
                return {
                  baseImage: images.baseImage,
                  script: imageJob.title,
                  convert: 1
                };
              })
              .catch((error) => {
                console.log(JSON.stringify(error));
                return {
                  baseImage: images.baseImage,
                  script: imageJob.title,
                  convert: 0
                };
              });
          }
          else {
            return {
              baseImage: images.baseImage,
              script: imageJob.title,
              convert: 0
            };
          }
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
          throw new Error(error);
        })
    }, {concurrency: 1})
      .then((results) => {
        console.log('resolving contactSheetResults!');
        resolve(results);
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
        reject(new Error(error));
      });
  });
};

let plateDataList = jsonfile.readFileSync(path.resolve(__dirname, 'upload_these.json'));

plateDataList = shuffle(plateDataList);

Promise.map(plateDataList, (plateData: PlateResultSet) => {
  let expPlate = new ExpPlateResultSet({
    barcode: plateData.name,
    instrumentPlateImagePath: plateData.imagepath,
    instrumentPlateId: plateData.csPlateid
  });
  console.log('got experiment plate!');
  let wells = app.etlWorkflow.helpers.list384Wells();

  console.log('got wells!');
  return Promise.map(wells, (well) => {
    let imageData = genImageFileNames(expPlate, well);
    return submitImageJob(imageData);
  })
    .then((results) => {
      console.log(JSON.stringify(results));
      return results;
    })
    .catch((error) => {
      console.log(JSON.stringify(error));
      throw new Error(error);
    });
}, {concurrency: 1})
  .then((results) => {
    console.log('I think this is done!');
  })
  .catch((error) => {
    console.log(JSON.stringify(error));
  });
