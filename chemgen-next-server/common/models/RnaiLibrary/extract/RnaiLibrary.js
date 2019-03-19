"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var wellData_1 = require("../../../types/custom/wellData");
var models_1 = require("../../../types/sdk/models");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var RnaiLibrary = app.models['RnaiLibrary'];
//TODO This should have specific logic per instrument
//TODO This also has different logic per library
//RNAi only has 1 (so far), but chemical has at least 2
//Here we can map A01 -> A01
//But in NY its TileThing -> Well
RnaiLibrary.extract.parseLibraryResults = function (workflowData, expPlate, libraryResults) {
    return new Promise(function (resolve, reject) {
        var allWells = workflowData.wells;
        var barcode = expPlate.barcode;
        var plateId = expPlate.plateId;
        var platedbXrefSearch = [];
        allWells.map(function (well) {
            var libraryResult = RnaiLibrary.helpers.genLibraryResult(barcode, libraryResults, well);
            //WTF IS THIS
            if (lodash_1.get(libraryResult, 'geneName')) {
                var where = {
                    wbGeneSequenceId: libraryResult.geneName,
                };
                platedbXrefSearch.push({
                    wbGeneSequenceId: libraryResult.geneName,
                });
            }
        });
        //TODO Need to incorporate multiple wells
        //TODO add check for plateDbXref < - if its empty this will get the whole table!!
        app.models.RnaiWormbaseXrefs.find({ where: { or: platedbXrefSearch }, limit: 1000 })
            .then(function (dbXrefs) {
            //@ts-ignore
            return Promise.map(allWells, function (well) {
                var createStocks = [];
                var parentLibraryResults = [];
                var libraryResult = RnaiLibrary.helpers.genLibraryResult(barcode, libraryResults, well);
                return app.models.RnaiWormbaseXrefs.extract.genTaxTerms(dbXrefs, {
                    where: {
                        wbGeneSequenceId: libraryResult.geneName,
                    },
                })
                    .then(function (wormTaxTerms) {
                    // TODO Add taxTerms per library / screenStage
                    var taxTerms = [];
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
                    var createStock = new models_1.RnaiLibraryStockResultSet({
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
                    return new wellData_1.WellCollection({
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
            });
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
RnaiLibrary.extract.workflows.getRnaiLibraryFromUserGeneList = function (genes, search) {
    return new Promise(function (resolve, reject) {
        RnaiLibrary.extract.getGeneXRefs(genes, search)
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
/**
 * First do a (kind of) full text search on the RnaiWormbaseXrefs table
 * Then go back to the RnaiLibrary table to get these
 * @param {Array<string>} genes
 * @param {object} search
 */
RnaiLibrary.extract.getGeneXRefs = function (genes, search) {
    return new Promise(function (resolve, reject) {
        if (lodash_1.isEmpty(genes) || lodash_1.isNull(genes)) {
            resolve([]);
        }
        else {
            var or_1 = [];
            genes.map(function (gene) {
                or_1.push({ wbGeneSequenceId: gene });
                or_1.push({ wbGeneCgcName: gene });
            });
            app.models.RnaiWormbaseXrefs
                .find({ where: { or: or_1 } })
                .then(function (results) {
                return RnaiLibrary.extract.getFromGeneLibrary(genes, results, search);
            })
                .then(function (results) {
                results = JSON.parse(JSON.stringify(results));
                resolve(results);
            })
                .catch(function (error) {
                app.winston.error(error);
                reject(new Error(error));
            });
        }
    });
};
RnaiLibrary.extract.getFromGeneLibrary = function (genesList, geneXrefs, search) {
    return new Promise(function (resolve, reject) {
        var or = [];
        if (lodash_1.isEmpty(geneXrefs)) {
            // If the geneXrefs is empty, just return an empty result set
            // Otherwise it will pull the entire RnaiLibrary table
            resolve([]);
        }
        else {
            geneXrefs.map(function (geneXref) {
                var obj = {
                    and: [
                        { geneName: geneXref.wbGeneSequenceId },
                    ],
                };
                if (search instanceof Object) {
                    obj.and.push(search);
                }
                else if (search instanceof Array) {
                    search.map(function (s) {
                        obj.and.push(s);
                    });
                }
                or.push(obj);
            });
            app.models.RnaiLibrary
                .find({ where: { or: or } })
                .then(function (results) {
                results.map(function (result) {
                    var geneXref = lodash_1.find(geneXrefs, function (geneXref) {
                        return lodash_1.isEqual(String(geneXref.wbGeneSequenceId), String(result.geneName));
                    });
                    result['wbGeneCgcName'] = geneXref.wbGeneCgcName;
                    var origGene = lodash_1.find(genesList, function (userGene) {
                        return lodash_1.isEqual(userGene, result.geneName) || lodash_1.isEqual(userGene, geneXref.wbGeneCgcName);
                    });
                    result['UserSuppliedDef'] = origGene['Gene name'];
                });
                resolve(results);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
    });
};
//# sourceMappingURL=RnaiLibrary.js.map