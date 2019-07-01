"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var decamelize = require("decamelize");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var RnaiWormbaseXrefs = app.models.RnaiWormbaseXrefs;
/*
where: {
   wbGeneAccession: data.gene_id
 }
 In the RNAI Ahringer library this is geneName
 gene_id / wb_gene_accession
 public_name / wb_gene_cgc_name
 molecular_name / wb_gene_sequence_id
*/
RnaiWormbaseXrefs.extract.genTaxTerms = function (rows, where) {
    return new Promise(function (resolve, reject) {
        var results = lodash_1.filter(rows, where);
        var taxTerms = [];
        results = JSON.stringify(results);
        results = JSON.parse(results);
        results.forEach(function (result) {
            Object.keys(result).map(function (key) {
                if (result[key]) {
                    taxTerms.push({
                        taxonomy: decamelize(key),
                        taxTerm: result[key],
                    });
                }
            });
        });
        resolve({
            xrefs: results,
            taxTerms: taxTerms,
        });
    });
};
/**
 *
 * Given a list of genes, perform a pseudo full text expSetSearch
 * @param {string[]} genes
 */
RnaiWormbaseXrefs.extract.fullText = function (genes) {
    return new Promise(function (resolve, reject) {
        var or = [];
        genes.map(function (gene) {
            or.push({ wbGeneSequenceId: gene });
            or.push({ wbGeneCgcName: gene });
        });
        return new Promise(function (resolve, reject) {
            app.models.RnaiWormbaseXrefs
                .find({ where: { or: or } })
                .then(function (results) {
                resolve(results);
            })
                .then(function (results) {
                resolve(results);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        });
    });
};
/**
 * WIP
 * Given a csv of a gene list and annotations, map these back to the RnaiWormbaseXrefs
 * @param origGeneList
 * @param genesList
 * @param geneXrefs
 * @param searchParams
 */
function getFromGeneLibrary(origGeneList, genesList, geneXrefs, searchParams) {
    // console.log('In getFromGeneLibrary');
    var or = [];
    geneXrefs.map(function (geneXref) {
        var and = [
            { geneName: geneXref.wbGeneSequenceId },
        ];
        Object.keys(searchParams).map(function (searchParamsKey) {
            var t1 = {};
            t1[searchParamsKey] = searchParams[searchParamsKey];
            and.push(t1);
        });
        var obj = {
            and: and
        };
        or.push(obj);
    });
    return new Promise(function (resolve, reject) {
        app.models.RnaiLibrary
            .find({ where: { or: or } })
            .then(function (results) {
            // console.log('Returning from RNAi Library');
            results.map(function (result) {
                var geneXref = lodash_1.find(geneXrefs, function (geneXref) {
                    return lodash_1.isEqual(geneXref.wbGeneSequenceId, result.geneName);
                });
                result['wbGeneCgcName'] = geneXref.wbGeneCgcName;
                var origGene = lodash_1.find(origGeneList, function (row) {
                    return lodash_1.isEqual(row['Gene name'], result.geneName) || lodash_1.isEqual(row['Gene name'], geneXref.wbGeneCgcName);
                });
                result['Annotation'] = origGene['Annotation'];
                result['Name'] = origGene['Gene name'];
            });
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
//# sourceMappingURL=RnaiWormbaseXrefs.js.map