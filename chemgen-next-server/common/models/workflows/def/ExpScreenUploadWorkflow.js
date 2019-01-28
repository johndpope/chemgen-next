'use strict'
const Promise = require('bluebird')
const app = require('../../../../server/server')
const lodash = require('lodash')

module.exports = function (ExpScreenUploadWorkflow) {
  ExpScreenUploadWorkflow.load = {}
  ExpScreenUploadWorkflow.load.workflows = {}
  ExpScreenUploadWorkflow.load.workflows.worms = {}
  ExpScreenUploadWorkflow.load.workflows.worms.primary = {}
  ExpScreenUploadWorkflow.load.workflows.worms.secondary = {}
  ExpScreenUploadWorkflow.load.workflows.primary = {}
  ExpScreenUploadWorkflow.load.workflows.secondary = {}

  ExpScreenUploadWorkflow.load.primary = {}
  ExpScreenUploadWorkflow.load.secondary = {}

  ExpScreenUploadWorkflow.on('attached', function () {
    require('../load/ExpScreenUploadWorkflow')
    require('../experiment/worms/load/primary/ExpScreenUploadWorkflow')
    require('../experiment/worms/load/ExpScreenUploadWorkflow')
  })

  ExpScreenUploadWorkflow.doWork = function (workflowData) {
    return new Promise((resolve, reject) => {
      // app.agenda.now('ExpScreenUploadWorkflow.doWork', {workflowData: workflowData})
      if (lodash.isArray(workflowData)) {
        workflowData.map((workflow) => {
          app.winston.info(`ExpScreenUploadWorkflow.doWork ${workflow.name}`)
          app.jobQueues.workflowQueue.add({workflowData: workflow})
        })
      } else {
        app.winston.info(`ExpScreenUploadWorkflow.doWork ${workflowData.name}`)
        app.jobQueues.workflowQueue.add({workflowData: workflowData})
        workflowData = [workflowData]
      }
      Promise.map(workflowData, (workflow) => {
        return ExpScreenUploadWorkflow.load.createWorkflowInstance(workflow)
      })
        .then(() => {
          resolve({'status': 'ok'})
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  ExpScreenUploadWorkflow.remoteMethod(
    'doWork', {
      http: {path: '/dowork', verb: 'post'},
      accepts: {arg: 'workflowData', type: 'any', http: {source: 'query'}},
      returns: {arg: 'status', type: 'string'}
    }
  )
}
