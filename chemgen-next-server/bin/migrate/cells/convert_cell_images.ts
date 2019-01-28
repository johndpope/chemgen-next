const app = require('../../../server/server');
const jsonfile = require('jsonfile');
const path = require('path');
import {ExpPlateResultSet, PlateResultSet} from '../../../common/types/sdk/models';
import {range, shuffle} from 'lodash';

import axios = require('axios');
import * as moment from 'moment';

let now = moment().format();

import config = require('config');

const fs = require('fs');

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
      thumbSizes: [],
    };
  });
};

let submitImageJob = function (imagesList) {
  return new Promise((resolve, reject) => {
    Promise.map(imagesList, (images) => {
      const uri = "http://pyrite.abudhabi.nyu.edu:8080/api/experimental/dags/image_conversion/dag_runs";
      return app.models.ExpAssay.helpers.cells.genConvertImageCommands(images)
        .then((commands: string) => {
          app.winston.info(commands);
          // return;
          const imageJob = {
            run_id: `convertImage-${images.plateId}-${images.assayName}-${now}`,
            task_id: `convertImage-${images.plateId}-${images.assayName}-${now}`,
            conf: JSON.stringify({image_convert_command: commands})
          };
          // @ts-ignore
          return axios.post(uri, imageJob)
            .then((response) => {
              app.winston.info('All fine');
              return {
                baseImage: images.baseImage,
                // @ts-ignore
                script: imageJob.title,
                convert: 1
              };
            })
            .then(() => {
              return Promise.delay(5000);
            })
            .catch((error) => {
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
        .catch((error) => {
          console.log(JSON.stringify(error));
          throw new Error(error);
        })
    }, {concurrency: 1})
      .then(() => {
        return Promise.delay(5000);
      })
      .then((results) => {
        console.log('resolving contactSheetResults!');
        resolve();
        // resolve(results);
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
        reject(new Error(error));
      });
  });
};

let plateDataList = jsonfile.readFileSync(path.resolve(__dirname, 'upload_these.json'));

plateDataList = shuffle(plateDataList);
plateDataList = plateDataList.slice(0, 10);

Promise.map(plateDataList, (plateData: PlateResultSet) => {
  let expPlate = new ExpPlateResultSet({
    barcode: plateData.name,
    instrumentPlateImagePath: plateData.imagepath,
    instrumentPlateId: plateData.csPlateid
  });
  let wells = app.etlWorkflow.helpers.list384Wells();

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
