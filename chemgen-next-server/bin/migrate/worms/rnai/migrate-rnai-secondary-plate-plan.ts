import Promise = require('bluebird');
import app = require('../../../../server/server');
import {find, isEqual, get, isEmpty} from 'lodash';
import {
  RnaiLibraryResultSet, RnaiScreenUploadWorkflowResultSet,
  RnaiWormbaseXrefsResultSet
} from "../../../../common/types/sdk/models";

const jsonfile = require('jsonfile');
const path = require('path');

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const cols = ['01', '02', '03', '04', '05',
  '06', '07', '08', '09', '10', '11', '12'
];
let wells96 = [];

rows.map(function (row) {
  cols.map(function (col) {
    wells96.push(row + col)
  })
});

let getParentLibrary = function (workflowData) {
  console.log('in parent library!');
  return new Promise(function (resolve, reject) {
    parseCustomPlate(workflowData)
      .then(function (results) {
        return parseRows(workflowData, results);
      })
      .then(function (results) {
        return migrateToNewFormat(results);
      })
      .then((results) => {
        resolve(results);
      })
      .catch(function (error) {
        console.log(JSON.stringify(error));
        reject(new Error(error));
      });
  });
};


let findOtherGeneNames = function (taxTerm) {
  return new Promise((resolve, reject) => {
    if (taxTerm) {
      app.models.RnaiWormbaseXrefs.findOne({
        where: {wbGeneSequenceId: taxTerm}
      })
        .then((results: RnaiWormbaseXrefsResultSet) => {
          resolve(results);
        })
        .catch((error) => {
          reject(new Error(error));
        });
    } else {
      resolve({});
    }
  });
};


let migrateToNewFormat = function (wellData) {
  let workflowData: any = {};

  return new Promise((resolve, reject) => {
    wells96.map((well) => {
      workflowData[well] = {};
      workflowData[well].isValid = true;
      workflowData[well].well = well;
      if (!isEmpty(well)) {
        try {
          let wellRow = find(wellData, (wellRow) => {
            if (!isEmpty(wellRow)) {
              return isEqual(wellRow.well, well);
            } else {
              return false;
            }
          });
          if (wellRow) {
            workflowData[well].taxTerm = wellRow.geneName;
            workflowData[well].geneName = wellRow.geneName;
            workflowData[well].lookUp = wellRow.lookUp;
          }
          if (wellRow && get(wellRow, 'rnaiId')) {
            let parentLibrary = addToWorkflowData(workflowData, wellRow);
            workflowData[well].parentLibrary = parentLibrary;
          }
          if(wellRow && get(wellRow, ['geneData', 'wbGeneSequenceId'])){
            workflowData[well].geneData = wellRow.geneData;
          }else{
            workflowData[well].geneData = {};
          }
        }
        catch (error) {
          console.log(`Received error ${error}`);
          throw(new Error(error));
        }
      }
    });
    resolve(workflowData);
  });
};

let addToWorkflowData = function (workflowData, wellRow) {
  let parentLibrary: any = {};
  try {
    parentLibrary.rnaiId = wellRow.rnaiId;
    parentLibrary.libraryId = wellRow.libraryId;
    parentLibrary.rnaiType = wellRow.rnaiType;
    parentLibrary.plate = wellRow.plate;
    parentLibrary.well = wellRow.well;
    parentLibrary.chrom = wellRow.chrom;
    parentLibrary.geneName = wellRow.geneName;
    parentLibrary.fwdPrimer = wellRow.fwdPrimer;
    parentLibrary.revPrimer = wellRow.revPrimer;
    parentLibrary.bioloc = wellRow.bioloc;
    parentLibrary.stocktitle = wellRow.stocktitle;
    parentLibrary.stockloc = wellRow.stockloc;
  }
  catch (error) {
    console.log(`Received error ${error}`);
    throw(new Error(error));
  }
  return parentLibrary;
};

