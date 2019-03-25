import app = require('../../../../server/server.js');
import {WellCollection} from "../../../types/custom/wellData";
import {
  ExpPlateResultSet,
  RnaiLibraryResultSet,
  RnaiWormbaseXrefsResultSet,
  RnaiLibraryStockResultSet
} from "../../../types/sdk/models";
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');
import {get, isArray, isNull, isEmpty, find, isEqual} from 'lodash';
// import {ExpSetSearch} from "../../RnaiExpSet/load/RnaiExpSet";
import {ExpSetSearch} from "../../../types/custom/ExpSetTypes/index";

const RnaiLibrary = app.models['RnaiLibrary'] as (typeof WorkflowModel);

//TODO This should have specific logic per instrument
//TODO This also has different logic per library
//RNAi only has 1 (so far), but chemical has at least 2
//Here we can map A01 -> A01
//But in NY its TileThing -> Well
RnaiLibrary.extract.parseLibraryResults = function (workflowData, expPlate: ExpPlateResultSet, libraryResults: RnaiLibraryResultSet[]) {
  return new Promise(function (resolve, reject) {
    let allWells = workflowData.wells;
    let barcode = expPlate.barcode;
    let plateId = expPlate.plateId;

    let platedbXrefSearch = [];
    allWells.map((well) => {
      let libraryResult: RnaiLibraryResultSet = RnaiLibrary.helpers.genLibraryResult(barcode, libraryResults, well);
      //WTF IS THIS
      if (get(libraryResult, 'geneName')) {
        let where = {
          wbGeneSequenceId: libraryResult.geneName,
        };
        platedbXrefSearch.push({
          wbGeneSequenceId: libraryResult.geneName,
        });
      }
    });

    //TODO Need to incorporate multiple wells
    //TODO add check for plateDbXref < - if its empty this will get the whole table!!
    app.models.RnaiWormbaseXrefs.find({where: {or: platedbXrefSearch}, limit: 1000})
      .then((dbXrefs) => {
        //@ts-ignore
        return Promise.map(allWells, function (well) {
          let createStocks = [];
          let parentLibraryResults = [];
          let libraryResult: RnaiLibraryResultSet = RnaiLibrary.helpers.genLibraryResult(barcode, libraryResults, well);
          return app.models.RnaiWormbaseXrefs.extract.genTaxTerms(dbXrefs, {
            where: {
              wbGeneSequenceId: libraryResult.geneName,
            },
          })
            .then(function (wormTaxTerms) {
              // TODO Add taxTerms per library / screenStage
              let taxTerms = [];
              // For secondary plates we need to add an additional taxTerm for control wells
              wormTaxTerms.taxTerms.forEach(function (wormTaxTerm) {
                taxTerms.push(wormTaxTerm);
              });

              //In the primary screen we have an entire barcode with L4440s
              if (barcode.match('L4440')) {
                taxTerms.push({
                  taxonomy: 'wb_gene_sequence_id',
                  taxTerm: 'L4440'
                });
                libraryResult.geneName = 'L4440';
              }
              //In the secondary screen we have just genes
              else if (libraryResult.geneName === 'empty') {
                taxTerms.push({
                  taxonomy: 'wb_gene_sequence_id',
                  taxTerm: 'empty'
                });
                libraryResult.geneName = 'empty';
              }
              if (wormTaxTerms.taxTerms.length === 0) {
                taxTerms.push({
                  taxonomy: 'wb_gene_sequence_id',
                  taxTerm: libraryResult.geneName,
                });
              }

              //This is the skeleton for the stock creator
              //But it does not actually get created until
              //The assay is created
              // @ts-ignore
              let createStock: RnaiLibraryStockResultSet = new RnaiLibraryStockResultSet({
                plateId: plateId,
                libraryId: workflowData.libraryId,
                rnaiId: libraryResult.rnaiId,
                well: well,
                //These should be in the workflowData
                location: '',
                datePrepared: workflowData.stockPrepDate,
                preparedBy: '',
              });

              // @ts-ignore
              return new WellCollection({
                well: well,
                stockLibraryData: createStock,
                parentLibraryData: libraryResult,
                annotationData: {
                  geneName: libraryResult.geneName,
                  taxTerm: libraryResult.geneName,
                  taxTerms: taxTerms,
                  dbXRefs: wormTaxTerms.xrefs
                }
              });
            });
        })
      })
      .then(function (results) {
        resolve(results);
      })
      .catch(function (error) {
        app.winston.error(error.stack);
        reject(new Error(error));
      });

  });
};


