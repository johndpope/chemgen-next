#!/usr/bin/env node

const app = require('../../server/server');
// import {WorkflowModel} from "../../common/models";
import Promise = require('bluebird');
import {
  ExpAssay2reagentResultSet,
  ExpAssayResultSet,
  ExpDesignResultSet, ExpGroupResultSet, ExpScreenResultSet, ModelPredictedCountsResultSet, ModelPredictedRankResultSet,
  RnaiLibraryResultSet,
  RnaiWormbaseXrefsResultSet
} from "../../common/types/sdk/models";
import Papa = require('papaparse');
import {camelCase, pick, get, shuffle, groupBy, filter, uniq, isEqual, find, isNull, isEmpty, slice} from 'lodash';
import {sortBy, reverse, floor, subtract, mean, min, max} from 'lodash';

const path = require('path');
const fs = require('fs');

let genesFile = path.resolve(__dirname, 'complete_gene_list.csv');
let chrom1 = [];
let genes = [];
let orig = [];

// TODO - This needs to be reworked
// TODO - ExpGroup no longer has reagentId (should have never had reagentId)
// TODO - Need to instead get them straight from assay2Reagent table
/***
 * WIP
 * This is a custom analysis, that is a getting turned into an interface
 * This particular analysis got a list of genes, and gets them across screens, and then ranks them (I hope).
 * Another way to do this would be to manualScoresAdvancedQuery by a screen, and say 'whats interesting' here.
 * For custom analyses like this - I want to set up a mongodb collection, where we can just stick stuff
 * Assign it an ID and stick it in a dashboard
 ***/

parseGenesFile();

function parseGenesFile() {
  Papa.parse(fs.createReadStream(genesFile), {
    header: true,
    step: function (results, parser) {
      orig.push(results.data[0]);
      if (results.data[0]['Gene name']) {
        genes.push(results.data[0]['Gene name']);
      }
    },
    complete: function () {
      genes = uniq(genes);
      // genes = shuffle(genes);
      // genes = slice(genes, 0, 20);
      getGeneXRefs(genes);
    },
  });
}

