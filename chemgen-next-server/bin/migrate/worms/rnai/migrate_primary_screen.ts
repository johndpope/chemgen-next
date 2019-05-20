'use strict';

import app = require('../../../../server/server');

const Promise = require('bluebird');
const fs = require('fs');
const readFile = Promise.promisify(require('fs')
  .readFile);
const jsonfile = require('jsonfile');
const path = require('path');
import deepcopy = require('deepcopy');
import {isEqual, uniqWith, chunk, orderBy, get, filter, find, isEmpty, isNull} from 'lodash';
import {ExpScreenUploadWorkflowResultSet, PlateResultSet} from "../../../../common/types/sdk/models";
import Papa = require('papaparse');

//mel-28 primary genome wide  screen
const minimal = jsonfile.readFileSync(path.resolve(__dirname, 'data', 'primary', 'minimal_primary.json'));
let controlBiosampleId = 4;
let controlBiosampleName = 'N2';

//mel-28 primary genome wide enhancer/permissive screen
// const primaryDataFile = path.resolve(__dirname, 'data', 'primary', 'primary_assays-2016-03--2016-09.json');
// let expBiosampleId = 5;
// let expBiosampleName = 'mel-28';
// console.log('Beginning permissive screen');
// const screenId = 1;
// const screenName = 'mel-28 Primary RNAi Genome Wide Permissive Screen';
// let workflowJsonName = 'mel-28_Primary_RNAi_Genome_Wide_Permissive_Screen--2016-03--2016-09';
// const temperature = "17.5";
// let conditionCode = 'E';
// let notThisCondition = 'S';
// let screenType = 'permissive';

//mel-28 primary genome wide restrictive screen
// console.log('Beginning restrictive screen');
// const screenId = 2;
// const screenName = 'mel-28 Primary RNAi Genome Wide Restrictive Screen';
// let workflowJsonName = 'mel-28_Primary_RNAi_Genome_Wide_Restrictive_Screen--2016-03--2016-09';
// const temperature = "23.3";
// let conditionCode = 'S';
// let notThisCondition = 'E';
// let screenType = 'restrictive';

//mip-1;mip2 primary genome wide
const primaryDataFile = path.resolve(__dirname, 'data', 'primary', 'mip-1-primary_assays-2017-12.json');
let primaryDataList = jsonfile.readFileSync(primaryDataFile);
let expBiosampleId = 6;
let expBiosampleName = 'mip-1;mip-2';

//mip-1;mip2 primary genome wide restrictive/permissive
// console.log('mip-1 restrictive');
// const screenId = 3;
// const screenName = 'mip-1;mip-2 Primary RNAi Restrictive Screen' ;
// let workflowJsonName = 'mip-1;mip-2_Primary_RNAi_Genome_Wide_Restrictive_Screen--2017-12';
// const temperature = "25";
// let conditionCode = 'S';
// let notThisCondition = 'E';
// let screenType = 'restrictive';

// console.log('mip-1 permissive');
const screenId = 4;
const screenName = 'mip-1;mip-2 Primary RNAi Permissive Screen';
let workflowJsonName = 'mip-1;mip-2_Primary_RNAi_Genome_Wide_Permissive_Screen--2017-12';
const temperature = "20";
let conditionCode = 'E';
let notThisCondition = 'S';
let screenType = 'permissive';

const newDataList = [];
console.log(`Primary Data List: ${primaryDataList.length}`);
// primaryDataList = primaryDataList.slice(0, 10);
primaryDataList.map((primaryData) => {
  const tDataList = findQuads(primaryData);
  tDataList.map((tData) => {
    newDataList.push(tData);
  });
});

doStuff(newDataList);

