#!/usr/bin/env node

import app = require('../../../../server/server.js');
import {filter,uniqWith, groupBy, isObject, uniqBy, isEqual, isArray, find, get, uniq, includes, compact} from 'lodash';
import Promise = require('bluebird');
import Papa = require('papaparse');
import deepcopy = require('deepcopy');
import {
  ExpBiosampleResultSet, ExpScreenResultSet,
  PlatePlan96ResultSet,
  RnaiLibraryResultSet,
  RnaiWormbaseXrefsResultSet
} from "../../../../common/types/sdk/models";
import {ExpScreenUploadWorkflowResultSet} from "../../../../../chemgen-next-client/src/types/sdk/models";

const path = require('path');
const fs = require('fs');
const hash = require('object-hash');

let file = 'eegi-denorm-2012-all.csv';
let eegi = path.resolve(__dirname, file);
let wormStrains = path.resolve(__dirname, 'worm_strain_table_ny.csv');

let problemGroups = {};
// Image urls look like this - http://eegi.bio.nyu.edu/image/32412/Tile000006.bmp
// eegi.bio.nyu.edu/${plateId}/tileMappingWell.bmp

// parseCSVFile(eegi)
//   .then((eegiResults: EegiResults[]) => {
//     app.winston.info('Finished parsing csv');
//     // const groupedResults: any = createExpGroups(eegiResults);
//     let groupedResults = groupByPlatePlanHash(eegiResults);
//     return;
//   })
//   .catch((error) => {
//     return new Error(error);
//   });

parseCSVFile(eegi)
  .then((eegiResults: EegiResults[]) => {
    app.winston.info('Finished parsing csv');
    // const groupedResults: any = createExpGroups(eegiResults);
    const groupedResults: any = groupByPlatePlanHash(eegiResults);
    app.winston.info('Finished Grouping Results');
    return extractPlates(groupedResults)
      .then((platePlans: PlatePlan96ResultSet[]) => {
        app.winston.info('Finishing extracting plates');
        return createScreens(groupedResults)
          .then((screens: ExpScreenResultSet[]) => {
            app.winston.info('Finished creating screens!');
            screens = uniqBy(screens, 'screenName');
            return createBiosamples(groupedResults)
              .then((biosamples: ExpBiosampleResultSet[]) => {
                app.winston.info('Finished creating biosamples');
                app.winston.info('Begin creating expScreenUploadWorkflows');
                return createExpScreenWorkflows(groupedResults, screens, biosamples, platePlans);
              })
              .then((results: ExpScreenUploadWorkflowResultSet[]) => {
                app.winston.info('Finished creating expScreenUploadWorkflows');
                // return results;
                //@ts-ignore
                return Promise.map(results, (workflow: ExpScreenUploadWorkflowResultSet) => {
                  app.winston.info('Doing work...');
                  return app.models.ExpScreenUploadWorkflow.load.workflows.worms.doWork(workflow);
                  // return app.models.ExpScreenUploadWorkflow.findOrCreate({where: {name: workflow.name}}, workflow)
                }, {concurrency: 1})
                  .then(() => {
                    return;
                  })
                  .catch((error) => {
                    return (new Error(error));
                  });
              })
              .catch((error) => {
                return (new Error(error));
              })
          })
          .catch((error) => {
            return new Error(error);
          })

        // console.log('finished');
        // process.exit(0);
      })
      .catch((error) => {
        console.log(`Error: ${error}`);
        process.exit(1);
      });
  })
  .catch((error) => {
    console.log(`Error: ${error}`);
    process.exit(1);
  });

function parseCSVFile(csvFile) {
  return new Promise((resolve, reject) => {
    Papa.parse(fs.createReadStream(csvFile), {
      header: true,
      complete: function (results) {
        resolve(results.data);
      },
    });
  });
}

/**
 * This returns a very nested group of group of groups
 * platePlanHash
 *    wormGene
 *        Temperature
 *            Barcode
 * @param eegiResults
 */
