import app = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import {
  ChemicalLibraryResultSet,
  ExpAssay2reagentResultSet, ExpAssayResultSet, ExpDesignResultSet,
  ExpPlateResultSet,
  ExpScreenResultSet, ExpScreenUploadWorkflowResultSet,
  ModelPredictedCountsResultSet, RnaiLibraryResultSet, RnaiWormbaseXrefsResultSet,
} from "../../../types/sdk/models/index";
import {
  get,
  find,
  uniqBy,
  isEqual,
  slice,
  shuffle,
  isEmpty,
  groupBy,
} from 'lodash';
import Promise = require('bluebird');
import {ExpSetSearch, ExpSetSearchResults} from "../../../types/custom/ExpSetTypes/index";

import config = require('config');
import {ExpManualScoresResultSet} from "../../../types/sdk";

const ExpSet = app.models.ExpSet as (typeof WorkflowModel);


/**
 * ExpSet.extract.workflows.getExpSets is a wrapper around a bunch of other api points
 * @param data
 * @param search
 */
ExpSet.extract.workflows.getExpSets = function (search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    //come on compile!!!
    app.winston.info(`B: Search : ${JSON.stringify(search)}`);
    search = new ExpSetSearch(search);

    app.winston.info(`A: Search : ${JSON.stringify(search)}`);
    let data = new ExpSetSearchResults({});

    if (search.scoresQuery) {
      resolve(ExpSet.extract.workflows.filterByScores(search));
    } else if (isEqual(search.scoresExist, true)) {
      //search.scoresExist is a boolean value to say whether or not there exists an entry in the exp_manual_scores for a given treatmentGroupId
      //It does not do any further filtering
      //It uses the knex api, because it executes a nested select if exists, which is not possible through the loopback api
      resolve(ExpSet.extract.workflows.getUnscoredExpSet(search));
    } else if (isEqual(search.scoresExist, false)) {
      resolve(ExpSet.extract.workflows.getUnscoredExpSetsByPlate(search));
    } else if (isEqual(search.scoresExist, null) && !(isEmpty(search.rnaiSearch))) {
      //Search the RnaiLibrary Api
      resolve(app.models.RnaiExpSet.extract.workflows.getExpSetsByGeneList(search));
    } else if (isEqual(search.scoresExist, null) && !(isEmpty(search.chemicalSearch))) {
      //Place holder - I haven't written in this one yet
      app.winston.info(`TODO Chemical Exp Set`);
      resolve();
    } else {
      //Get all the expSets for a single expWorkflowId
      search.pageSize = 1;
      //Return the expSet
      resolve(ExpSet.extract.workflows.getExpSetsByWorkflowId(search));
    }

  });
};

/**
 * Build the 'where' manualScoresAdvancedQuery against the ExpAssay2reagent table (the main experiment table)
 * You need to use this function if you are querying against a specific set of genes or chemicals
 * Otherwise use the ExpWorkflowFunctions
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 * @returns {any[]}
 */
ExpSet.extract.buildQuery = function (data: ExpSetSearchResults, search: ExpSetSearch) {

  let or = [];

  let expOr = ['screen', 'expWorkflow', 'plate', 'expGroup', 'assay'].map((searchType) => {
    if (!isEmpty(search[`${searchType}Search`])) {
      let searchObject = {};
      searchObject[`${searchType}Id`] = {inq: search[`${searchType}Search`]};
      return searchObject;
    }
  }).filter((or) => {
    return or;
  });

  if (!isEmpty(data.rnaisList) && !isEmpty(data.compoundsList)) {
    let searchType = 'library';
    if (!isEmpty(search[`${searchType}Search`])) {
      let searchObject = {};
      searchObject[`${searchType}Id`] = {inq: search[`${searchType}Search`]};
      expOr.push(searchObject);
    }
  }
  return ExpSet.extract.buildReagentQuery(data, or, expOr);
};

ExpSet.extract.buildAssayDataQuery = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  let or = [];
  let expOr = ['plate', 'expGroup', 'assay'].map((searchType) => {
    if (!isEmpty(search[`${searchType}Search`])) {
      let searchObject = {};
      searchObject[`${searchType}Id`] = {inq: search[`${searchType}Search`]};
      return searchObject;
    }
  }).filter((or) => {
    return or;
  });
  return or;
};