let buildRnaiLibraryWhere = function (lookUp) {
  let where = {};
  let chrom = lookUp[0];
  let plateNo = lookUp[1];
  let well = '';

  // The well listed is from the parent library - not the stock
  if (lookUp.length === 3) {
    well = lookUp[2];
    let bioLoc = chrom + '-' + plateNo + well;
    where = {
      bioloc: bioLoc,
    };
    // The well is from the stock - it has a quadrant
  } else if (lookUp.length === 4) {
    let quad = lookUp[2];
    well = lookUp[3];
    where = {
      and: [{
        stocktitle: chrom + '-' + plateNo + '--' + quad,
      },
        {
          stockloc: quad + '-' + well,
        },
        {
          well: well,
        },
        {
          libraryId: 1,
        }
      ],
    };
  } else {
    return;
  }
  return where;
};

const parseWell = function (workflowData, wellData) {
  // let lookUpIndex = workflowData.expSetSearch.library.rnai.ahringer.lookUpIndex;
  // let commentIndex = workflowData.expSetSearch.library.rnai.ahringer.commentIndex;
  let lookUpIndex = 0;
  let commentIndex = 1;
  if (isEqual(wellData.splitLookUp.length, 1)) {
    lookUpIndex = 0;
  } else if (wellData.splitLookUp[0].split('-').length > 2) {
    lookUpIndex = 0;
    commentIndex = 1;
  } else {
    lookUpIndex = 1;
    commentIndex = 0;
  }

  return new Promise(function (resolve, reject) {
    let obj: any = {
      wellData: wellData,
    };
    // If its a control just return right here
    if (wellData.splitLookUp[0].match('L4440')) {
      obj.geneName = 'L4440';
      obj.lookUp = 'L4440';
      obj.well = wellData.assayWell;
      resolve(obj);
    } else {
      let data,
        comment;
      data = wellData.splitLookUp[lookUpIndex];
      comment = wellData.splitLookUp[commentIndex];
      let lookUp = data.split('-');
      let where = buildRnaiLibraryWhere(lookUp);

      if (!where) {
        reject(new Error('Not able to find a corresponding library well!'));
      } else {
        app.models.RnaiLibrary.findOne({
          where: where,
        })
          .then(function (results: any) {
            if (!results || isEmpty(results)) {
              resolve();
            } else {
              results.wellData = wellData;
              results.origWell = results.well;
              results.well = wellData.assayWell;
              results.comment = comment;
              results.lookUp = data;
              return findOtherGeneNames(results.geneName)
                .then((otherTaxTerms) =>{
                  results.geneData = otherTaxTerms;
                  resolve(results);
                })
            }
          })
          .catch(function (error) {
            console.log(`Received error ${error}`);
            reject(new Error(error.stack));
          });
      }
    }
  });
};

const parseRows = function (workflowData, lists) {
  return new Promise(function (resolve, reject) {
    //@ts-ignore
    Promise.map(lists, function (wellData) {
      return parseWell(workflowData, wellData);
    })
      .then(function (results) {
        resolve(results);
      })
      .catch(function (error) {
        reject(new Error(error));
      });
  });
};

// This parses the custom Plate
// That exists as a json file the library data directory
// This is Ahringer Library Specific
const parseCustomPlate = function (workflowData) {
  let wellData = workflowData.data.library.wellData;
  let rows = app.etlWorkflow.helpers.rows;
  let list = [];

  return new Promise(function (resolve, reject) {
    rows.map(function (row) {
      let obj = wellData[row];
      for (let key in obj) {
        let dataObj = {};
        let lookUp = obj[key];
        let newKey = ('00' + key)
          .slice(-2);
        if (lookUp) {
          let splitLookUp;
          try {
            splitLookUp = lookUp.split('\n');
            dataObj['splitLookUp'] = splitLookUp;
            dataObj['row'] = row;
            dataObj['origKey'] = key;
            dataObj['assayWell'] = row + newKey;
            list.push(dataObj);
          } catch (error) {
            reject(new Error(error));
          }
        }
      }
    });

    resolve(list);
  });
};

module.exports.getParentLibrary = getParentLibrary;