function groupByPlatePlanHash(eegiResults: EegiResults[]) {
  let dataCSV = [];
  eegiResults = filterForAhringerLibrary(eegiResults);
  const plates = groupBy(eegiResults, 'experiment.plate_id');
  eegiResults = [];
  Object.keys(plates).map((plateId: string) => {
    let platePlanHash = hash(plates[plateId].map((eegiResult: EegiResults) => {
      return eegiResult['clone.id'];
    }));
    plates[plateId].map((eegiResult: EegiResults) => {
      // const libraryStock = eegiResult['experiment.library_stock_id'].replace(/_.*$/, '');
      const barcode = `RNAi--${eegiResult['experimentplate.date']}--${eegiResult['experimentplate.temperature']}--${eegiResult['wormstrain.gene']}--${eegiResult['librarystock.plate_id']}--${eegiResult["experiment.plate_id"]}`;
      eegiResult['platePlanHash'] = platePlanHash;
      eegiResult.barcode = barcode;
      eegiResults.push(eegiResult);
    });
  });

  let platePlanGroup: {} = groupBy(eegiResults, 'platePlanHash');
  Object.keys(platePlanGroup).map((platePlanHash: string) => {
    let wormGroup: {} = groupBy(platePlanGroup[platePlanHash], 'wormstrain.gene');
    // platePlanGroup[platePlanHash] = wormGroup;
    Object.keys(wormGroup).map((wormGene: string) => {
      let temperatureGroup: {} = groupBy(wormGroup[wormGene], 'experimentplate.temperature');
      Object.keys(temperatureGroup).map((temp: string) => {
        temperatureGroup[temp].map((eegiResult: EegiResults) => {
          const yearRegexp = new RegExp('\\d{4}');
          let experimentDate = eegiResult['experimentplate.date'];
          const year = yearRegexp.exec(experimentDate)[0];
          eegiResult.group = `RNAi--Ahringer--${year}--${wormGene}--${temp}--${eegiResult['librarystock.plate_id']}--${platePlanHash}`;
          eegiResult.name = `RNAi Ahringer ${year} ${wormGene} ${temp} ${eegiResult['librarystock.plate_id']} ${platePlanHash}`;
          if (!isEqual(eegiResult["experiment.worm_strain_id"], 'N2')) {
            if (isEqual(eegiResult["experimentplate.temperature"], eegiResult['wormstrain.permissive_temperature'])) {
              eegiResult.screenType = 'permissive';
              eegiResult.screenStage = 'secondary';
              eegiResult.screenName = `NY RNAi Ahringer Secondary ${eegiResult["wormstrain.genotype"]} Permissive Screen`;
            } else {
              eegiResult.screenType = 'restrictive';
              eegiResult.screenStage = 'secondary';
              eegiResult.screenName = `NY RNAi Ahringer Secondary ${eegiResult["wormstrain.genotype"]} Restrictive Screen`;
            }
          }
        });
        let plateGroup: {} = groupBy(temperatureGroup[temp], 'barcode');
        let replicates = Object.keys(plateGroup).length;
        Object.keys(plateGroup).map((barcode: string) => {
          dataCSV.push({
            PlatePlanHash: platePlanHash,
            barcode: barcode,
            wormStrain: wormGene,
            temperature: temp,
            replicates: replicates
          });
        });
        temperatureGroup[temp] = plateGroup;
        return;
      });
      wormGroup[wormGene] = temperatureGroup;
      return;
    });
    platePlanGroup[platePlanHash] = wormGroup;
    return;
  });
  fs.writeFileSync(path.join(__dirname, 'eeegi-denorm-2014-all-report.csv'), Papa.unparse(dataCSV));
  return platePlanGroup;
}