ExpSet.extract.buildScreenDataQuery = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  let or = [];

  let expOr = ['screen', 'expWorkflow'].map((searchType) => {
    if (!isEmpty(search[`${searchType}Search`])) {
      let searchObject = {};
      searchObject[`${searchType}Id`] = {inq: search[`${searchType}Search`]};
      return searchObject;
    }
  }).filter((or) => {
    return or;
  });

  return expOr;
};

ExpSet.extract.buildReagentQuery = function (data: ExpSetSearchResults, or: Array<any>, expOr: Array<any>) {
  ['rnai', 'compounds'].map((reagentType) => {
    if (!isEmpty(data[`${reagentType}sList`])) {
      data[`${reagentType}sList`].map((Row) => {
        let obj: any = {
          and: [
            {reagentId: Row[`${reagentType}Id`]},
            {libraryId: Row.libraryId},
          ]
        };

        expOr.map((exp) => {
          obj.and.push(exp);
        });
        or.push(obj);
      });
    } else {
      let obj: any = {
        and: []
      };
      expOr.map((exp) => {
        obj.and.push(exp);
      });
      or.push(obj);
    }
  });

  return or;
};

ExpSet.extract.buildExpAssay2reagentSearch = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  let or = ExpSet.extract.buildQuery(data, search);
  return {
    where: {or: or, reagentId: {'neq': null}},
    limit: data.pageSize,
    skip: data.skip,
    // skip: search.currentPage * search.pageSize,
    fields: {
      assay2reagentId: true,
      reagentType: true,
      expGroupId: true,
      plateId: true,
      assayId: true,
      reagentId: true,
      libraryId: true,
      reagentTable: true,
    },
  };
};

