'use strict'

/**
 * Exp Set API Declarations
 * This is where all of the REST APIs are declared
 * The majority of the API used for the front end interfaces are declared here
 */

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
    require('../extract/scoring/ExpSetScoringExtractInteresting')
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
        reject(new Error('expSetSearch field must include a method'))
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
   * It tries to look at the parameters of the expSetSearch and figure out what you're looking for
   * But its better to use one of other functions
   * @param search
   * @param cb
   * @returns {Promise}
   */
  ExpSet.getExpSets = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getExpSets(search)
        .then((results) => {
          console.log('resolving data')
          resolve(results)
        })
        .catch((error) => {
          console.error(error)
          reject(new Error(error))
        })
    })
  }

  /**
   * Given an expGroupId (or other ExpAssay2reagent search criteria) get related expSets
   * @param search
   * @param cb
   * @returns {Promise}
   */
  ExpSet.getRelatedExpSets = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getRelatedExpSets(search)
        .then((results) => {
          console.log('resolving data')
          resolve(results)
        })
        .catch((error) => {
          console.error(error)
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
   * Begin - Get ExpSets with filters for scored / not scored
   * Scored interesting / not scored interesting
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
   * This is then fed into the 'Contact Sheet Plate View' interface
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
   * End - Get ExpSets with filters for scored / not scored
   * Scored interesting / not scored interesting
   */

  /**
   * Begin - Scored Summary Interfaces
   * APIs that return data to summary interfaces for scored/not scored
   */

  /**
   * Get ExpSets that were scored as FIRST_PASS interesting
   * @param search
   * @param cb
   * @returns {Promise}
   */
  ExpSet.getInterestingExpSets = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getInterestingExpSets(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  /**
   * Get ExpSets that have a detailed score
   * @param search
   * @param cb
   * @returns {Promise}
   */
  ExpSet.getScoredExpSets = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getScoredExpSets(search)
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

  /**
   * Get batches that haven't been scored in the contact sheet
   * @param search
   * @returns {Promise}
   */
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

  /**
   * From a list of reagents, sjj_something, mel-28, WBSTUFF
   * Get a list of corresponding expsets (actual experiment data)
   * @param search
   * @returns {Promise}
   */
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

  /**
   * This takes as its input an array of library data
   * @param search: Array<{libraryId, reagentId}>
   * @returns {Promise}
   */
  ExpSet.getExpSetsByLibraryData = function (search) {
    return new Promise((resolve, reject) => {
      return ExpSet.extract.getExpSetsByLibraryData(search)
        .then((expWorkflowIds) => {
          resolve(expWorkflowIds)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  /**
   * This is a general expSetSearch that does not have any filters for scored/not scored
   * @param search
   * @returns {Promise}
   */
  ExpSet.searchExpAssay2reagents = function (search) {
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
   * Maps to the function ExpSet.getExpSets(expSetSearch)
   */
  ExpSet.remoteMethod(
    'getExpSets', {
      http: {path: '/getExpSets', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  ExpSet.remoteMethod(
    'getRelatedExpSets', {
      http: {path: '/getRelatedExpSets', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )
  ExpSet.remoteMethod(
    'getExpSetsByLibraryData', {
      http: {path: '/getExpSetsByLibraryData', verb: 'post'},
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

  // ExpSet.extract.searchExpAssay2reagents = function (expSetSearch: ExpSetSearch) {
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
    'getInterestingExpSets', {
      http: {path: '/getInterestingExpSets', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )
  ExpSet.remoteMethod(
    'getScoredExpSets', {
      http: {path: '/getScoredExpSets', verb: 'post'},
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
