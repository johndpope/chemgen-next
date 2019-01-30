#!/usr/bin/env node

import Queue = require('bull');
import app = require('../server/server');
import Promise = require('bluebird');
import config = require('config');
import path = require('path');
import {isEqual} from 'lodash';

const jobQueues = {
  testQueue: new Queue('test queue', config.get('redisUrl')),
  workflowQueue: new Queue('Exp Workflow Queue: Process Exp Workflows in the DB', {
    redis: {
      port: config.get('redisPort'),
      host: config.get('redisHost')
    },
    limiter: {
      max: 5,
      duration: 10000,
    }
  }),
  workflowQueueZeroExpSets: new Queue('Exp Workflow Queue: Look for ExpWorkflows not in the DB and process them', {
    redis: {
      port: config.get('redisPort'),
      host: config.get('redisHost')
    },
    limiter: {
      max: 1,
      duration: 10000,
    }
  }),
  testConcurrencyQueue: new Queue('test limit queue', {
    redis: {
      port: config.get('redisPort'),
      host: config.get('redisHost')
    },
    limiter: {
      max: 1,
      duration: 10000,
    }
  })
};

jobQueues.testConcurrencyQueue.process(function (job) {
  return new Promise((resolve, reject) => {
    console.log(`DateTime: ${new Date(Date.now())}`);
    console.log(JSON.stringify(job.data));
    resolve();
  });
});

// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => {
//   jobQueues.testConcurrencyQueue.add({hello: 'world! redis queue is working', step: index});
// });

jobQueues.workflowQueue.process(1, path.resolve(__dirname, 'workflowQueue.js'));

jobQueues.workflowQueue.on('completed', function (job, result) {
  console.log(`Job completed ${new Date(Date.now())} ${job.id} ${result}`);
});

if(isEqual(process.env.NODE_ENV, 'PRODUCTION') || isEqual(process.env.NODE_ENV, 'production')){
  jobQueues.workflowQueueZeroExpSets.process(1, path.resolve(__dirname, 'processExpWorkflowsZeroExpSets.js'));
  jobQueues.workflowQueueZeroExpSets.on('completed', function(job){
    console.log(`Job completed ${new Date(Date.now())} ${job.id}`);
  });
  jobQueues.workflowQueueZeroExpSets.add({}, {repeat: {every: 300000}});
}

app.jobQueues = jobQueues;

export = jobQueues;