/**
 /**
 * This is the main workflow
 * Once we have a set of expAssay2reagents, get the corresponding expAssays, includeCounts, expPlates, expScreens, and expWorkflows
 * Also generate an album for use in the interface
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.buildExpSets = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  return new Promise((resolve, reject) => {

    //TODO Ensure there are expAssayIds!
    if (isEmpty(data.expAssay2reagents)) {
      app.winston.error(JSON.stringify(data, null, 2));
      resolve(data);
    }

    // This ONLY returns the treat_rnai and ctrl_rnai  expGroups
    // ctrl_null and ctrl_strain are L4440s and don't have a reagentId
    app.models.ExpAssay
      .find({
        where: {
          assayId: {
            inq: data.expAssay2reagents.map((expAssay2reagent: ExpAssay2reagentResultSet) => {
              return expAssay2reagent.assayId;
            })
          }
        },
        fields: {
          screenId: true,
          expWorkflowId: true,
          expGroupId: true,
          assayImagePath: true,
          plateId: true,
          assayId: true
        },
      })
      .then((results: ExpAssayResultSet[]) => {
        //TODO if returning includeCounts also return ExpAssay is redundent
        // data['expAssays'] = contactSheetResults;
        data.expAssays = results;
        let expGroupIds = results.map((expAssay: ExpAssayResultSet) => {
          return {expGroupId: expAssay.expGroupId};
        });
        return app.models.ExpDesign.extract.workflows.getExpSets(expGroupIds);
      })
      .then((results: any) => {
        data.expSets = results.expDesigns;
        return ExpSet.extract.sanityChecks(data, search);
      })
      .then((results: ExpSetSearchResults) => {
        return ExpSet.extract.getCounts(results, search);
      })
      .then((results: ExpSetSearchResults) => {
        return ExpSet.extract.getExpManualScoresByExpGroupId(results, search);
      })
      .then((results: ExpSetSearchResults) => {
        return ExpSet.extract.workflows.getReagentData(results, search);
      })
      .then((results: ExpSetSearchResults) => {
        return ExpSet.extract.getExpData(results, search);
      })
      .then((data: ExpSetSearchResults) => {
        data = ExpSet.extract.genExpSetAlbums(data, search);
        data = ExpSet.extract.genExpGroupTypeAlbums(data, search);
        data = ExpSet.extract.insertCountsDataImageMeta(data);
        data = ExpSet.extract.insertExpManualScoresImageMeta(data);
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      })
  });
};

ExpSet.extract.getExpManualScoresByExpGroupId = function (data: ExpSetSearchResults, search ?: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    app.models.ExpManualScores
      .find({
        where: {
          treatmentGroupId: {
            inq: data.expAssay2reagents.map((expAssay2reagent) => {
              return expAssay2reagent.expGroupId;
            }).filter((expGroupId) => {
              return expGroupId;
            })
          }
        }
      })
      .then((expManualScores: ExpManualScoresResultSet[]) => {
        data.expManualScores = expManualScores;
        resolve(data);
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
};
/**
 * Depending on how the search is run (genes list, expGroup, etc)
 * We may be missing different pieces of data
 * For instance if we search by expGroup=1, up to here only expAssay2Reagent with expGroup=1 will be returned
 * Or if searching for genes we won't have any L4440s
 * So this is a very brute force approach to ensure there is no data missing
 * But we want the whole expSet
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.sanityChecks = function (data: ExpSetSearchResults, search ?: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    // This gets the ctrl_null and ctrl_strain includeCounts
    let ctrlExpGroupIds = [];
    let treatExpGroupIds = [];
    data.expSets.map((expSet) => {
      expSet.map((expDesign: ExpDesignResultSet) => {
        ctrlExpGroupIds.push({expGroupId: expDesign.controlGroupId});
        treatExpGroupIds.push({expGroupId: expDesign.treatmentGroupId});
      });
    });

    ctrlExpGroupIds = uniqBy(ctrlExpGroupIds, 'expGroupId');

    // @ts-ignore
    Promise.map(ctrlExpGroupIds, (ctrlExpGroupId) => {
      return app.models.ExpAssay
        .find({
          where: ctrlExpGroupId,
          limit: 10,
          fields: {
            plateId: true,
            screenId: true,
            expWorkflowId: true,
            expGroupId: true,
            assayImagePath: true,
            assayId: true
          },
        })
        .then((results: ExpAssayResultSet[]) => {
          results = shuffle(results);
          results = slice(results, 0, search.ctrlLimit);
          results.map((result) => {
            data.expAssays.push(result);
          });
          return;
        })
        .catch((error) => {
          app.winston.error(error);
          return new Error(error);
        })
    })
      .then(() => {
        return app.models.ExpAssay
          .find({
            where: {
              expGroupId: {
                inq: treatExpGroupIds.map((expGroup: any) => {
                  return expGroup.expGroupId;
                }),
              }
            }
          });
      })
      .then((expAssays: ExpAssayResultSet[]) => {
        expAssays.map((expAssay) => {
          data.expAssays.push(expAssay);
        });
        data.expAssays = uniqBy(data.expAssays, 'assayId');
      })
      .then(() => {
        return app.models.ExpAssay2reagent
          .find({
            where: {
              assayId: {
                inq: data.expAssays.map((expAssay) => {
                  return expAssay.assayId;
                }),
              },
              reagentId: {'neq': null}
            },
            fields: {
              screenId: true,
              expWorkflowId: true,
              treatmentGroupId: true,
              assay2reagentId: true,
              expGroupId: true,
              plateId: true,
              assayId: true,
              reagentId: true,
              libraryId: true,
              reagentType: true,
              reagentTable: true,
            },
          })
      })
      .then((results: ExpAssay2reagentResultSet[]) => {
        results.map((result) => {
          data.expAssay2reagents.push(result);
        });
        data.expAssay2reagents = uniqBy(data.expAssay2reagents, 'assay2reagentId');
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};

/**
 * Get the experimental data for this
 * ExpPlate, expScreen, and batchName
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.getExpData = function (data: ExpSetSearchResults, search?: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    app.models.ExpPlate
      .find({
        where: {
          plateId: {
            inq: data.expAssays.map((expAssay) => {
              return expAssay.plateId;
            }),
          }
        },
        fields: {
          plateId: true,
          instrumentPlateId: true,
          temperature: true,
          screenId: true,
          expWorkflowId: true,
          barcode: true,
        }
      })
      .then((expPlateResults: ExpPlateResultSet[]) => {
        data.expPlates = expPlateResults;
        return app.models.ExpScreen
          .find({
            where: {
              screenId: {
                inq: data.expPlates.map((expPlate) => {
                  return expPlate.screenId;
                })
              }
            }
          })
      })
      .then((expScreenResults: ExpScreenResultSet[]) => {
        data.expScreens = expScreenResults;

        return app.models.ExpScreenUploadWorkflow
          .find({
            where: {
              id: {
                inq: data.expAssays.map((expAssay) => {
                  return expAssay.expWorkflowId;
                })
              }
            },
            fields: {
              id: true,
              name: true,
              screenId: true,
              biosamples: true,
              assayDates: true,
              temperature: true,
              screenType: true,
              screenStage: true
            }
          })
      })
      .then((expWorkflowResults: ExpScreenUploadWorkflowResultSet[]) => {
        data.expWorkflows = expWorkflowResults;
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      })
  });
};

ExpSet.extract.getCounts = function (data: ExpSetSearchResults, search?: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    app.models.ModelPredictedCounts
      .find(
        {
          where: {
            assayId: {
              inq: data.expAssays.map((expAssay) => {
                return expAssay.assayId;
              }),
            }
          }
        }
      )
      .then((results: ModelPredictedCountsResultSet[]) => {
        data.modelPredictedCounts = results;
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });

  });
};

/**
 * TODO ADD in a function that will preferentially look for ctrls from the same plate
 * Then from the same date
 * Then just from the expSet
 * @param data
 * @param search
 */