function getGeneXRefs(genes) {
  console.log('In getGeneXrefs');
  let or = [];
  genes.map((gene) => {
    or.push({wbGeneSequenceId: gene});
    or.push({wbGeneCgcName: gene});
  });
  return new Promise((resolve, reject) => {
    app.models.RnaiWormbaseXrefs
      .find({where: {or: or}})
      .then((results: RnaiWormbaseXrefsResultSet[]) => {
        console.log(`RNAi XRefs Count: ${results.length}`);
        return getFromGeneLibrary(genes, results);
      })
      .then((results) => {
        results = JSON.parse(JSON.stringify(results));
        // contactSheetResults = slice(contactSheetResults, 0, 5);
        // let csv = Papa.unparse(contactSheetResults);
        // fs.writeFileSync(path.resolve(__dirname,'chromI_list.csv'), csv);
        //TODO Split this manualScoresAdvancedQuery
        return getExpDesign(results);
      })
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function getBioSamples(data) {
  return new Promise((resolve, reject) => {
    app.models.ExpBiosample.find()
      .then((results) => {
        data.expBiosamples = results;
        resolve(data);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function getScreens(data) {
  return new Promise((resolve, reject) => {
    app.models.ExpScreen.find()
      .then((results) => {
        data.expScreens = results;
        resolve(data);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function getExpAssays(data) {
  let screens = [3, 4, 7, 8];
  let or = [];
  //TODO Include Screens here!
  // and: [
  //   {reagentId: geneRow.rnaiId},
  //   {libraryId: 1},
  //   {or: [{screenId: 3}, {screenId: 4}, {screenId: 7}, {screenId: 8}]}
  // ]
  data.expDesigns.map((expDesignSet) => {
    if (!isNull(expDesignSet) && !isEmpty(expDesignSet)) {
      expDesignSet.map((expDesignRow: ExpDesignResultSet) => {
        let obj = {expGroupId: expDesignRow.treatmentGroupId};
        or.push(obj);
        obj = {expGroupId: expDesignRow.controlGroupId};
        or.push(obj);
      });
    }
  });
  return new Promise((resolve, reject) => {
    //TODO Also get includeCounts!
    //TODO Paginate
    //TODO Include statement does not work for belongsTo - figure out correct way to manualScoresAdvancedQuery this
    app.models.ExpAssay
      .find({
        where: {or: or},
        include: ['expAssay2reagent', 'modelPredictedCounts'],
      })
      .then((results: ExpAssayResultSet[]) => {
        //TODO Randomly choose subset of ctrls
        results = JSON.parse(JSON.stringify(results));
        console.log(`ExpAssay Results Count: ${results.length}`);
        data['expAssays'] = results;
        resolve(data);
      })
      .catch((error) => {
        console.log('rejecting getExpAssays');
        reject(new Error(error));
      });
  });
}

/**
 * Remove null expAssays and group by reagent_type (treat_rnai, ctrl_rnai, ctrl_strain, ctrl_null)
 * @param {ExpAssayResultSet[]} expAssays
 * @returns {"../index".Dictionary<ExpAssayResultSet[]>}
 */
function trimAssays(expAssays: ExpAssayResultSet[]) {
  expAssays = filter(expAssays, (expAssay: ExpAssayResultSet) => {
    return !isNull(expAssays) && get(expAssay, 'expAssay2reagent[0]');
  });
  let groups = groupBy(expAssays, (expAssay) => {
    if (get(expAssay, 'expAssay2reagent[0].reagentType')) {
      //@ts-ignore
      return expAssay.expAssay2reagent[0].reagentType;
    }
  });
  groups.ctrl_null = slice(shuffle(groups.ctrl_null), 0, 4);
  groups.ctrl_strain = slice(shuffle(groups.ctrl_strain), 0, 4);
  return groups;
}

function getCountAnalytics(data) {
  console.log('In getCount!');
  return new Promise((resolve, reject) => {
    //@ts-ignore
    Promise.map(data.expSets, (expSet: RnaiExpSet) => {
      // let treat_rnais = expSet.expAssays.treat_rnai;
      // let ctrl_rnais = expSet.expAssays.ctrl_rnai;

      let treatPercEmbLeths = [];
      try {
        treatPercEmbLeths = expSet.expAssays.treat_rnai.filter((treat_rnai: ExpAssayResultSet) => {
          return get(treat_rnai, 'modelPredictedCounts[0].percEmbLeth');
        }).map((treat_rnai: ExpAssayResultSet) => {
          //@ts-ignore
          return treat_rnai.modelPredictedCounts[0].percEmbLeth;
        });
      } catch (error) {
        console.log(error);
        return new Error(error);
      }
      let ctrlPercEmbLeths = [];
      try {
        ctrlPercEmbLeths = expSet.expAssays.ctrl_rnai.filter((ctrl_rnai: ExpAssayResultSet) => {
          return get(ctrl_rnai, 'modelPredictedCounts[0].percEmbLeth');
        }).map((ctrl_rnai: ExpAssayResultSet) => {
          //@ts-ignore
          return ctrl_rnai.modelPredictedCounts[0].percEmbLeth;
        });
      } catch (error) {
        console.log(error);
        console.log(JSON.stringify(expSet));
        return new Error(error);
      }

      let diffs = [];
      let rank = new ModelPredictedRankResultSet({
        treatmentGroupId: expSet.expDesigns[0].treatmentGroupId,
        modelId: 4,
        screenId: expSet.expAssays.treat_rnai[0].screenId,
        expWorkflowId: expSet.expAssays.treat_rnai[0].expWorkflowId,
      });
      treatPercEmbLeths.map((treatPercEmbLeth: number) => {
        ctrlPercEmbLeths.map((ctrlPercEmbLeth: number) => {
          diffs.push(Math.abs(subtract(Number(treatPercEmbLeth), Number(ctrlPercEmbLeth))));
        });
      });
      diffs = diffs.filter((diff) => {
        return !isNull(diff);
      });

      rank.minDifference = floor(min(diffs), 2);
      rank.maxDifference = floor(max(diffs), 2);
      rank.avgDifference = floor(mean(diffs), 2);
      expSet.analysis = rank;
      return expSet;
    })
      .then((expSets) => {
        expSets = sortBy(expSets, (expSet) => {
          return expSet.analysis.maxDifference;
        });
        expSets = reverse(expSets);
        data.expSets = expSets;
        resolve(data);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function makeInterfaces(data) {
  return new Promise((resolve, reject) => {
    // let goToTheWebz: RnaiExpSetResult[] = [];
    let goToTheWebz: RnaiExpSetResult[] = data.expSets.map((expSet: RnaiExpSet) => {
      return new RnaiExpSetResult({
        gene: expSet.gene,
        rank: expSet.analysis,
        treat_rnai_counts: expSet.expAssays.treat_rnai.map((expAssay) => {
          return pick(expAssay['modelPredictedCounts'][0],
            ['assayId', 'assayImagePath', 'wormCount', 'larvaCount', 'eggCount', 'percEmbLeth', 'percSter', 'broodSize']);
        }),
        ctrl_rnai_counts: expSet.expAssays.ctrl_rnai.map((expAssay) => {
          return pick(expAssay['modelPredictedCounts'][0],
            ['assayId', 'assayImagePath', 'wormCount', 'larvaCount', 'eggCount', 'percEmbLeth', 'percSter', 'broodSize']);
        }),
        ctrl_strain_counts: expSet.expAssays.ctrl_strain.map((expAssay) => {
          return pick(expAssay['modelPredictedCounts'][0],
            ['assayId', 'assayImagePath', 'wormCount', 'larvaCount', 'eggCount', 'percEmbLeth', 'percSter', 'broodSize']);
          // return expAssay['modelPredictedCounts'][0];
        }),
        ctrl_null_counts: expSet.expAssays.ctrl_null.map((expAssay) => {
          return pick(expAssay['modelPredictedCounts'][0],
            ['assayId', 'assayImagePath', 'wormCount', 'larvaCount', 'eggCount', 'percEmbLeth', 'percSter', 'broodSize']);
          // return expAssay['modelPredictedCounts'][0];
        }),
        treat_rnai_image_paths: expSet.expAssays.treat_rnai.map((expAssay: ExpAssayResultSet) => {
          return expAssay.assayImagePath;
        }),
        ctrl_rnai_image_paths: expSet.expAssays.ctrl_rnai.map((expAssay: ExpAssayResultSet) => {
          return expAssay.assayImagePath;
        }),
        ctrl_strain_image_paths: expSet.expAssays.ctrl_strain.map((expAssay: ExpAssayResultSet) => {
          return expAssay.assayImagePath;
        }),
        ctrl_null_image_paths: expSet.expAssays.ctrl_null.map((expAssay: ExpAssayResultSet) => {
          return expAssay.assayImagePath;
        }),
      });
    });
    slice(goToTheWebz, 0, 50).map((webz) => {
      console.log(JSON.stringify(webz.rank, null, 2));
    });
    let name = 'mip-1;mip-2 chr1 proteomics downstream analysis';
    let createObj = {
      name: name,
      code: camelCase(name),
      description: 'This is a downstream analysis done that was then analysed in mip-1;mip-2 screens',
    };
    app.models.Analysis
      .findOrCreate({
        where:
          {
            and: [
              {name: createObj.name},
              {code: createObj.code},
              {description: createObj.description},
            ],
          },
      }, createObj)
      .then((analysisResults) => {
        analysisResults[0].contactSheetResults = goToTheWebz;
        analysisResults[0].dateModified = Date.now();
        if (isEqual(analysisResults[1], false)) {
          analysisResults[0].dateCreated = Date.now();
        }
        return app.models.Analysis
          .upsert(analysisResults[0]);
      })
      .then((results) => {
        console.log(JSON.stringify(results));
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function prepareInterfaces(genesList, data) {
  console.log('In prepareInterfaces');
  let expSets: RnaiExpSet[] = [];
  let screens = [3, 4, 7, 8];
  //Split by Screen
  data.expDesigns.map((expDesigns: ExpDesignResultSet[]) => {
    if (!isNull(expDesigns) && !isEmpty(expDesigns)) {
      let expAssays: ExpAssayResultSet[] = filter(data.expAssays, (expAssay: ExpAssayResultSet) => {
        return find(expDesigns, (expDesign: ExpDesignResultSet) => {
          return isEqual(Number(expAssay.expGroupId), Number(expDesign.controlGroupId)) ||
            isEqual(Number(expAssay.expGroupId), Number(expDesign.treatmentGroupId));
        });
      });
      // TODO - Update this to get the gene from the ExpAssay2reagent resultSet
      //Get the gene
      let treatmentGroup = expDesigns[0].treatmentGroupId;
      let expGroup: ExpGroupResultSet = find(data.expGroups, (expGroup: ExpGroupResultSet) => {
        return isEqual(Number(expGroup.expGroupId), Number(treatmentGroup));
      });
      //This is only applicable for a given list of genes - if just going over an entire screen
      //We will have to fetch the screen
      // TODO - UPDATE THIS - there can also be MORE THAN 1 gene
      let gene: RnaiWormbaseXrefsResultSet = find(genesList, (geneRow: RnaiLibraryResultSet) => {
        //@ts-ignore
        return isEqual(expGroup.reagentId, geneRow.rnaiId);
      });
      let trimmedAssays = trimAssays(expAssays);

      expSets.push(new RnaiExpSet({expAssays: trimmedAssays, expDesigns: expDesigns, gene: gene}));
    }
  });
  delete data.expGroups;
  delete data.expDesigns;
  delete data.expAssays;
  data.expSets = expSets;
  return new Promise((resolve, reject) => {
    resolve(data);
  });
}

/**
 * WIP - This will have to be reworked to reflect changes in the ExpGroup table
 * Instead of searching from the ExpGroup, we should search from ExpAssay2reagent
 * @param {RnaiLibraryResultSet} genesList
 */
function getExpDesign(genesList: RnaiLibraryResultSet[]) {
  console.log('In getExpDesign');
  let or = [];
  // TODO This is going to have to be updated when ExpGroup
  // Is fixed to incorporate more than 1 gene
  genesList.map((geneRow) => {
    let obj = {
      and: [
        {reagentId: geneRow.rnaiId},
        {libraryId: 1},
        {or: [{screenId: 3}, {screenId: 4}, {screenId: 7}, {screenId: 8}]}
      ]
    };
    or.push(obj);
  });

  //TODO This is a bit stupid - we get the ExpAssay2reagent,
  //Get the expGroups, then toss, then get them later with the expAssays
  //TODO What should be done is to get the expAssay2reagents, expAssays, and the Counts all in 1 fell swoop
  return new Promise((resolve, reject) => {
    let data = {};
    app.models.ExpAssay2reagent
      .find({where: {or: or}, fields: {expGroupId: true, assayId: true, reagentId: true, libraryId: true}})
      .then((results) => {
        //This is a hack until the expAssay2reagent table update finishes
        // let expGroupIds = contactSheetResults.map((expAssay2reagent: ExpAssay2reagentResultSet) => {
        //   console.log(JSON.stringify(expAssay2reagent));
        //   return {expGroupId: expAssay2reagent.expGroupId};
        // });
        let expAssayIds = results.map((expAssay2reagent: ExpAssay2reagentResultSet) => {
          return {assayId: expAssay2reagent.assayId};
        });
        return app.models.ExpAssay.find({where: {or: expAssayIds}, fields: {expGroupId: true}})
      })
      .then((results: ExpAssayResultSet[]) => {
        let expGroupIds = results.map((expAssay: ExpAssayResultSet) => {
          return {expGroupId: expAssay.expGroupId};
        });
        return app.models.ExpGroup.find({where: {or: expGroupIds}})
      })
      .then((results: ExpGroupResultSet[]) => {
        return getExpSets(data, results);
      })
      .then((results) => {
        //TODO These should be UP
        console.log('getBiosamples');
        return getBioSamples(results);
      })
      .then((results) => {
        console.log('getScreens');
        return getScreens(results);
      })
      .then((results) => {
        console.log('getExpAssays');
        return getExpAssays(results);
      })
      .then((results) => {
        return prepareInterfaces(genesList, results);
      })
      .then((results) => {
        return getCountAnalytics(results);
      })
      .then((results) => {
        return makeInterfaces(results);
      })
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function getScreenData() {
  let data = {};
  return new Promise((resolve, reject) => {
    getScreens(data)
      .then((results) => {
        return getBioSamples(results);
      })
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function getExpSets(data, expGroups) {
  console.log('In getExpSets');
  let or = [];
  expGroups.map((expGroup: ExpGroupResultSet) => {
    let obj: any = {treatmentGroupId: expGroup.expGroupId};
    or.push(obj);
    obj = {controlGroupId: expGroup.expGroupId};
    or.push(obj);
  });
  return new Promise((resolve, reject) => {
    console.log(`Getting exp Sets of : ${expGroups.length}`);
    app.models.ExpDesign
      .find({where: {or: or}})
      .then((results: ExpDesignResultSet[]) => {
        let groups = groupBy(results, 'treatmentGroupId');
        let expDesignSets = [];
        Object.keys(groups).map((group) => {
          let t = [];
          groups[group].map((expDesignRow: ExpDesignResultSet) => {
            t.push(expDesignRow);
          });
          expDesignSets.push(t);
        });
        data.expGroups = expGroups;
        data.expDesigns = expDesignSets;
        resolve(data);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function getFromGeneLibrary(genesList, geneXrefs) {
  console.log('In getFromGeneLibrary');
  let or = [];
  geneXrefs.map((geneXref) => {
    let obj = {
      and: [
        {geneName: geneXref.wbGeneSequenceId},
        {chrom: 'I'},
      ]
    };
    or.push(obj);
  });

  return new Promise((resolve, reject) => {
    app.models.RnaiLibrary
      .find({where: {or: or}})
      .then((results: RnaiLibraryResultSet[]) => {
        console.log('Returning from RNAi Library');
        results.map((result) => {
          let geneXref: RnaiWormbaseXrefsResultSet = find(geneXrefs, (geneXref) => {
            return isEqual(geneXref.wbGeneSequenceId, result.geneName);
          });
          result['wbGeneCgcName'] = geneXref.wbGeneCgcName;
          let origGene = find(orig, (row) => {
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

let parseGenesRow = function (row) {
  return new Promise((resolve, reject) => {
    resolve();
  });
};

let Object: any;
/**
 * This is the object for the initial search
 */
interface GeneSearch {
  screens: ExpScreenResultSet[];
  genesList: string[];
  libraryId: number;
}

interface RnaiExpSetResultInterface {
  gene: RnaiWormbaseXrefsResultSet;
  treat_rnai_image_paths: string[];
  ctrl_rnai_image_paths: string[];
  ctrl_strain_image_paths: string[];
  ctrl_null_image_paths: string[];
  treat_rnai_counts: ModelPredictedCountsResultSet[];
  ctrl_rnai_counts: ModelPredictedCountsResultSet[];
  ctrl_strain_counts: ModelPredictedCountsResultSet[];
  ctrl_null_counts: ModelPredictedCountsResultSet[];
  rank: ModelPredictedRankResultSet;
}

class RnaiExpSetResult {
  gene: RnaiWormbaseXrefsResultSet;
  treat_rnai_image_paths: string[];
  ctrl_rnai_image_paths: string[];
  ctrl_strain_image_paths: string[];
  ctrl_null_image_paths: string[];
  treat_rnai_counts: ModelPredictedCountsResultSet[];
  ctrl_rnai_counts: ModelPredictedCountsResultSet[];
  ctrl_strain_counts: ModelPredictedCountsResultSet[];
  ctrl_null_counts: ModelPredictedCountsResultSet[];
  rank: ModelPredictedRankResultSet;

  constructor(data?: RnaiExpSetResultInterface) {
    //@ts-ignore
    Object.assign(this, data);
  }
}

interface RnaiExpSetInterface {
  gene: RnaiWormbaseXrefsResultSet;
  //ExpAssays are grouped by reagent type
  expAssays: any;
  expDesigns: ExpDesignResultSet[];
  analysis?: ModelPredictedRankResultSet;
}

export class RnaiExpSet {
  gene: RnaiWormbaseXrefsResultSet;
  expAssays: any;
  expDesigns: ExpDesignResultSet[];
  analysis?: ModelPredictedRankResultSet;

  constructor(data?: RnaiExpSetInterface) {
    //@ts-ignore
    Object.assign(this, data);
  }
}