function mapOldWorkflow(workflowData) {

  let primaryWorkflow: ExpScreenUploadWorkflowResultSet = deepcopy(minimal);
  let quadrant = get(workflowData, ['search', 'library', 'rnai', 'ahringer', 'quadrant']);
  let chrom = get(workflowData, ['search', 'library', 'rnai', 'ahringer', 'chrom']);
  let plate = get(workflowData, ['search', 'library', 'rnai', 'ahringer', 'RnaiPlateNo']);
  [quadrant, chrom, plate].map((thing) => {
    if (isEmpty(thing) || isNull(thing)) {

      console.error('Things are missing that should not be missing!');
      console.error(JSON.stringify(workflowData.search));
      process.exit(1);
    }
  });

  primaryWorkflow.search.rnaiLibrary.plate = plate;
  primaryWorkflow.search.rnaiLibrary.quadrant = quadrant;
  primaryWorkflow.search.rnaiLibrary.chrom = chrom;
  primaryWorkflow.stockPrepDate = workflowData.assayDate;
  primaryWorkflow.assayDates = [workflowData.assayDate];
  primaryWorkflow.replicates = workflowData.screenDesign.replicates;
  primaryWorkflow.screenName = screenName;
  primaryWorkflow.screenId = screenId;
  primaryWorkflow.temperature = temperature;
  primaryWorkflow.name = `AHR2 ${workflowData.assayDate} ${expBiosampleName} ${controlBiosampleName} ${screenType} Chr ${chrom} Plate ${plate} Q ${quadrant}`;
  primaryWorkflow.comment = "migration upload";
  primaryWorkflow.screenType = screenType;

  primaryWorkflow.experimentGroups.treat_rnai.plates = workflowData.screenDesign.treat_rnai_plates;
  primaryWorkflow.experimentGroups.treat_rnai.biosampleId = expBiosampleId;
  primaryWorkflow.experimentGroups.ctrl_rnai.plates = workflowData.screenDesign.n2_rnai_plates;
  primaryWorkflow.experimentGroups.ctrl_rnai.biosampleId = controlBiosampleId;
  primaryWorkflow.experimentGroups.ctrl_strain.plates = workflowData.screenDesign.treat_l4440_plates;
  primaryWorkflow.experimentGroups.ctrl_strain.biosampleId = expBiosampleId;
  primaryWorkflow.experimentGroups.ctrl_null.plates = workflowData.screenDesign.null_l4440_plates;
  primaryWorkflow.experimentGroups.ctrl_null.biosampleId = controlBiosampleId;

  primaryWorkflow.biosamples = {
    "experimentBiosample": {
      "id": expBiosampleId,
      "name": expBiosampleName
    },
    "ctrlBiosample": {
      "id": controlBiosampleId,
      "name": controlBiosampleName,
    }
  };

  return primaryWorkflow;
}

function doStuff(tDataList) {
  Promise.map(tDataList, function (tData) {
    return findPlates(tData)
      .then((results) => {
        return results;
      })
      .catch((error) => {
        return new Error(error);
      });
  }, {concurrency: 1})
    .then((results) => {

      //Get the valid contactSheetResults
      let filteredResults = filter(results, (result) => {
        return !isEmpty(result) && result.VALID;
      });
      filteredResults = uniqWith(filteredResults, isEqual);
      let workflows = filteredResults.map((workflowData) => {
        return mapOldWorkflow(workflowData);
      });
      workflows = uniqWith(workflows, isEqual);
      console.log(`Got # ${workflows.length} workflows!`);
      jsonfile.writeFileSync(path.resolve(__dirname, 'data', 'primary', `${workflowJsonName}.json`), workflows, {spaces: 2});

      //Get the invalid contactSheetResults
      let inValid = filter(results, (result) => {
        return !isEmpty(result) && !result.VALID;
      });
      let invalidSearch = inValid.map((row) => {
        return {search: row.search, assayDate: row.assayDate};
      });
      console.log('Invalid Searches!!!');
      console.log(JSON.stringify(invalidSearch));
      //TODO Find all chr/plates in original workflow with no matching plates
      //All Chrom-Plate-Quadrants found and are valid
      let chromPlates = workflows.map((workflow) => {
        let chrom = get(workflow, ['search', 'rnaiLibrary', 'chrom']);
        let plate = get(workflow, ['search', 'rnaiLibrary', 'plate']);
        let quadrant = get(workflow, ['search', 'rnaiLibrary', 'quadrant']);
        return {chrom: chrom, plate: plate, quadrant: quadrant, assayDate: workflow.stockPrepDate};
      });
      let uniqChromPlates = uniqWith(chromPlates, isEqual);
      uniqChromPlates = orderBy(uniqChromPlates, ['chrom'], ['asc']);
      let csv = Papa.unparse(uniqChromPlates);
      fs.writeFileSync(path.resolve(__dirname, 'data', 'primary', `${workflowJsonName}_valid_workflows.csv`), csv);

      //All Chrom-Plate-Quadrants from the original workflow Data
      let AllChromPlates = workflows.map((workflow) => {
        let chrom = get(workflow, ['search', 'library', 'rnai', 'ahringer', 'chrom']);
        let plate = get(workflow, ['search', 'library', 'rnai', 'ahringer', 'RnaiPlateNo']);
        return {chrom: chrom, plate: plate, assayDate: workflow.stockPrepDate};
      });
      AllChromPlates = uniqWith(AllChromPlates, isEqual);

      let notFound = [];
      AllChromPlates.map((search) => {
        let found = find(uniqChromPlates, (workflow) => {
          return isEqual(search.plate, workflow.plate) && isEqual(search.chrom, workflow.chrom);
        });
        if (!found) {
          notFound.push(search);
        }
      });
      csv = Papa.unparse(notFound);
      fs.writeFileSync(path.resolve(__dirname, 'data', 'primary', `${workflowJsonName}_not_found_workflows.csv`), csv);

      process.exit(0);
    })
    .catch((error) => {
      process.exit(1);
    });
}


