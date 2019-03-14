const app = require('../server/server');
const jsonfile = require('jsonfile');
const path = require('path');
import {ExpPlateResultSet, PlateResultSet} from "../common/types/sdk/models";
import {range, shuffle} from 'lodash';

import axios = require('axios');
import * as moment from 'moment';

let now = moment().format();

import config = require('config');

const fs = require('fs');

const request = require('request-promise');
const Promise = require('bluebird');

const uri = "http://pyrite.abudhabi.nyu.edu:8089/api/experimental/dags/image_conversion/dag_runs";

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
  let outDir = '/mnt/image/';
  let makeDir = outDir + folder + '/' + plateId;
  let exts = [''];
  // range(0, 1).map((field) => {
  //   range(0, 1).map((channel) => {
  //     exts.push(`f0${field}d${channel}`);
  //   });
  // });

  // console.log(JSON.stringify(exts));
  // process.exit(0);

  return exts.map((ext) => {
    let assayName = expPlate.barcode + '_' + well + ext;
    let instrumentImage = imagePath + '_' + well + 'f00d0' + '.C01';
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

let generateImageJob = function (imagesList, plateData: ExpPlateResultSet) {
  return new Promise((resolve, reject) => {
    Promise.map(imagesList, (images) => {
      return app.models.ExpAssay.helpers.genConvertImageCommands(images)
        .then((commands: string) => {
          return commands;
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
          return new Error(error);
        })
    }, {concurrency: 1})
      .then((commands: Array<string>) => {
        let commandStr = commands.join("\n");
        // commandStr = "#!/usr/bin/env bash\nset -x -e\n\n" + commandStr;
        const imageJob = {
          run_id: `convertWell-${plateData.barcode}-${imagesList[0].assayName}`,
          task_id: `convertWell-${plateData.barcode}-${imagesList[0].assayName}`,
          conf: JSON.stringify({image_convert_command: commandStr})
        };
        resolve(commandStr);
      })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
        reject(new Error(error));
      });
  });
};

app.models.Plate.find({
  where: {
    or: [
      {
        name: {like: '%RNA%am%'}
      },
      {
        name: {like: '%RNA%vi%'}
      },
    ]
  }
})
  .then((platesDataList: PlateResultSet[]) => {
    app.winston.info(`Found: ${platesDataList.length} plates`);
    platesDataList.map((plateData) => {
      app.winston.info(`Found Plate: ${plateData.name}`);
    });
    // platesDataList = platesDataList.slice(0, 1);
    // platesDataList = shuffle(platesDataList);
    return Promise.map(platesDataList, (plateData: PlateResultSet) => {
      let expPlate = new ExpPlateResultSet({
        barcode: plateData.name,
        instrumentPlateImagePath: plateData.imagepath,
        instrumentPlateId: plateData.csPlateid
      });
      // app.winston.info(`Processing Plate: ${expPlate.barcode}`);
      // let wells = app.etlWorkflow.helpers.list384Wells();
      let wells = app.etlWorkflow.helpers.list96Wells();
      // wells = shuffle(wells);

      return Promise.map(wells, (well) => {
        let imageData = genImageFileNames(expPlate, well);
        return generateImageJob(imageData, expPlate);
      }, {concurrency: 1})
        .then((commands: Array<string>) => {
          let commandStr = commands.join("\n");
          commandStr = "#!/usr/bin/env bash\n\n" + commandStr;
          const imageJob = {
            run_id: `convertWell-${expPlate.barcode}`,
            task_id: `convertWell-${expPlate.barcode}`,
            conf: JSON.stringify({image_convert_command: commandStr})
          };
          return submitImageJob(imageJob, expPlate);
        })
        .catch((error) => {
          return new Error(error);
        });
    }, {concurrency: 1})
      .then((results) => {
        console.log('I think this is done!');
      })
      .catch((error) => {
        app.winston.error(`Received Error: ${error}`);
      });
  })
  .catch((error) => {
    app.winston.error(error);
  });

function submitImageJob(imageJob: { run_id, task_id, conf }, expPlate: ExpPlateResultSet) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    axios.post(uri, imageJob)
      .then((response) => {
        app.winston.info(`Successfully submitted ${imageJob.run_id}`);
        return {
          plate: expPlate.barcode,
          convert: 1
        };
      })
      .then(() => {
        return Promise.delay(500);
      })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        app.winston.error(`Error submitting ${imageJob.run_id}`);
        app.winston.error(`${error}`);
        app.winston.error(error);
        resolve();
      });
  });
}