/**
 * This workflow is for getting an arbitrary defined (probably user) list of genes, along with their Xrefs
 * Generally users ask for either the gene name or the wormbase name - aap-1 or KCGBLAHBLSH
 * ExpSetSearch should be something like : {chrom: 'I'}
 * @param {Array<string>} genes
 * @param {object} search
 */
RnaiLibrary.extract.workflows.getRnaiLibraryFromUserGeneList = function (genes: Array<string>, search?: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    RnaiLibrary.extract.getGeneXRefs(genes, search)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  })
};

/**
 * First do a (kind of) full text search on the RnaiWormbaseXrefs table
 * Then go back to the RnaiLibrary table to get these
 * @param {Array<string>} genes
 * @param {object} search
 */
RnaiLibrary.extract.getGeneXRefs = function (genes: Array<string>, search?: object) {
  return new Promise((resolve, reject) => {
    if (isEmpty(genes) || isNull(genes)) {
      resolve([]);
    } else {
      let or = [];
      genes.map((gene) => {
        or.push({wbGeneSequenceId: {like: gene}});
        or.push({wbGeneCgcName: {like: gene}});
      });
      app.models.RnaiWormbaseXrefs
        .find({where: {or: or}})
        .then((results: RnaiWormbaseXrefsResultSet[]) => {
          return RnaiLibrary.extract.getFromGeneLibrary(genes, results, search);
        })
        .then((results) => {
          results = JSON.parse(JSON.stringify(results));
          resolve(results);
        })
        .catch((error) => {
          app.winston.error(error);
          reject(new Error(error));
        });
    }
  });
};

RnaiLibrary.extract.getFromGeneLibrary = function (genesList: Array<string>, geneXrefs: RnaiWormbaseXrefsResultSet[], search?: any) {
  return new Promise((resolve, reject) => {
    app.winston.info('Got some gene xrefs');
    app.winston.info(JSON.stringify(geneXrefs));
    let or = [];
    if (get(search, 'rnaiList')) {
      if (isArray(search.rnaiList)) {
        search.rnaiList.map((s) => {
          or.push({geneName: {like: s}});
        });
      }
    }
    if (isEmpty(geneXrefs)) {
      // If the geneXrefs is empty, just return an empty result set
      // Otherwise it will pull the entire RnaiLibrary table
      resolve([]);
    } else {
      geneXrefs.map((geneXref) => {
        let obj: any = {
          and: [
            {geneName: geneXref.wbGeneSequenceId},
          ],
        };
        or.push(obj);
      });

      app.models.RnaiLibrary
        .find({where: {or: or}})
        .then((results: RnaiLibraryResultSet[]) => {
          results.map((result) => {
            let geneXref: RnaiWormbaseXrefsResultSet = find(geneXrefs, (geneXref) => {
              return isEqual(String(geneXref.wbGeneSequenceId), String(result.geneName));
            });
            if (geneXref) {
              result['wbGeneCgcName'] = geneXref.wbGeneCgcName;
              let origGene = find(genesList, (userGene) => {
                return isEqual(userGene, result.geneName) || isEqual(userGene, geneXref.wbGeneCgcName);
              });
              result['UserSuppliedDef'] = origGene['Gene name'];
            }
          });
          resolve(results);
        })
        .catch((error) => {
          reject(new Error(error));
        });
    }
  });
};

RnaiLibrary.extract.getFromUpdatedGeneMappingLibrary = function (genesList: Array<string>,  search?: any) {
  return new Promise((resolve, reject) => {
    let or = [];
    if (get(search, 'rnaiList') && isArray(search.rnaiList)) {
      search.rnaiList.map((s) => {
        or.push({reagentName: {like: s}});
        or.push({primaryTargetGeneId: {like: s}});
        or.push({primaryTargetGeneSystematicName: {like: s}});
        or.push({primaryTargetGeneCommonName: {like: s}});
      });
      app.winston.info('Search Object');
      app.winston.info(JSON.stringify(or));
      app.models.RnaiLibrary
        .find({where: {or: or}})
        .then((results: RnaiLibraryResultSet[]) => {
          results.map((result) => {
            //TODO This is a triage step - the interface expects to see something called wbGeneCgc Name
            result['wbGeneCgcName'] = result.primaryTargetGeneCommonName;
            let origGene = find(genesList, (userGene) => {
              return isEqual(userGene, result.primaryTargetGeneCommonName) || isEqual(userGene, result.primaryTargetGeneId)
                || isEqual(userGene, result.primaryTargetGeneSystematicName) || isEqual(userGene, result.reagentName);
            });
            result['UserSuppliedDef'] = origGene['Gene name'];
          });
          resolve(results);
        })
        .catch((error) => {
          reject(new Error(error));
        });
    } else {
      resolve([]);
    }

  });
};