function findQuads(primaryData) {

  let searchNames = [];
  let chromosome = primaryData.search.library.rnai.ahringer.chrom;
  let libraryPlate = primaryData.search.library.rnai.ahringer.RnaiPlateNo;
  let dates = primaryData.imageDates;
  let copyList = [];

  if (get(primaryData, ['search', 'library', 'rnai', 'ahringer', 'quadrant'])) {
    let copy = deepcopy(primaryData);
    let libraryQuadrant = get(primaryData, ['search', 'library', 'rnai', 'ahringer', 'quadrant']);
    //Sometimes the expSetSearch term is RNA, sometimes RNAI
    // let searchNamePatterns = [`RN%${chromosome}.${libraryPlate}${libraryQuadrant}%${conditionCode}%`,
    //   `RN%${chromosome}${libraryPlate}${libraryQuadrant}%${conditionCode}%`, `L4440${conditionCode}%`];
    let searchNamePatterns = [`RN%${chromosome}.${libraryPlate}${libraryQuadrant}%`,
      `RN%${chromosome}${libraryPlate}${libraryQuadrant}%`, `L4440%`];
    searchNames = searchNamePatterns.map((name: string) => {
      return {name: {like: name}};
    });
    const where = {
      and: [
        {
          or: searchNames,
        },
        {name: {nlike: `%${notThisCondition}%`}},
        {
          or: dates,
        }
      ]
    };
    copy.SEARCH = where;
    copyList.push(copy);
  } else {
    const quadrants = ['Q1', 'Q2', 'Q3', 'Q4', 'A1', 'A2', 'B1', 'B2'];
    quadrants.map((libraryQuadrant) => {
      let copy = deepcopy(primaryData);
      //For E this si fine
      //For S we have to have a expSetSearch condition that is matches S or just does not match E
      //Some restrictive screens have the S, some don't
      copy.search.library.rnai.ahringer.quadrant = libraryQuadrant;
      let searchNamePatterns = [`RN%${chromosome}.${libraryPlate}${libraryQuadrant}%${conditionCode}%`,
        `RN%${chromosome}${libraryPlate}${libraryQuadrant}%${conditionCode}%`, `L4440${conditionCode}%`,];
      searchNames = searchNamePatterns.map((name: string) => {
        return {name: {like: name}};
      });
      const where = {
        and: [
          {
            or: searchNames,
          },
          {name: {nlike: `%${notThisCondition}%`}},
          {
            or: dates,
          }
        ]
      };
      copy.SEARCH = where;
      copyList.push(copy);
    })
  }
  return copyList;
}

function findPlates(workflowData) {
  return new Promise((resolve, reject) => {
    app.models.Plate.find({
      where: workflowData.SEARCH,
      limit: 100,
      fields: {
        csPlateid: true,
        id: true,
        name: true,
        platebarcode: true,
        creationdate: true,
        imagepath: true
      }
    })
      .then((results: PlateResultSet[]) => {
        let rnai_plates = find(results, (result) => {
          return result.name.match(/rnai/i);
        });
        if (isEmpty(rnai_plates) || isNull(rnai_plates)) {
          resolve([]);
        } else {
          workflowData.PLATES = results;
          let screenDesign = new RnaiScreenDesign();
          screenDesign.plates = results;
          screenDesign.sortPlates();
          workflowData.screenDesign = screenDesign;
          workflowData.VALID = isEqual(workflowData.screenDesign.replicates['1'].length, workflowData.screenDesign.replicates['2'].length);
          resolve(workflowData);
        }
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
        reject(new Error(error));
      })
  });
}

