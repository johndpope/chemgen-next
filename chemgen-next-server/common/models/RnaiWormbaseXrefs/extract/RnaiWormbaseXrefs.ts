import app  = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import decamelize = require('decamelize');
import Promise = require('bluebird');
import {filter, find, isEqual} from 'lodash';
import {RnaiLibraryResultSet, RnaiWormbaseXrefsResultSet} from "../../../types/sdk/models";

const RnaiWormbaseXrefs = app.models.RnaiWormbaseXrefs as (typeof WorkflowModel);

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
    let results: any = filter(rows, where);
    let taxTerms = [];
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
RnaiWormbaseXrefs.extract.fullText = function (genes: string[]) {
  return new Promise((resolve, reject) => {
    let or = [];
    genes.map((gene) => {
      or.push({wbGeneSequenceId: gene});
      or.push({wbGeneCgcName: gene});
    });
    return new Promise((resolve, reject) => {
      app.models.RnaiWormbaseXrefs
        .find({where: {or: or}})
        .then((results: RnaiWormbaseXrefsResultSet[]) => {
          resolve(results);
        })
        .then((results) => {
          resolve(results);
        })
        .catch((error) => {
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
  let or = [];
  geneXrefs.map((geneXref) => {
    let and: any = [
      {geneName: geneXref.wbGeneSequenceId},
    ];
    Object.keys(searchParams).map((searchParamsKey) => {
      let t1 = {};
      t1[searchParamsKey] = searchParams[searchParamsKey];
      and.push(t1);
    });
    let obj = {
      and: and
    };
    or.push(obj);
  });

  return new Promise((resolve, reject) => {
    app.models.RnaiLibrary
      .find({where: {or: or}})
      .then((results: RnaiLibraryResultSet[]) => {
        // console.log('Returning from RNAi Library');
        results.map((result) => {
          let geneXref: RnaiWormbaseXrefsResultSet = find(geneXrefs, (geneXref) => {
            return isEqual(geneXref.wbGeneSequenceId, result.geneName);
          });
          result['wbGeneCgcName'] = geneXref.wbGeneCgcName;
          let origGene = find(origGeneList, (row) => {
            return isEqual(row['Gene name'], result.geneName) || isEqual(row['Gene name'], geneXref.wbGeneCgcName);
          });
          result['Annotation'] = origGene['Annotation'];
          result['Name'] = origGene['Gene name'];
        });
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });

}
