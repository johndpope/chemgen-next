#!/usr/bin/env node

/**
 * There is lots of cutting and pasting here, and generally an abomination to all that is good and holy in the world
 */

import {PlateResultSet} from "../common/types/sdk/models";

const app = require('../server/server');
// import {WorkflowModel} from "../../common/models";
import Promise = require('bluebird');

const appendFile = Promise.promisify(require("fs").appendFile);

import deepcopy = require('deepcopy');
import {
  includes,
  isEqual,
  isArray,
  uniq,
  get,
  has,
  uniqWith,
  uniqBy,
  orderBy,
  range,
  isEmpty,
  isNull,
  compact,
  find
} from 'lodash';
import Moment = require('moment');
import {extendMoment} from 'moment-range';
import {ExpScreenUploadWorkflowResultSet} from "../common/types/sdk/models";

const Papa = require('papaparse');
const fs = require('fs');
const moment = extendMoment(Moment);
const jsonfile = require('jsonfile');
const minimal = jsonfile.readFileSync('/Users/jillian/Dropbox/projects/NY/chemgen-next-all/chemgen-next-server/bin/migrate/worms/rnai/data/primary/minimal_primary.json');
const controlBiosampleId = 4;
const controlBiosampleName = 'N2';
const expBiosampleId = 7;
const expBiosampleName = 'lgl-1';
const temperature = 20;
const screenName = 'lgl-1 Primary RNAi Permissive Screen';
const screenNameCode = 'amelia-crb-primary-permissive';
const screenId = 12;
const screenType = 'Permissive';
const barcodeMutant = 'am';

/**
 * Screen Data
 */
// const screenName = 'Victoria crb Primary Permissive Screen';

