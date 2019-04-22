import app  = require('../../../../server/server.js');
import Promise = require('bluebird');

import {isArray, isObject, get} from 'lodash';
import {WorkflowModel} from "../../index";
import {ExpManualScoresResultSet} from "../../../types/sdk/models";

const ExpManualScores = app.models.ExpManualScores as (typeof WorkflowModel);

ExpManualScores.load.submitScores = function (scores) {
  app.winston.info('Submitting scores!');
  app.winston.info(JSON.stringify(scores));
  let dateNow = new Date(Date.now());
  return new Promise((resolve, reject) => {
    if (isArray(scores)) {
      scores.map((score: ExpManualScoresResultSet) =>{
        score.timestamp = dateNow;
      });
      app.models.ExpManualScores
        .create(scores)
        .then((results: ExpManualScoresResultSet[]) =>{
          app.winston.info(`Successfully submitted ${results.length} scores`);
          resolve();
        })
        .catch((error) =>{
          app.winston.error(error);
          reject(new Error(error));
        })
      //@ts-ignore
    } else if (isObject(scores)) {
      scores.timestamp = dateNow;
      app.models.ExpManualScores
        .create(scores)
        .then((results: ExpManualScoresResultSet) =>{
          app.winston.info('Successfully submitted score');
          resolve();
        })
        .catch((error) =>{
          app.winston.error(error);
          reject(new Error(error));
        })
    } else {
      resolve([]);
    }
  });
};