ExpSet.extract.genExpSetAlbums = function (data?: ExpSetSearchResults, search?: ExpSetSearch) {
  app.winston.info(`In genExpSetAlbums`);
  data.expSets.map((expSet) => {
    let album: any = {};
    album.expWorkflowId = expSet[0].expWorkflowId;
    album.treatmentReagentId = expSet[0].treatmentGroupId;
    album.treatmentGroupId = expSet[0].treatmentGroupId;
    try {
      album.ctrlReagentId = find(expSet, (set: ExpDesignResultSet) => {
        return isEqual(set.controlGroupReagentType, 'ctrl_rnai') || isEqual(set.controlGroupReagentType, 'ctrl_compound') || isEqual(set.controlGroupReagentType, 'ctrl_chemical');
      }).controlGroupId;
    } catch (error) {
      // app.winston.error('There is no ctrl for the reagent!');
    }
    try {
      album.ctrlStrainId = find(expSet, (set: ExpDesignResultSet) => {
        return isEqual(set.controlGroupReagentType, 'ctrl_strain');
      }).controlGroupId;
    } catch (error) {
      // app.winston.error('There is no ctrl strain');
    }
    try {
      album.ctrlNullId = find(expSet, (set: ExpDesignResultSet) => {
        return isEqual(set.controlGroupReagentType, 'ctrl_null');
      }).controlGroupId;
    } catch (error) {
      // app.winston.error('There is no ctrl null');
    }

    ['treatmentReagent', 'ctrlReagent', 'ctrlStrain', 'ctrlNull'].map((expGroupType) => {
      album[`${expGroupType}Images`] = data.expAssays.filter((expAssay: ExpAssayResultSet) => {
        return isEqual(expAssay.expGroupId, album[`${expGroupType}Id`]);
      }).map((expAssay: ExpAssayResultSet) => {
        return ExpSet.extract[`buildImageObj${config.get('site')}`](expAssay);
      });
      album[`${expGroupType}Images`] = uniqBy(album[`${expGroupType}Images`], 'assayImagePath');
    });

    ['ctrlNullImages', 'ctrlStrainImages'].map((ctrlKey) => {
      if (get(album, ctrlKey)) {
        album[ctrlKey] = shuffle(album[ctrlKey]).slice(0, 4);
      }
    });

    data.albums.push(album);
  });

  return data;
};

/**
 * At the end of every workflow get all the reagent Data - RnaiLibrary or Chemical Library Data
 * @param data
 * @param search
 */
