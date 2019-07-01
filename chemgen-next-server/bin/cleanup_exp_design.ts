#!/usr/bin/env node

/*
Somehow, someway, there got to be more ctrl_null and ctrl_strain than there SHOULD HAVE BEEN
 */

let findDuplicateExpGroupsWithCounts = `
SELECT exp_group_type, COUNT( exp_group_type ) , screen_id, COUNT( screen_id ) , exp_workflow_id, COUNT( exp_workflow_id ) , library_id, COUNT( library_id ) , biosample_id, COUNT( biosample_id ) , well, COUNT( well ) , screen_id, COUNT( screen_id )
FROM exp_group
GROUP BY exp_group_type, screen_id, library_id, biosample_id, well, exp_workflow_id
HAVING COUNT( screen_id ) >1
AND COUNT( exp_group_type ) >1
AND COUNT( library_id ) >1
AND COUNT( biosample_id ) >1
AND COUNT( well ) >1
`;
let findDuplicateExpGroups = `
SELECT exp_group_type , screen_id, exp_workflow_id,  library_id,  biosample_id,  well,  screen_id
FROM exp_group
GROUP BY exp_group_type, screen_id, library_id, biosample_id, well, exp_workflow_id
HAVING COUNT( screen_id ) >1
AND COUNT( exp_group_type ) >1
AND COUNT( library_id ) >1
AND COUNT( biosample_id ) >1
AND COUNT( well ) >1
`;

const app = require('../server/server');
import Promise = require('bluebird');
import {
  ExpAssay2reagentResultSet,
  ExpAssayResultSet,
  ExpDesignResultSet, ExpGroupResultSet, ExpScreenResultSet, ModelPredictedCountsResultSet, RnaiLibraryResultSet,
  RnaiWormbaseXrefsResultSet
} from "../common/types/sdk/models";
import {range, groupBy, isEqual, shuffle, isEmpty, uniqBy, sortedUniq} from 'lodash';

const path = require('path');
const fs = require('fs');