function filterForAhringerLibrary(eegiResults) {
  const plates = groupBy(eegiResults, 'experiment.plate_id');
  let teegiResults = [];
  Object.keys(plates).map((plateId) => {
    if (find(plates[plateId], {'clone.library': 'Ahringer'})) {
      plates[plateId].map((eegiResult: EegiResults) => {
        teegiResults.push(eegiResult);
      })
    }
  });

  return teegiResults;
}

/**
 * Create the screens
 *   {
    "screenId": 0,
    "screenName": "string",
    "screenType": "string",
    "screenStage": "string",
    "screenDescription": "string",
    "screenProtocol": "string",
    "screenParentId": 0,
    "screenPerformedBy": "string",
    "screenMeta": "string"
  }
 * @param groupedResults
 */
function createScreens(groupedResults: any) {
  let createScreens: ExpScreenResultSet[] = [];
  return new Promise((resolve, reject) => {

    Object.keys(groupedResults).map((platePlanHash) => {
      Object.keys(groupedResults[platePlanHash]).map((wormStrain) => {
        Object.keys(groupedResults[platePlanHash][wormStrain]).map((temperatureKey) =>{
          let plateR1Key = Object.keys(groupedResults[platePlanHash][wormStrain][temperatureKey])[0];
          let firstWell: EegiResults = groupedResults[platePlanHash][wormStrain][temperatureKey][plateR1Key][0];
          if (!find(createScreens, {screeName: firstWell['screenName']})) {
            let screen: ExpScreenResultSet = new ExpScreenResultSet({
              screenName: firstWell.screenName,
              screenStage: firstWell.screenStage,
              screenType: firstWell.screenType,
            });
            createScreens.push(screen);
          }
        });
      });
    });
    createScreens = uniqWith(createScreens, isEqual);
    createScreens = compact(createScreens);

    // @ts-ignore
    Promise.map(createScreens, (screen: ExpScreenResultSet) => {
      return app.models.ExpScreen
        .findOrCreate({where: app.etlWorkflow.helpers.findOrCreateObj(screen)}, screen)
        .then((results) => {
          return results[0];
        })
        .catch((error) => {
          return new Error(error);
        })
    }, {concurrency: 1})
      .then((results: ExpScreenResultSet[]) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });

  });
}


/**
 * Create the biosamples
 * {
    "biosampleId": 0,
    "biosampleName": "string",
    "biosampleType": "string",
    "biosampleSpecies": "string",
    "biosampleStrain": "string",
    "biosampleGene": "string",
    "biosampleAllele": "string",
    "biosampleMeta": "string"
  }
 * @param groupedResults
 */