//TODO Separate out barcode schemas as well
let quadRange = ['A1', 'A2', 'B1', 'B2'];
let seenChr = {};
const batchConfigs: any = [
  {
    chr: 'I',
    temperature: 20,
    quadRange: quadRange,
    dateRanges: [
      {
        start: moment('2018-11-01', 'YYYY-MM-DD'),
        end: moment('2018-12-30', 'YYYY-MM-DD'),
      },
      {
        start: moment('2017-12-10', 'YYYY-MM-DD'),
        end: moment('2017-12-30', 'YYYY-MM-DD'),
      },
      {
        start: moment('2018-01-10', 'YYYY-MM-DD'),
        end: moment('2018-01-30', 'YYYY-MM-DD'),
      },
    ],
    platesRange: range(1, 6),
  },
  {
    chr: 'I',
    temperature: 20,
    quadRange: quadRange,
    dateRanges: [
      {
        start: moment('2018-11-01', 'YYYY-MM-DD'),
        end: moment('2018-12-30', 'YYYY-MM-DD'),
      },
      {
        start: moment('2017-12-10', 'YYYY-MM-DD'),
        end: moment('2017-12-30', 'YYYY-MM-DD'),
      },
      {
        start: moment('2018-01-10', 'YYYY-MM-DD'),
        end: moment('2018-01-30', 'YYYY-MM-DD'),
      },
    ],
    platesRange: range(7, 11),
  },
  {
    //The 6A1 is different and doesn't need 2017 plates
    chr: 'I',
    temperature: 20,
    quadRange: ['A1'],
    dateRanges: [
      {
        start: moment('2018-11-01', 'YYYY-MM-DD'),
        end: moment('2018-12-30', 'YYYY-MM-DD'),
      },
      {
        start: moment('2018-01-10', 'YYYY-MM-DD'),
        end: moment('2018-01-30', 'YYYY-MM-DD'),
      },
    ],
    platesRange: [6],
  },
  {
    //The 6A1 is different and doesn't need 2017 plates
    chr: 'I',
    temperature: 20,
    quadRange: ['A2', 'B1', 'B2'],
    dateRanges: [
      {
        start: moment('2018-11-01', 'YYYY-MM-DD'),
        end: moment('2018-12-30', 'YYYY-MM-DD'),
      },
      {
        start: moment('2017-12-10', 'YYYY-MM-DD'),
        end: moment('2017-12-30', 'YYYY-MM-DD'),
      },
      {
        start: moment('2018-01-10', 'YYYY-MM-DD'),
        end: moment('2018-01-30', 'YYYY-MM-DD'),
      },
    ],
    platesRange: [6],
  },
  {
    chr: 'II',
    temperature: 20,
    quadRange: quadRange,
    dateRanges: [
      {
        start: moment('2018-11-01', 'YYYY-MM-DD'),
        end: moment('2018-12-30', 'YYYY-MM-DD'),
      }
    ],
    platesRange: range(1, 12),
  },
  {
    chr: 'III',
    temperature: 20,
    quadRange: quadRange,
    dateRanges: [
      {
        start: moment('2018-11-01', 'YYYY-MM-DD'),
        end: moment('2018-12-30', 'YYYY-MM-DD'),
      }
    ],
    platesRange: range(1, 10),
  },
  {
    chr: 'IV',
    temperature: 20,
    quadRange: quadRange,
    dateRanges: [
      {
        start: moment('2018-11-20', 'YYYY-MM-DD'),
        end: moment('2018-11-30', 'YYYY-MM-DD'),
      }
    ],
    platesRange: range(1, 2),
  },
  {
    chr: 'IV',
    temperature: 20,
    quadRange: quadRange,
    dateRanges: [
      {
        start: moment('2018-12-01', 'YYYY-MM-DD'),
        end: moment('2018-12-30', 'YYYY-MM-DD'),
      }
    ],
    platesRange: range(2, 12),
  },
  {
    chr: 'V',
    temperature: 20,
    quadRange: quadRange,
    dateRanges: [
      {
        start: moment('2018-11-01', 'YYYY-MM-DD'),
        end: moment('2018-12-30', 'YYYY-MM-DD'),
      }
    ],
    platesRange: range(1, 17),
  },
  {
    chr: 'X',
    temperature: 20,
    quadRange: quadRange,
    dateRanges: [
      {
        start: moment('2018-11-01', 'YYYY-MM-DD'),
        end: moment('2018-12-30', 'YYYY-MM-DD'),
      }
    ],
    platesRange: range(1, 9),
  }
];
const emptySpreadsheet = function (batchConfigs) {
  return new Promise((resolve, reject) => {
    Promise.map(batchConfigs, (batchConfig: any) => {
      fs.writeFile(`/Users/jillian/Dropbox/projects/NY/chemgen-next-all/chemgen-next-data/${screenNameCode}-${batchConfig.chr}.csv`, '', (error) => {
        if (error) {
          app.winston.error(error);
          return (new Error(error));
        } else {
          return
        }
      });
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

const createDateSearchFromDateRanges = function (batchConfig) {
  let searchObj = {
    or: [],
  };

  //@ts-ignore
  searchObj.or = batchConfig.dateRanges.map((dateRange: { start, end }) => {
    return {creationdate: {between: [dateRange.start, dateRange.end]}};
  });

  return searchObj;
};

batchConfigs.map((batchConfig) => {
  createDateSearchFromDateRanges(batchConfig);
});

emptySpreadsheet(batchConfigs)
  .then(() => {
    return Promise.map(batchConfigs, (batchConfig: { temperature, chr, quadRange, start, end, platesRange }) => {
      return getChromosomePlateMappings(batchConfig);
    }, {concurrency: 1})
  })
  .then(() => {
    app.winston.info('Done!');
    process.exit(0);
  })
  .catch((error) => {
    app.winston.error(error);
    process.exit(1);
  });

let spreadsheet: Array<{ ScreenName, Chromosome, Plate, Quadrant, condition, barcode, csPlateid, imageDate }> = [];

//TODO Refactor this to search per treatment type (treat_rnai, ctrl_rnai, ctrl_strain, ctrl_null)
function getChromosomePlateMappings(batchConfig) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    spreadsheet = [];
    Promise.map(batchConfig.platesRange, (plateNo: number) => {
      return Promise.map(batchConfig.quadRange, (quad: string) => {
        return app.models.Plate
          .find({
            where: {
              and: [
                createDateSearchFromDateRanges(batchConfig),
                // {
                //   name: {nlike: 'L4440E_M'}
                // },
                // {
                //   name: {nlike: 'L4440E_D_M'}
                // },
                // {
                //   name: {nlike: 'RNAi%_M'}
                // },
                // {
                //   name: {nlike: 'RNAi%_D_M'}
                // },
                {
                  or: [
                    {
                      name: {like: `RNAi${batchConfig.chr}.${plateNo}${quad}%E%`}
                    },
                    {
                      name: {like: `RNAi${batchConfig.chr}.${plateNo}${quad}%_am`}
                    },
                    {
                      name: {like: `RNAi${batchConfig.chr}.${plateNo}${quad}%_am%`}
                    },
                    {
                      name: {like: `RNAi${batchConfig.chr}${plateNo}${quad}%_am`}
                    },
                    {
                      name: {like: `RNAi${batchConfig.chr}.${plateNo}${quad}%am%`}
                    },
                    {
                      name: {like: `RNAi${batchConfig.chr}.${plateNo}${quad}%_am%`}
                    },
                    {
                      name: {like: `RNAi${batchConfig.chr}.${plateNo}${quad}%_am%`}
                    },
                    {
                      name: {like: 'L4440E%'}
                    },
                    {
                      name: {like: `L4440_${barcodeMutant}%`}
                    },
                  ]
                }
              ]
            },
            fields: {
              csPlateid: true,
              creationdate: true,
              name: true,
              imagepath: true,
            }
          })
          .then((results) => {
            app.winston.info(`Success Writing: ${batchConfig.chr} ${plateNo} ${quad}`);
            results = results.filter((result) => {
              return !result.name.match('_M');
            });
            results = orderBy(results, 'name');
            results = customRemovePlates(results);
            // results.map((result: PlateResultSet) => {
            // app.winston.info(`Plate Barcode: ${result.name} ${result.creationdate}`);
            // });
            if (results.length) {
              //@ts-ignore
              spreadsheet.push({
                ScreenName: screenName,
                Chromosome: batchConfig.chr,
                Plate: plateNo,
                Quadrant: quad,
                condition: '',
                barcode: '',
                imageDate: '',
                csPlateid: '',
              });
              let buckets = bucketBarcodes(results, batchConfig.chr, plateNo, quad);
              if (isArray(buckets.treat_rnai) && buckets.treat_rnai.length) {
                return mapOldWorkflow(buckets, batchConfig.chr, plateNo, quad);
              } else {
                return null;
              }
            } else {
              return null;
            }
          })
          .catch((error) => {
            app.winston.error(error);
            return error;
          });
      }, {concurrency: 1})
      //@ts-ignore
        .then((workflows: ExpScreenUploadWorkflowResultSet[]) => {
          workflows = compact(workflows);
          return createWorkflows(workflows);
          // return workflows;
        })
        .catch((error) => {
          app.winston.error(error);
          return new Error(error);
        })
    }, {concurrency: 1})
    //@ts-ignore
      .then((workflows: ExpScreenUploadWorkflowResultSet[]) => {
        //@ts-ignore
        return Promise.mapSeries(batchConfig.platesRange, (plate) => {
          //@ts-ignore
          return Promise.mapSeries(batchConfig.quadRange, (quad) => {
            let data = spreadsheet.filter((row) => {
              return isEqual(row.Chromosome, batchConfig.chr) && isEqual(row.Plate, plate) && isEqual(row.Quadrant, quad);
            });
            let header = true;
            //@ts-ignore
            if (get(seenChr, batchConfig.chr)) {
              header = false;
            }
            let csv = Papa.unparse(data, {
              columns: ['ScreenName', 'Chromosome', 'Plate', 'Quadrant', 'condition', 'barcode', 'csPlateid', 'imageDate'],
              header: header
            });
            csv = csv + "\n";
            seenChr[batchConfig.chr] = true;
            //@ts-ignore
            return appendFile(`/Users/jillian/Dropbox/projects/NY/chemgen-next-all/chemgen-next-data/${screenNameCode}-${batchConfig.chr}.csv`, csv)
              .then(() => {
                app.winston.info(`Success Writing: ${batchConfig.chr} ${plate} ${quad}`);
                return;
              })
              .catch((error) => {
                app.winston.error(error);
                app.winston.info(`Error Writing: ${batchConfig.chr} ${plate} ${quad}`);
                return new Error(error);
              });
          }, {concurrency: 1})
        }, {concurrency: 1});
      })
      .then(() => {
        spreadsheet = [];
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function customRemovePlates(plates: PlateResultSet[]) {
  plates = plates.filter((plate) => {
    return !plate.name.match('_M');
  });

  //These plates are actual plates, but not associated to this screen
  //https://cbi.abudhabi.nyu.edu/jira/browse/WDT-106
  let notThesePlateIds = [12074, 12150, 12075, 12151];
  plates = plates.filter((plate) => {
    return !includes(notThesePlateIds, plate.csPlateid);
  });
  return plates;
}

function createWorkflows(workflows: ExpScreenUploadWorkflowResultSet[]) {
  return new Promise((resolve, reject) => {
    Promise.map(workflows, (workflow: ExpScreenUploadWorkflowResultSet) => {
      return app.models.ExpScreenUploadWorkflow
        .findOrCreate({where: {name: workflow.name}}, workflow)
        .then((results: any) => {
          let tWorkflow: ExpScreenUploadWorkflowResultSet = results[0];
          return app.models.ExpScreenUploadWorkflow.upsert(tWorkflow);
          // return results;
        })
        .then((results) => {
          return results;
        })
        .catch((error) => {
          return new Error(error);
        });
    }, {concurrency: 1})
      .then((results) => {
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      });

  });
}

function bucketBarcodes(plates: PlateResultSet[], chromosome, plateNo: number, quad: string) {
  let buckets = {
    //RNAi_vi
    treat_rnai: [],
    //RNAiE
    ctrl_rnai: [],
    //L4440_vi
    ctrl_strain: [],
    //L4440E
    ctrl_null: [],
  };

  plates.map((plate: PlateResultSet) => {
    if (barcodeIsRNAiMutant(plate)) {
      buckets.treat_rnai.push(plate);
    } else if (barcodeIsRNAiN2(plate)) {
      buckets.ctrl_rnai.push(plate);
    } else if (barcodeIsL4440Mutant(plate)) {
      buckets.ctrl_strain.push(plate);
    } else if (barcodeIsL4440N2(plate)) {
      buckets.ctrl_null.push(plate);
    } else {
      throw new Error('plate does not match any buckets!');
    }
  });
  buckets = filterL4440Plates(buckets, ['treat_rnai', 'ctrl_strain']);
  buckets = filterL4440Plates(buckets, ['ctrl_rnai', 'ctrl_null']);
  addTreatmentGroupsToSpreadSheet(buckets, chromosome, plateNo, quad);
  return buckets;
}

function addTreatmentGroupsToSpreadSheet(buckets, chromosome, plateNo, quad) {
  ['treat_rnai', 'ctrl_strain', 'ctrl_rnai', 'ctrl_null'].map((treatmentGroup) => {
    buckets[treatmentGroup].map((plate: PlateResultSet) => {
      //@ts-ignore
      spreadsheet.push({
        condition: treatmentGroup,
        barcode: plate.name,
        imageDate: plate.creationdate,
        ScreenName: screenName,
        Chromosome: chromosome,
        Plate: plateNo,
        Quadrant: quad,
        csPlateid: plate.csPlateid,
      });
    });
  });
}

function filterL4440Plates(buckets, conditions: Array<string>) {
  let l4440Plates = buckets[conditions[1]].filter((plate: PlateResultSet) => {
    return find(buckets[conditions[0]], (tPlate: PlateResultSet) => {
      //OMG I HATE COMPARING DATES
      return isEqual(tPlate.creationdate, plate.creationdate);
    });
  });

  range(1, 8).map((numberOfDaysToSearch) => {
    if (!l4440Plates.length || l4440Plates.length < buckets[conditions[0]].length) {
      buckets[conditions[1]].filter((plate: PlateResultSet) => {
        return find(buckets[conditions[0]], (tPlate: PlateResultSet) => {
          let thisPlateDate = moment(tPlate.creationdate).format('YYYY MM DD');
          let mDateA1 = moment(plate.creationdate).add(numberOfDaysToSearch, 'days').format('YYYY MM DD');
          return isEqual(thisPlateDate, mDateA1);
        });
      }).map((plate) => {
        l4440Plates.push(plate);
      });
    }
  });

  range(1, 8).map((numberOfDaysToSearch) => {
    if (!l4440Plates.length || l4440Plates.length < buckets[conditions[0]].length) {
      buckets[conditions[1]].filter((plate: PlateResultSet) => {
        return find(buckets[conditions[0]], (tPlate: PlateResultSet) => {
          let thisPlateDate = moment(tPlate.creationdate).format('YYYY MM DD');
          let mDateS1 = moment(plate.creationdate).subtract(numberOfDaysToSearch, 'days').format('YYYY MM DD');
          return isEqual(thisPlateDate, mDateS1);
        });
      }).map((plate) => {
        l4440Plates.push(plate);
      });
    }
  });
  //For most things lodash can work its magic, but for more complex operations it won't deal with classes
  l4440Plates = JSON.parse(JSON.stringify(l4440Plates));
  l4440Plates = uniqWith(l4440Plates, isEqual);
  buckets[conditions[1]] = l4440Plates;

  return buckets;
}

function barcodeIsRNAiMutant(plate: PlateResultSet) {
  if (plate.name.match(/RNA/) && plate.name.match(/_am/)) {
    return true;
  } else {
    return false;
  }
}

function barcodeIsRNAiN2(plate: PlateResultSet) {
  if (plate.name.match(/RNA/) && plate.name.match(/E/)) {
    return true;
  } else {
    return false;
  }
}

function barcodeIsL4440Mutant(plate: PlateResultSet) {
  if (plate.name.match(/L4440/) && plate.name.match(/_am/)) {
    return true;
  } else {
    return false;
  }
}

function barcodeIsL4440N2(plate: PlateResultSet) {
  if (plate.name.match(/L4440/) && !plate.name.match(/_am/)) {
    return true;
  } else {
    return false;
  }
}

function mapOldWorkflow(buckets, chrom, plate, quadrant) {

  let primaryWorkflow: ExpScreenUploadWorkflowResultSet = deepcopy(minimal);
  [quadrant, chrom, plate].map((thing) => {
    if (isNull(thing)) {

      console.error('Things are missing that should not be missing!');
      // console.error(JSON.stringify(workflowData.search));
      process.exit(1);
    }
  });

  let dates: Array<any> = buckets.treat_rnai.map((plate: PlateResultSet) => {
    return plate.creationdate;
  }).sort();

  primaryWorkflow.search.rnaiLibrary.plate = plate;
  primaryWorkflow.search.rnaiLibrary.quadrant = quadrant;
  primaryWorkflow.search.rnaiLibrary.chrom = chrom;
  primaryWorkflow.stockPrepDate = dates[0];
  primaryWorkflow.assayDates = dates;
  primaryWorkflow.replicates = {};
  buckets.treat_rnai.map((plate: PlateResultSet, index: number) => {
    //@ts-ignore
    if (!has(primaryWorkflow.replicates, index + 1)) {
      primaryWorkflow.replicates[index + 1] = [];
    }
    try {
      primaryWorkflow.replicates[index + 1].push(plate.csPlateid);
    } catch (error) {
      return (new Error(error));
    }
  });
  buckets.ctrl_rnai.map((plate: PlateResultSet, index: number) => {
    //@ts-ignore
    if (!has(primaryWorkflow.replicates, index + 1)) {
      primaryWorkflow.replicates[index + 1] = [];
    }
    primaryWorkflow.replicates[index + 1].push(plate.csPlateid);
  });
  primaryWorkflow.screenName = screenName;
  primaryWorkflow.screenId = screenId;
  primaryWorkflow.temperature = temperature;
  primaryWorkflow.name = `AHR2 ${moment(dates[0]).format('YYYY-MM-DD')} ${expBiosampleName} ${controlBiosampleName} ${screenType} Chr ${chrom} Plate ${plate} Q ${quadrant}`;
  primaryWorkflow.comment = "migration upload";
  primaryWorkflow.screenType = screenType;

  ['treat_rnai', 'ctrl_rnai', 'ctrl_strain', 'ctrl_null'].map((condition) => {
    buckets[condition].map((plate: PlateResultSet) => {
      //@ts-ignore
      plate.instrumentPlateId = plate.csPlateid;
      plate = JSON.parse(JSON.stringify(plate));
    });
  });
  primaryWorkflow.experimentGroups.treat_rnai.plates = buckets.treat_rnai;
  primaryWorkflow.experimentGroups.treat_rnai.biosampleId = expBiosampleId;
  primaryWorkflow.experimentGroups.ctrl_rnai.plates = buckets.ctrl_rnai;
  primaryWorkflow.experimentGroups.ctrl_rnai.biosampleId = controlBiosampleId;
  primaryWorkflow.experimentGroups.ctrl_strain.plates = buckets.ctrl_strain;
  primaryWorkflow.experimentGroups.ctrl_strain.biosampleId = expBiosampleId;
  primaryWorkflow.experimentGroups.ctrl_null.plates = buckets.ctrl_null;
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
