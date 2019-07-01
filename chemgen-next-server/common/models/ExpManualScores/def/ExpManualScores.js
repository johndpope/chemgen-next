'use strict'

module.exports = function (ExpManualScores) {
  ExpManualScores.helpers = {}
  ExpManualScores.load = {}
  ExpManualScores.load.workflows = {}
  ExpManualScores.extract = {}
  ExpManualScores.extract.workflows = {}
  ExpManualScores.transform = {}
  ExpManualScores.transform.workflows = {}

  ExpManualScores.on('attached', function () {
    require('../load/ExpManualScores')
    require('../summary/ExpManualScores')
    // require('../transform/ExpManualScores')
    // require('../extract/RnaiExpManualScores')
  })

  ExpManualScores.summary = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpManualScores.extract.workflows.getScoresStatsPerScreen(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  ExpManualScores.submitScores = function (scores, cb) {
    console.log('ExpManualScores.submitScores')
    return new Promise((resolve, reject) => {
      ExpManualScores.load.submitScores(scores)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }
  ExpManualScores.remoteMethod(
    'submitScores', {
      http: {path: '/submitScores', verb: 'post'},
      accepts: {arg: 'scores', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  ExpManualScores.remoteMethod(
    'summary', {
      http: {path: '/summary', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

}
