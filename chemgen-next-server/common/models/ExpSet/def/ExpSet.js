'use strict'

module.exports = function (ExpSet) {
  ExpSet.helpers = {}
  ExpSet.load = {}
  ExpSet.load.workflows = {}
  ExpSet.extract = {}
  ExpSet.extract.workflows = {}
  ExpSet.transform = {}
  ExpSet.transform.workflows = {}

  ExpSet.on('attached', function () {
    require('../extract/ExpSetExtract')
    require('../extract/ExpSetExtractPagination')
    require('../extract/ExpSetExtractQueryByExpWorkflow')
    require('../extract/ExpSetExtractQueryByAssay')
    require('../extract/scoring/ExpSetScoringExtract')
    require('../extract/scoring/ExpSetScoringExtractByBatchQC')
    require('../extract/scoring/ExpSetScoringExtractByCounts')
    require('../extract/scoring/ExpSetScoringExtractByPlate')
    require('../extract/scoring/ExpSetScoringExtractByManualScores')
    require('../extract/predict/ExpSetPredictPhenotype')
    require('../extract/ExpSetResults')
    require('../../../search/ExpSetSearchByExpWorkflow')
    require('../../../search/ExpSetSearchSQLHelpers')
  })

  /**
   * Search ExpWorkflow Model by temperature, wormStrain, plateIds, etc
   * and resolve a list of workflow IDs
   * @param search
   * @param cb
   * @returns {Promise}
   */
  ExpSet.searchByExpWorkflowData = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.searchByExpWorkflowData(search)
        .then((ids) => {
          resolve(ids)
        })
        .catch((error) => {
          resolve([])
        })
    })
  }

  /**
   * WIP - This works, but isn't really exposed anywhere yet
   * @param search
   * @param cb
   * @returns {Promise}
   */
  ExpSet.getTabularData = function (search, cb) {
    return new Promise((resolve, reject) => {
      if (!search.method) {
        reject(new Error('search field must include a method'))
      } else {
        ExpSet.extract.workflows[search.method](search)
          .then((results) => {
            resolve(results)
          })
          .catch((error) => {
            reject(new Error(error))
          })
      }
    })
  }

  /**
   * Begin - Get ExpSet Methods
   * These methods get ExpSets, irrespective of whether or not they have been scored
   */

  /**
   * This is the most generic method for fetching some expSets
   * It tries to look at the parameters of the search and figure out what you're looking for
   * But its better to use one of other functions
   * @param search
   * @param cb
   * @returns {Promise}
   */
  ExpSet.getExpSets = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getExpSets(search)
        .then((results) => {
          console.log('resolving data');
          resolve(results)
        })
        .catch((error) => {
          console.error(error);
          reject(new Error(error))
        })
    })
  }

  ExpSet.getExpSetsByExpGroupId = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.searchExpAssay2reagents(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  ExpSet.getExpSetsByWorkflowId = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getExpSetsByWorkflowId(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }
  /**
   * End - Get ExpSet Methods
   */

  /**
   * Begin - Get UnScored ExpSet Methods
   * Get ExpSets based on whether or not they have been scored
   * (The querying API is different from the default loopback API, so they go in their own methods)
   */
  ExpSet.getUnScoredExpSets = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getUnscoredExpSets(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  ExpSet.getUnscoredExpWorkflowsByQCBatch = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getUnscoredExpWorkflowsByQCBatch(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  /**
   * Get the expSets that are queued up in the FIRST_PASS scoring
   * And return them to the frontend for more detailed scoring
   * @param search
   * @param cb
   * @returns {Promise}
   */
  ExpSet.getUnscoredExpSetsByFirstPass = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getUnscoredExpSetsByFirstPass(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  ExpSet.getUnScoredExpSetsByCounts = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getUnscoredExpSetsByCounts(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  /**
   * Grab a plate with wells that haven't gone through the first pass
   * @param search
   * @param cb
   * @returns {Promise}
   */
  ExpSet.getUnScoredExpSetsByPlate = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getUnscoredExpSetsByPlate(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  /**
   * Get a distinct list of temperatures from the ExpWorkflows
   * @param search
   * @returns {Promise}
   */
  ExpSet.getAllTemperatures = function (search) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.getAllTemperatures(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  ExpSet.getExpWorkflowIdsNotScoredContactSheet = function (search) {
    return new Promise((resolve, reject) => {
      return ExpSet.extract.workflows.getExpWorkflowIdsNotScoredContactSheet(search)
        .then((expWorkflowIds) => {
          resolve(expWorkflowIds)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  ExpSet.getExpSetsByRNAiReagentData = function (search) {
    return new Promise((resolve, reject) => {
      return ExpSet.extract.getExpSetsByRNAiReagentData(search)
        .then((expWorkflowIds) => {
          resolve(expWorkflowIds)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  //searchByExpGroupIds
  ExpSet.searchExpAssay2reagents = function(search){
    return new Promise((resolve, reject) => {
      return ExpSet.extract.searchExpAssay2reagents(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  /**
   * Add Remote Methods
   * These have a direct one-to-one mapping to their functions, above
   */

  /**
   * Maps to the function ExpSet.getExpSets(search)
   */
  ExpSet.remoteMethod(
    'getExpSets', {
      http: {path: '/getExpSets', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  ExpSet.remoteMethod(
    'getExpSetsByWorkflowId', {
      http: {path: '/getExpSetsByWorkflowId', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  ExpSet.remoteMethod(
    'getUnScoredExpSets', {
      http: {path: '/getUnScoredExpSets', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  ExpSet.remoteMethod(
    'getUnScoredExpSetsByCounts', {
      http: {path: '/getUnScoredExpSetsByCounts', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  ExpSet.remoteMethod(
    'getUnScoredExpSetsByPlate', {
      http: {path: '/getUnScoredExpSetsByPlate', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  ExpSet.remoteMethod(
    'getUnscoredExpSetsByFirstPass', {
      http: {path: '/getUnscoredExpSetsByFirstPass', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  ExpSet.remoteMethod(
    'getUnscoredExpWorkflowsByQCBatch', {
      http: {path: '/getUnscoredExpWorkflowsByQCBatch', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  ExpSet.remoteMethod(
    'getTabularData', {
      http: {path: '/getTabularData', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  ExpSet.remoteMethod(
    'searchByExpWorkflowData', {
      http: {path: '/searchByExpWorkflowData', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  // ExpSet.extract.searchExpAssay2reagents = function (search: ExpSetSearch) {
  ExpSet.remoteMethod(
    'searchExpAssay2reagents', {
      http: {path: '/searchExpAssay2reagents', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  ExpSet.remoteMethod(
    'getAllTemperatures', {
      http: {path: '/getAllTemperatures', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  ExpSet.remoteMethod(
    'getExpWorkflowIdsNotScoredContactSheet', {
      http: {path: '/getExpWorkflowIdsNotScoredContactSheet', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  ExpSet.remoteMethod(
    'getExpSetsByRNAiReagentData', {
      http: {path: '/getExpSetsByRNAiReagentData', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )
}