countExpDesigns()
  .then((paginationResults) => {
    return getPagedExpDesigns(paginationResults)
  })
  .then(() => {
    console.log('finished!');
    process.exit(0)
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

function getPagedExpDesigns(paginationResults) {
  return new Promise((resolve, reject) => {
    Promise.map(paginationResults.pages, (page) => {
      let skip = Number(page) * Number(paginationResults.limit);
      // console.log(`Page: ${page} Skip: ${skip}`);
      return app.models.ExpDesign
        .find({
          limit: paginationResults.limit,
          skip: skip,
          // where: {
          //   or: [
          //     // {treatmentGroupId: 70765},
          //     // {treatmentGroupId: 70764},
          //     // {treatmentGroupId: 70766}
          //   ]
          // },
        })
        .then((results: ExpDesignResultSet[]) => {
          // console.log(`Results Len : ${contactSheetResults.length}`);
          // console.log(JSON.stringify(contactSheetResults));
          // return getExpDesign(contactSheetResults);
          return getExpDesignsByTreatment(results);
        })
        .catch((error) => {
          return new Error(error);
        })
    }, {concurrency: 1})
      .then(() => {
        // console.log(JSON.stringify(paginationResults.count));
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

function getExpDesignsByTreatment(expDesignRows) {

  return new Promise((resolve, reject) => {
    expDesignRows = uniqBy(expDesignRows, 'treatmentGroupId');
    Promise.map(expDesignRows, (expDesign: ExpDesignResultSet) => {
      return app.models.ExpDesign
        .find({where: {treatmentGroupId: expDesign.treatmentGroupId}})
        .then((results) => {
          return parseExpDesigns(results);
        })
        .then(() => {
          return;
        })
        .catch((error) => {
          reject(new Error(error));
        });
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });

}

function parseExpDesigns(expDesignRows: ExpDesignResultSet[]) {
  return new Promise((resolve, reject) => {

    expDesignRows = uniqBy(expDesignRows, 'controlGroupId');
    let groups = groupBy(expDesignRows, 'treatmentGroupId');
    let expDesignSets = [];
    Object.keys(groups).map((group) => {
      let t = [];
      groups[group].map((expDesignRow: ExpDesignResultSet) => {
        t.push(expDesignRow);
      });
      expDesignSets.push(t);
    });

    let messedUpExpSets = [];
    expDesignSets.map((expSet) => {
      if (expSet.length > 3) {
        messedUpExpSets.push(expSet);
      }
    });

    console.log(`Got ${messedUpExpSets.length} sets`);
    if (messedUpExpSets.length > 1) {
      console.log(JSON.stringify(messedUpExpSets[0]));
    }
    Promise.map(messedUpExpSets, (expSet) => {
      return cleanUpExpSets(expSet)
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      });

  });
}

function cleanUpExpSets(expSet) {

  return new Promise((resolve, reject) => {

    let ctrlNullExpGroupIds = [];
    let ctrlStrainExpGroupIds = [];
    let ctrlRnaiExpGroupIds = [];
    expSet.map((expDesignRow: ExpDesignResultSet) => {
      if (isEqual(expDesignRow.controlGroupReagentType, 'ctrl_null')) {
        ctrlNullExpGroupIds.push(expDesignRow.controlGroupId);
      } else if (isEqual(expDesignRow.controlGroupReagentType, 'ctrl_strain')) {
        ctrlStrainExpGroupIds.push(expDesignRow.controlGroupId);
      } else if (isEqual(expDesignRow.controlGroupReagentType, 'ctrl_rnai') || isEqual(expDesignRow.controlGroupReagentType, 'ctrl_chemical')) {
        ctrlRnaiExpGroupIds.push(expDesignRow.controlGroupId);
      }
    });

    [ctrlNullExpGroupIds, ctrlRnaiExpGroupIds, ctrlStrainExpGroupIds].map((ctrlIds) => {
      if (ctrlIds.length < 2) {
        console.log(`Truncating ctrlids ${JSON.stringify(ctrlIds)}`);
        ctrlIds = [];
      }
    });

    Promise.map([ctrlNullExpGroupIds, ctrlRnaiExpGroupIds, ctrlStrainExpGroupIds], (ctrlIds) => {
      return updateExpAssays('ExpAssay', ctrlIds)
        .then(() => {
          return updateExpAssays('ExpAssay2reagent', ctrlIds);
        })
        .then(() => {
          return deleteExpDesigns(ctrlIds);
        })
        .then(() => {
          return deleteExpGroups(ctrlIds);
        })
        .catch((error) => {
          return new Error(error);
        });
    })
      .then(() => {
        resolve()
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function deleteExpGroups(expGroupIds: Array<number>) {
  return new Promise((resolve, reject) => {
    if (!isEmpty(expGroupIds)) {
      let masterId = expGroupIds.shift();
      Promise.map(expGroupIds, (expGroupId) => {
        console.log(`Should be deleting ${expGroupId}`);
        return app.models.ExpGroups
          .destroyAll({expGroupId: expGroupId})
      })
        .then((results) => {
          expGroupIds.unshift(masterId);
          resolve();
        })
        .catch((error) => {
          reject(new Error(error));
        })
    } else {
      resolve();
    }
  });
}

function deleteExpDesigns(expGroupIds: Array<number>) {
  return new Promise((resolve, reject) => {
    if (isEmpty(expGroupIds)) {
      resolve();
    } else {
      let masterId = expGroupIds.shift();
      Promise.map(expGroupIds, (expGroupId) => {
        console.log(`Should be deleting ${expGroupId}`);
        return app.models.ExpDesign
          .destroyAll({controlGroupId: expGroupId})
      })
        .then((results) => {
          expGroupIds.unshift(masterId);
          resolve();
        })
        .catch((error) => {
          reject(new Error(error));
        })
    }
  });
}

function updateExpAssays(model, expGroupIds: Array<number>) {
  return new Promise((resolve, reject) => {
    if (isEmpty(expGroupIds)) {
      resolve();
    } else {
      let masterId = expGroupIds.shift();
      Promise.map(expGroupIds, (expGroupId) => {
        // console.log(`Should be updating ${expGroupId} with ${masterId}`);
        return app.models[model]
          .find({where: {expGroupId: expGroupId}})
          .then((results) => {
            Promise.map(results, (row) => {
              console.log(`Old Row: ${JSON.stringify(row)}`);
              //@ts-ignore
              row.expGroupId = masterId;
              app.models[model]
                .upsert(row)
                .then((results) => {
                  console.log(`New Row: ${JSON.stringify(results)}`);
                  console.log('Done');
                  return;
                })
                .catch((error) => {
                  return new Error(error);
                });
            })
              .then(() =>{
                return;
              })
              .catch((error) =>{
                return new Error(error);
              });
          })
          .then(() => {
            return;
          })
          .catch((error) => {
            return new Error(error);
          });
      })
        .then((results) => {
          expGroupIds.unshift(masterId);
          resolve();
        })
        .catch((error) => {
          reject(new Error(error));
        })
    }
  });
}

function countExpDesigns() {
  return new Promise((resolve, reject) => {
    app.models.ExpGroup
      .count()
      .then((count) => {
        let limit = 10000;
        let numPages = Math.round(count / limit);
        let pages = range(0, numPages + 2);
        // pages = shuffle(pages);
        console.log(`count is ${count}`);
        // pagination(1, count, 50);
        // console.log(`Pages: ${Math.round(count / 50)}`);
        // console.log(JSON.stringify(pages));
        resolve({count: count, pages: pages, limit: limit});
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      })
  })
}