function createBiosamples(groupedResults: any) {
  let createThese: ExpBiosampleResultSet[] = [];
  Object.keys(groupedResults).map((platePlanHash) => {
    Object.keys(groupedResults[platePlanHash]).map((wormStrain) => {
      Object.keys(groupedResults[platePlanHash][wormStrain]).map((temperatureKey) =>{
        let plateR1Key = Object.keys(groupedResults[platePlanHash][wormStrain][temperatureKey])[0];
        let plateR1 = groupedResults[platePlanHash][wormStrain][temperatureKey][plateR1Key][0];
        if (!find(createThese, {biosampleGene: plateR1['wormstrain.gene']})) {
          let biosample: ExpBiosampleResultSet = new ExpBiosampleResultSet({
            biosampleType: 'worm',
            biosampleAllele: plateR1['wormstrain.allele'],
            biosampleGene: plateR1['wormstrain.gene'],
            biosampleStrain: plateR1['wormstrain.id'],
            biosampleName: plateR1['wormstrain.allele'] || 'N2',
            biosampleMeta: JSON.stringify({
              allele: plateR1['wormstrain.allele'],
              gene: plateR1['wormstrain.gene'],
              id: plateR1['wormstrain.id'],
              permissiveTemp: plateR1['wormstrain.permissive_temperature'],
              restrictiveTemp: plateR1['wormstrain.restrictive_temperature'],
              genotype: plateR1['wormstrain.genotype'],
            }),
          });
          createThese.push(biosample);
        }

      });
    });
  });

  createThese = uniqBy(createThese, 'biosampleStrain');

  return new Promise((resolve, reject) => {
    // @ts-ignore
    Promise.map(createThese, (biosample: ExpBiosampleResultSet) => {
      return app.models.ExpBiosample
        .findOrCreate({where: app.etlWorkflow.helpers.findOrCreateObj(biosample)}, biosample)
        .then((results) => {
          return results[0];
        })
        .catch((error) => {
          return new Error(error);
        });
    }, {concurrency: 1})
      .then((results: ExpBiosampleResultSet[]) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

/**
 * {
 *     RNAi--2012-01-18--22.5--universal-F2: {
 *         AR1: {
 *             Replicate1: [wells],
 *             Replicate2: [wells]
 *             Replicate3: [wells],
 *             Replicate4: [wells]
 *         },
 *         EU856: {
 *             Replicate1: [wells],
 *             Replicate2: [wells]
 *             Replicate3: [wells],
 *             Replicate4: [wells]
 *         },
 *         N2: {
 *             Replicate1: [wells],
 *             Replicate2: [wells]
 *         }
 *     }
 * }
 * @param groupedResults
 * @param screens
 * @param biosamples
 */
function createExpScreenWorkflows(groupedResults: any, screens: ExpScreenResultSet[], biosamples: ExpBiosampleResultSet[], platePlans: PlatePlan96ResultSet[]) {
  let workflows: ExpScreenUploadWorkflowResultSet[] = [];
  Object.keys(groupedResults).map((platePlanHash: string) => {
    //Top Level is the Experiment Group Key
    let N2: any = null;
    if (get(groupedResults[platePlanHash], 'N2')) {
      N2 = deepcopy(groupedResults[platePlanHash].N2);
      delete groupedResults[platePlanHash].N2;
    }

    try {
      Object.keys(groupedResults[platePlanHash]).map((mutantWormStrain: string) => {
        let wormGroup = groupedResults[platePlanHash][mutantWormStrain];
        Object.keys(wormGroup).map((temperature) => {
          //Begin actual workflow creation
          let plateR1 = Object.keys(groupedResults[platePlanHash][mutantWormStrain][temperature])[0];
          let firstWell: EegiResults = groupedResults[platePlanHash][mutantWormStrain][temperature][plateR1][0];
          if (!isObject(firstWell)) {
            console.log(`Results malformed. No First Well!`);
            return;
          } else {
            let wormRecord = find(biosamples, {biosampleGene: firstWell['wormstrain.gene']});
            let screenRecord = find(screens, {screenName: firstWell.screenName});
            const yearRegexp = new RegExp('\\d{4}');
            let experimentDate = firstWell['experimentplate.date'];
            const year = yearRegexp.exec(experimentDate)[0];
            let platePlan = find(platePlans, {platePlanName: `NY ${year} ${firstWell['platePlanHash']}`});
            if (!wormRecord) {
              throw new Error(`No worm record found!`);
            }
            if (!screenRecord) {
              throw new Error(`No ScreenRecord Found!`);
            }
            if (!platePlan) {
              throw new Error(`No PlatePlan Found!`);
            }

            let thisWorkflow: ExpScreenUploadWorkflowResultSet = deepcopy(minimalWorkflow);
            thisWorkflow['site'] = 'NY';
            thisWorkflow.name = firstWell.name;
            thisWorkflow.screenName = firstWell.screenName;
            thisWorkflow.screenStage = firstWell.screenStage;
            thisWorkflow.screenType = firstWell.screenType;
            thisWorkflow.temperature = firstWell['experimentplate.temperature'];
            try {
              thisWorkflow.screenId = screenRecord.screenId;
            } catch (error) {
              throw new Error(`Error with screen data in workflow! ${error}`);
            }
            thisWorkflow.instrumentId = 3;
            thisWorkflow.libraryId = 1;
            thisWorkflow.librarycode = 'ahringer2';
            thisWorkflow.assayViewType = "exp_assay_ahringer2";
            thisWorkflow.plateViewType = "exp_plate_ahringer2";
            thisWorkflow.biosamples = {
              "experimentBiosample": {
                "id": wormRecord.biosampleId,
                "name": wormRecord.biosampleGene
              }, "ctrlBiosample": {"id": "4", "name": "N2"}
            };


            try {

              // Add Plates
              thisWorkflow.experimentGroups = {};
              thisWorkflow.experimentGroups.treat_rnai = {};
              thisWorkflow.experimentGroups.treat_rnai.plates = [];
              thisWorkflow.experimentGroups.treat_rnai.biosampleId = wormRecord.biosampleId;

            } catch (error) {
              throw new Error(`Something went wrong initializing wormRecords! ${error}`);
            }

            let mutantWormStrainImageDates = [];

            Object.keys(groupedResults[platePlanHash][mutantWormStrain][temperature]).map((plateId: number) => {
              try {
                let firstWell: EegiResults = groupedResults[platePlanHash][mutantWormStrain][temperature][plateId][0];
                let plateRecord: any = {
                  "csPlateid": firstWell["experiment.plate_id"],
                  "id": firstWell["experiment.plate_id"],
                  "name": firstWell.barcode,
                  "creationdate": firstWell["experimentplate.date"],
                  "imagepath": firstWell['experiment.plate_id'],
                  "platebarcode": firstWell.barcode,
                  "instrumentPlateId": firstWell['experiment.plate_id']
                };
                mutantWormStrainImageDates.push(plateRecord.creationdate);
                thisWorkflow.experimentGroups.treat_rnai.plates.push(plateRecord);
              } catch (error) {
                throw new Error(`Something went wrong adding treatRNAi plates! ${error}`);
              }
            });
            mutantWormStrainImageDates = uniq(mutantWormStrainImageDates);

            thisWorkflow.experimentGroups.ctrl_rnai = {};
            thisWorkflow.experimentGroups.ctrl_rnai.plates = [];
            thisWorkflow.experimentGroups.ctrl_rnai.biosampleId = 4;

            if (N2 && get(N2, temperature)) {
              Object.keys(N2[temperature]).map((plateId: number) => {
                try {
                  let firstWell: EegiResults;
                  if (get(N2, [temperature, plateId, 0])) {
                    firstWell = N2[temperature][plateId][0];
                  }
                  let plateRecord: any = {
                    "csPlateid": firstWell["experiment.plate_id"],
                    "id": firstWell["experiment.plate_id"],
                    "name": firstWell.barcode,
                    "creationdate": firstWell["experimentplate.date"],
                    "imagepath": firstWell['experiment.plate_id'],
                    "platebarcode": firstWell.barcode,
                    "instrumentPlateId": firstWell['experiment.plate_id']
                  };
                  if (includes(mutantWormStrainImageDates, plateRecord.creationdate)) {
                    thisWorkflow.experimentGroups.ctrl_rnai.plates.push(plateRecord);
                  }
                } catch (error) {
                  throw new Error(`Something went wrong adding N2 plates! ${error}`);
                }
              });
            }

            try {
              thisWorkflow.replicates = [];
              thisWorkflow.experimentGroups.treat_rnai.plates.map((plate) => {
                thisWorkflow.replicates.push([plate.id]);
              });
              thisWorkflow.experimentGroups.ctrl_rnai.plates.map((plate, index) => {
                if (index < thisWorkflow.experimentGroups.treat_rnai.plates.length) {
                  thisWorkflow.replicates[index].push(plate.id);
                } else {
                  thisWorkflow.replicates[thisWorkflow.replicates.length - 1].push(plate.id);
                }
              });
              thisWorkflow.platePlanId = String(platePlan.id);
              thisWorkflow.platePlan = platePlan;
              thisWorkflow.instrumentLookUp = 'nyMicroscope';
            } catch (error) {
              throw new Error(`There was an error with the last piece! ${error}`);
            }
            workflows.push(thisWorkflow);
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  });
  return new Promise((resolve, reject) => {
    workflows = compact(workflows);
    //@ts-ignore
    Promise.map(workflows, (workflow: ExpScreenUploadWorkflowResultSet) => {
      return app.models.ExpScreenUploadWorkflow
        .findOrCreate({where: {name: workflow.name}}, JSON.parse(JSON.stringify(workflow)))
        .then((results) => {
          results[0].platePlanId = workflow.platePlanId;
          results[0].instrumentLookUp = workflow.instrumentLookUp;
          return app.models.ExpScreenUploadWorkflow.upsert(results[0]);
          // return contactSheetResults[0];
        })
        .catch((error) => {
          return new Error(error);
        })
    }, {concurrency: 1})
      .then((results: ExpScreenUploadWorkflowResultSet[]) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
}

function extractPlates(groupedResults: any) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    Promise.map(Object.keys(groupedResults), (platePlanHash: string) => {
      let wormStrain = Object.keys(groupedResults[platePlanHash])[0];
      let temperature = Object.keys(groupedResults[platePlanHash][wormStrain])[0];
      let plateKey = Object.keys(groupedResults[platePlanHash][wormStrain][temperature])[0];
      let plate = groupedResults[platePlanHash][wormStrain][temperature][plateKey];
      return createPlatePlan(plate, platePlanHash)
    }, {concurrency: 1})
      .then((platePlans: PlatePlan96ResultSet[]) => {
        return createPlatePlans(platePlans);
      })
      .then((platePlans: PlatePlan96ResultSet[]) => {
        resolve(platePlans);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function createPlatePlan(plate: Array<EegiResults>, group: string) {
  return new Promise((resolve, reject) => {
    if (isArray(plate)) {
      let geneNames = plate.map((well) => {
        return well['clone.id'].replace('sjj_', '');
      });
      //@ts-ignore
      const growthHormones: Array<string> = plate.filter((well) => {
        let match = well['clone.id'].match('GHR-');
        return match;
      });
      const growthHormoneRecords = growthHormones.map((ghr: string) => {
        return {
          libraryId: 1,
          geneName: ghr,
          plate: 'G',
          bioloc: 'G',
          stocktitle: 'G',
          well: 'GHR',
          fwdPrimer: 'GHR',
          revPrimer: 'GHR',
          chrom: 'GHR',
          rnaiType: 'GHR',
          stockloc: 'GHR'
        };
      });
      let platePlan: PlatePlan96ResultSet = new PlatePlan96ResultSet();
      //@ts-ignore
      Promise.map(growthHormoneRecords, (growthHormones) => {
        return app.models.RnaiLibrary
        //@ts-ignore
          .findOrCreate({where: {geneName: growthHormones.geneName}}, growthHormones);
      }, {concurrency: 1})
        .then((growthResults) => {
          return app.models.RnaiLibrary
            .find({
              where: {
                and: [
                  {
                    geneName: {
                      inq: geneNames,
                    }
                  },
                  {
                    plate: {
                      nlike: 'S%',
                    },
                  }
                ]
              }
            })

        })
        .then((rnaiLibaryResults: RnaiLibraryResultSet[]) => {
          return app.models.RnaiWormbaseXrefs
            .find({
              where: {
                wbGeneSequenceId: {
                  inq: rnaiLibaryResults.map((rnaiLibraryResult) => {
                    return rnaiLibraryResult.geneName;
                  })
                },
              }
            })
            .then((rnaiXrefs: RnaiWormbaseXrefsResultSet[]) => {
              //JOIN
              plate.map((eegiResult: EegiResults) => {
                platePlan[eegiResult['experiment.well']] = {};
                if (isEqual(eegiResult['clone.id'], 'L4440')) {
                  //Its an L4440 Well
                  platePlan[eegiResult['experiment.well']] = {
                    "isValid": true,
                    "well": eegiResult['experiment.well'],
                    "taxTerm": "L4440",
                    "geneName": "L4440",
                    "lookUp": "L4440",
                    "geneData": {}
                  };
                } else {
                  // Theres a gene
                  let rnaiResult = find(rnaiLibaryResults, {'geneName': eegiResult['clone.id'].replace('sjj_', '')});
                  if (rnaiResult) {
                    let rnaiXref = find(rnaiXrefs, {wbGeneSequenceId: String(rnaiResult.geneName)});
                    platePlan[eegiResult['experiment.well']] = {
                      "isValid": true,
                      "well": eegiResult['experiment.well'],
                      "taxTerm": eegiResult['clone.id'].replace('sjj_', ''),
                      "geneName": eegiResult['clone.id'].replace('sjj_', ''),
                      "lookUp": rnaiResult.bioloc,
                      "geneData": rnaiXref,
                      "parentLibrary": rnaiResult,
                    };
                  } else {
                    // Its an empty well
                    platePlan[eegiResult['experiment.well']] = {
                      "isValid": true,
                      "well": eegiResult['experiment.well'],
                      geneData: {},
                    };
                  }
                }
              });
              // @ts-ignore
              platePlan.platePlanUploadDate = new Date();
              const yearRegexp = new RegExp('\\d{4}');
              let experimentDate = plate[0]['experimentplate.date'];
              const year = yearRegexp.exec(experimentDate)[0];
              platePlan.platePlanName = `NY ${year} ${plate[0]['platePlanHash']}`;
              platePlan.site = 'NY';
              return platePlan;
            })
            .catch((error) => {
              return new Error(error);
            })
        })
        .then((platePlan) => {
          resolve(platePlan);
        })
        .catch((error) => {
          reject(new Error(error));
        });

    } else {
      resolve(null);
    }
  });
}

function createPlatePlans(platePlans: PlatePlan96ResultSet[]) {

  return new Promise((resolve, reject) => {
    platePlans = compact(platePlans);
    //@ts-ignore
    Promise.map(platePlans, (platePlan: PlatePlan96ResultSet) => {
      return app.models.PlatePlan96
        .findOrCreate({where: {platePlanName: platePlan.platePlanName}}, JSON.parse(JSON.stringify(platePlan)))
        .then((results) => {
          return results[0];
        })
        .catch((error) => {
          return new Error(error);
        })
    }, {concurrency: 1})
      .then((results: PlatePlan96ResultSet[]) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

declare var Object: any;

export interface WormStrainsInterface {
  id: string;
  gene: string;
  genotype?: string;
  permissive_temperature?: number;
  restrictive_temperature?: number;
}

export class WormStrains implements WormStrainsInterface {
  id: string;
  gene: string;
  genotype?: string;
  permissive_temperature?: number;
  restrictive_temperature?: number;

  constructor(data?: WormStrainsInterface) {
    Object.assign(this, data);
  }
}

export interface EegiResultsInterface {
  batch?: string;
  'experiment.worm_strain_id': string;
  'experimentplate.temperature': string;
  'experimentplate.date': string;
  'experiment.library_stock_id': string;
  'experiment.well': string;
  'wormstrain.permissive_temperature': string;
  'wormstrain.restrictive_temperature': string;
  barcode?: string;
  group?: string;
  screenStage?: string;
  screenType?: string;
  screenName?: string;
  'wormstrain.allele'?: string;
  'wormstrain.gene'?: string;
  'wormstrain.id'?: string;
  'wormstrain.genotype'?: string;
  'experiment.plate_id'?: string;
  'experimentplate.well'?: string;
  name?: string;
}

export class EegiResults implements EegiResultsInterface {
  batch?: string;
  'experiment.worm_strain_id': string;
  'experimentplate.temperature': string;
  'experimentplate.date': string;
  'experiment.library_stock_id': string;
  'experiment.well': string;
  'wormstrain.permissive_temperature': string;
  'wormstrain.restrictive_temperature': string;
  barcode ?: string;
  group ?: string;
  screenStage ?: string;
  screenType?: string;
  screenName ?: string;
  name ?: string;
  'wormstrain.allele'?: string;
  'wormstrain.gene'?: string;
  'wormstrain.id'?: string;
  'wormstrain.genotype'?: string;
  'experiment.plate_id'?: string;
  'experimentplate.well'?: string;

  constructor(data?: EegiResultsInterface) {
    Object.assign(this, data);
  }
}

let minimalWorkflow = {
  "name": "AHR2 2018-04 mip-1;mip-2 Restrictive 25",
  "comment": "reupload",
  platePlan: {},
  "platePlanId": "5af2d2db91f1d80107d9689b",
  "assayViewType": "exp_assay_ahringer2",
  "plateViewType": "exp_plate_ahringer2",
  "instrumentPlateIdLookup": "csPlateid",
  "wells": ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10", "A11", "A12", "B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09", "B10", "B11", "B12", "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C12", "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11", "D12", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12", "G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10", "G11", "G12", "H01", "H02", "H03", "H04", "H05", "H06", "H07", "H08", "H09", "H10", "H11", "H12"],
  "screenId": 7,
  "instrumentId": 1,
  "libraryId": 1,
  "screenStage": "secondary",
  "screenType": "restrictive",
  "biosamples": {"experimentBiosample": {"id": "6", "name": "mip-1;mip-2"}, "ctrlBiosample": {"id": "4", "name": "N2"}},
  "libraryModel": "RnaiLibrary",
  "libraryStockModel": "RnaiLibraryStock",
  "reagentLookUp": "rnaiId",
  "instrumentLookUp": "arrayScan",
  "biosampleType": "worm",
  "replicates": [["9807", "9799"], ["9808", "9800"], ["9809", "9801"], ["9810", "9802"], ["9811", "9803"], ["9812", "9804"], ["9813", "9805"], ["9814", "9806"]],
  "conditions": ["treat_rnai", "ctrl_rnai", "ctrl_null", "ctrl_strain"],
  "controlConditions": ["ctrl_strain", "ctrl_null"],
  "experimentConditions": ["treat_rnai", "ctrl_rnai"],
  "biosampleMatchConditions": {"treat_rnai": "ctrl_strain", "ctrl_rnai": "ctrl_null"},
  "experimentMatchConditions": {"treat_rnai": "ctrl_rnai"},
  "experimentDesign": {"treat_rnai": ["ctrl_rnai", "ctrl_strain", "ctrl_null"]},
  "experimentGroups": {
    "treat_rnai": {
      "plates": [{
        "csPlateid": "9814",
        "id": "cx5-pc180429150006",
        "name": "RNAi_Rescreen_Apr_mip_25_8",
        "creationdate": "2018-04-29T00:00:00.000Z",
        "imagepath": "\\\\aduae120-wap\\CS_DATA_SHARE\\2018Apr23\\cx5-pc180429150006\\",
        "platebarcode": "CX5-PC15:28:46",
        "instrumentPlateId": 9814
      }], "biosampleId": "6"
    },
    "ctrl_rnai": {
      "plates": [{
        "csPlateid": "9806",
        "id": "cx5-pc180429140008",
        "name": "RNAi_Rescreen_Apr_N2_25_8",
        "creationdate": "2018-04-29T00:00:00.000Z",
        "imagepath": "\\\\aduae120-wap\\CS_DATA_SHARE\\2018Apr23\\cx5-pc180429140008\\",
        "platebarcode": "CX5-PC14:44:38",
        "instrumentPlateId": 9806
      }], "biosampleId": "4"
    },
    "ctrl_strain": {"biosampleId": "6", "plates": []},
    "ctrl_null": {"biosampleId": "4", "plates": []}
  },
  "temperature": 25,
  "librarycode": "ahringer2",
  "screenName": "mip-1;mip-2 Secondary RNAi Restrictive Screen"
};