function validateWorkflow(workflowData) {
  let valid = true;
  let replcatesLength = isEqual(workflowData.screenDesign.replicates['1'].length, workflowData.screenDesign.replicates['2'].length);
  let numberOfReplicates = isEqual(Object.keys(workflowData.screenDesign.replicates).length, 2);
}

//The nicer version of this exists in the chemgen-next-ng codebase
//I just took this class
export class RnaiScreenDesign {

  treat_rnai_plates: PlateResultSet[] = [];
  n2_rnai_plates: PlateResultSet[] = [];
  treat_l4440_plates: PlateResultSet[] = [];
  null_l4440_plates: PlateResultSet[] = [];
  conditions: Array<Object> = [{code: 'E', condition: 'Permissive'}, {code: 'S', condition: 'Restrictive'}];

  /* Place plates in appropriate conditions */
  /* This is mostly done in the screen specific logic, but there are a few placeholders here to grab the plates */
  plates: PlateResultSet[] = [];
  replicates: any = {};

  public clearPlates() {
    this.treat_rnai_plates = [];
    this.n2_rnai_plates = [];
    this.treat_l4440_plates = [];
    this.null_l4440_plates = [];
    this.replicates = {};
  }

  /**
   * This is pretty hacky. what should be done is to give each biosample a code, and then to check for that in the barcode
   * @returns {any[]}
   */
  public sortPlates() {
    this.clearPlates();
    const unSortedPlates = [];
    this.plates.map((plate: PlateResultSet) => {
      if (plate.name.match(/Rna/gi) && plate.name.match('M')) {
        this.treat_rnai_plates.push(plate);
      } else if (plate.name.match(/Rna/gi) && plate.name.match('mel')) {
        this.treat_rnai_plates.push(plate);
      } else if (plate.name.match(/Rna/gi) && plate.name.match('mip')) {
        this.treat_rnai_plates.push(plate);
      } else if (plate.name.match(/Rna/gi)) {
        this.n2_rnai_plates.push(plate);
      } else if (plate.name.match('L4440') && plate.name.match('M')) {
        this.treat_l4440_plates.push(plate);
      } else if (plate.name.match('L4440')) {
        this.null_l4440_plates.push(plate);
      } else {
        unSortedPlates.push(plate);
      }
    });
    // Treat Plates are usually named L4440E_M, L4440_E_D_M
    // Null are Named L4440E, L4440E_D
    // Want first the L4440E, then the duplicate
    // TODO Will have to define different schemas for different barcode naming conventions
    // Now the team uses D to indicate a replicate, but at some point this will change to named replicates (1,2,..,8)
    this.treat_l4440_plates = orderBy(this.treat_l4440_plates, ['name'], ['desc']);
    this.null_l4440_plates = orderBy(this.null_l4440_plates, ['name'], ['asc']);
    this.splitIntoReplicates();
    return unSortedPlates;
  }

  public pushReplicate(plate, index) {
    if (!this.replicates.hasOwnProperty(index + 1)) {
      this.replicates[index + 1] = [];
    }
    this.replicates[index + 1].push(plate.csPlateid);
  }

  public splitIntoReplicates() {
    this.treat_rnai_plates.map((plate, index) => {
      this.pushReplicate(plate, index);
    });
    this.n2_rnai_plates.map((plate, index) => {
      this.pushReplicate(plate, index);
    });
    // Sometimes there is 1 L4440 per replicate, and sometimes 2
    // If its two we want the first half in the R1 replicates, and the second in the R2
    // Chunk each l4440 plate array into bins size of l4440_index
    const chunkSize = Math.ceil(this.treat_l4440_plates.length / this.treat_rnai_plates.length);
    const chunked_treat_l4440 = chunk(this.treat_l4440_plates, chunkSize);
    const chunked_null_l4440 = chunk(this.null_l4440_plates, chunkSize);

    chunked_treat_l4440.map((chunk, index) => {
      chunk.map((plate) => {
        this.pushReplicate(plate, index);
      });
    });

    chunked_null_l4440.map((chunk, index) => {
      chunk.map((plate) => {
        this.pushReplicate(plate, index);
      });
    });

  }
}