ExpSet.extract.workflows.getReagentData = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  let reagentTypes = groupBy(data.expAssay2reagents, 'reagentTable');
  delete reagentTypes['undefined'];

  return new Promise((resolve, reject) => {
    //@ts-ignore
    Promise.map(Object.keys(reagentTypes), (reagentType) => {
      if (reagentType) {
        return ExpSet.extract.workflows[`getReagentData${reagentType}`](data, reagentTypes[reagentType]);
      } else {
        return;
      }
    })
      .then(() => {
        resolve(data);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

ExpSet.extract.workflows.getReagentDataChemicalLibraryStock = function (data: ExpSetSearchResults, expAssay2reagents: ExpAssay2reagentResultSet[]) {
  return new Promise((resolve, reject) => {
    let or = [];
    expAssay2reagents.map((expAssay2reagent) => {
      if (expAssay2reagent.reagentId) {
        //TODO There is a bug in some of these uploads that the libraryId is 1 instead of whatever it should be
        //But the reagentId is uniqueue anyways
        or.push({and: [{compoundId: expAssay2reagent.reagentId}]});
      }
    });
    app.models.ChemicalLibrary
      .find({
        where: {or: or}
      })
      .then((results: ChemicalLibraryResultSet[]) => {
        data.compoundsList = results;
        resolve(data);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

ExpSet.extract.workflows.getReagentDataRnaiLibraryStock = function (data: ExpSetSearchResults, expAssay2reagents: ExpAssay2reagentResultSet[]) {
  return new Promise((resolve, reject) => {
    let or = expAssay2reagents.map((expAssay2reagent) => {
      return {and: [{rnaiId: expAssay2reagent.reagentId}, {libraryId: expAssay2reagent.libraryId}]};
    });
    app.models.RnaiLibrary
      .find({
        where: {or: or}
      })
      .then((results: RnaiLibraryResultSet[]) => {
        data.rnaisList = results;
        return app.models.RnaiWormbaseXrefs
          .find({
            where: {
              wbGeneSequenceId: {
                inq: data.rnaisList.map((rnai) => {
                  return rnai.geneName;
                })
              }
            },
            fields: {
              wbGeneSequenceId: true,
              wbGeneAccession: true,
              wbGeneCgcName: true,
            },
            limit: 1000,
          });
      })
      .then((results: RnaiWormbaseXrefsResultSet[]) => {
        data.rnaisXrefs = results;
        resolve(data);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};


/**
 * Build the image URLS based on the site
 * By default the
 * @param expAssay
 */
ExpSet.extract.buildImageObjDEV = function (expAssay: ExpAssayResultSet) {
  return {
    assayImagePath: expAssay.assayImagePath,
    src: `${config.get('sites')['DEV']['imageUrl']}/${expAssay.assayImagePath}-autolevel.jpeg`,
    caption: `Image ${expAssay.assayImagePath} caption here`,
    thumb: `${config.get('sites')['DEV']['imageUrl']}/${expAssay.assayImagePath}-autolevel-600x600.jpeg`,
    assayId: expAssay.assayId,
    plateId: expAssay.plateId,
  };
};

ExpSet.extract.buildImageObjAD = function (expAssay: ExpAssayResultSet) {
  return {
    assayImagePath: expAssay.assayImagePath,
    src: `${config.get('sites')['AD']['imageUrl']}/${expAssay.assayImagePath}-autolevel.jpeg`,
    caption: `Image ${expAssay.assayImagePath} caption here`,
    thumb: `${config.get('sites')['DEV']['imageUrl']}/${expAssay.assayImagePath}-autolevel-600x600.jpeg`,
    assayId: expAssay.assayId,
    plateId: expAssay.plateId,
  };
};

ExpSet.extract.buildImageObjNY = function (expAssay: ExpAssayResultSet) {
  return {
    assayImagePath: expAssay.assayImagePath,
    src: `${config.get('sites')['NY']['imageUrl']}/${expAssay.assayImagePath}.bmp`,
    caption: `Image ${expAssay.assayImagePath} caption here`,
    thumb: `${config.get('sites')['NY']['imageUrl']}/${expAssay.assayImagePath}.bmp`,
    assayId: expAssay.assayId,
    plateId: expAssay.plateId,
  };
};

