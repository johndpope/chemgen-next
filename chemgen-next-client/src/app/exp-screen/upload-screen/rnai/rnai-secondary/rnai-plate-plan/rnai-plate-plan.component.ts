import {Component, OnInit} from '@angular/core';
import {get, padStart, isNull, isEmpty} from 'lodash';
import {SearchPlatePlans} from '../../../helpers';
import {LoopBackConfig} from "../../../../../../types/sdk";
import {RnaiLibraryApi, PlatePlan96Api, RnaiWormbaseXrefsApi} from "../../../../../../types/sdk";
import {PlatePlan96ResultSet, RnaiLibraryResultSet, RnaiWormbaseXrefsResultSet} from "../../../../../../types/sdk";

@Component({
  selector: 'app-rnai-plate-plan',
  templateUrl: './rnai-plate-plan.component.html',
  styleUrls: ['./rnai-plate-plan.component.css']
})
export class RnaiPlatePlanComponent implements OnInit {

  public rows: Array<string> = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  public columns: Array<any> = [];
  public wellData: any = {};
  public wells: Array<any> = [];
  public platePlanName: String;
  public validName: Boolean = true;
  public wellDataisValid = true;
  public message: string;
  public messageClass: string;
  public platePlansModel: SearchPlatePlans;
  public platePlan: PlatePlan96ResultSet;
  public editPlatePlan: Boolean = false;

  constructor(private rnaiLibraryApi: RnaiLibraryApi,
              private platePlan96Api: PlatePlan96Api,
              private rnaiWormBaserefsApi: RnaiWormbaseXrefsApi) {
    this.initializeWellData();
    this.platePlansModel = new SearchPlatePlans(this.platePlan96Api, 1);
  }

  ngOnInit() {
  }

  clearForm() {
    this.initializeWellData();
  }

  updatePlatePlan() {
    this.editPlatePlan = true;
    this.platePlanName = this.platePlan.platePlanName;
    this.wells.map((well) => {
      this.wellData[well] = new RnaiWellData();
      this.wellData[well].well = this.platePlan[well].well;
      this.wellData[well].lookUp = this.platePlan[well].lookUp;
      this.wellData[well].parentLibrary = this.platePlan[well].parentLibrary;
      if (!get(this.platePlan, [well, 'geneData'])) {
        console.log('there is no gene data!!');
        this.wellData[well].geneData = {};
        // this.findOtherGeneNames(well);
      } else {
        console.log('there is gene data...');
        this.wellData[well].geneData = this.platePlan[well].geneData;
      }
      this.wellData[well].taxTerm = this.platePlan[well].taxTerm;
      this.wellData[well].isValid = this.platePlan[well].isValid;
    });
  }

  submitPlatePlan() {
    if (this.wellDataisValid === true) {
      console.log('Submitting Plate Plan!');
      // Setting the library ID to 1 - which is the ID for the
      // Ahringer 2 library
      this.wellData.libraryId = 1;
      this.wellData.platePlanName = this.platePlanName;
      this.wellData.platePlanUploadDate = new Date();
      this.platePlan96Api.create(this.wellData)
        .toPromise()
        .then((results: PlatePlan96ResultSet) => {
          this.message = `Submitted successfully with ID ${results.id}`;
          this.messageClass = 'alert alert-success';
          console.log(JSON.stringify(results));
        })
        .catch((error) => {
          return new Error(error);
        });
    } else {
      console.log('Cannot submit!');
      this.message = `Cannot submit successfully. One or more wells are invalid!`;
      this.messageClass = 'alert alert-danger';
    }
  }

  initializeWellData() {
    this.wells = [];
    for (let i = 1; i <= 12; i++) {
      const column = padStart(String(i), 2, '0');
      this.columns.push(column);
    }
    this.rows.forEach((row) => {
      this.columns.forEach((column) => {
        const well = `${row}${column}`;
        this.wells.push(well);
        this.wellData[well] = new RnaiWellData();
        this.wellData[well].well = well;
      });
    });
  }

  // This is not working and I DONT KNOW WHY
  ensureUniqName() {
    this.platePlan96Api
      .findOne({where: {platePlanName: this.platePlanName}})
      .toPromise()
      .then((result: PlatePlan96ResultSet) => {
        if (isEmpty(result) || isNull(result)) {
          this.validName = true;
        } else {
          this.validName = false;
        }
      })
      .catch((error) => {
        return new Error(error);
      });
  }

  setWellDataLookup(row, column) {
    const well = `${row}${column}`;
    this.wellData[well].taxTerm = '';
    return new Promise((resolve, reject) => {
      if (!isEmpty(this.wellData[well].lookUp)) {
        const where = this.wellData[well].buildRnaiWhere(this.wellData[well].lookUp.split('-'));
        if (!isEmpty(where)) {
          this.findRnaiLibrary(where)
            .then((result: RnaiLibraryResultSet) => {
              console.log('Got contactSheetResults');
              console.log(JSON.stringify(result));
              if (!isEmpty(result)) {
                this.wellData[well].taxTerm = result.geneName;
                this.wellData[well].parentLibrary = result;
              } else {
                this.wellData[well].isValid = false;
              }
              return this.findOtherGeneNames(well);
            })
            .then(() => {
              resolve();
            })
            .catch((error) => {
              reject(new Error(error));
            });
        } else if (this.wellData[well].taxTerm.match('L4440')) {
          this.wellData[well].isValid = true;
        } else if (isEmpty(where) && isEmpty(this.wellData[well].taxTerm)) {
          this.wellData[well].isValid = false;
        }
      } else {
        this.wellData[well].isValid = true;
      }
    });
  }

  findOtherGeneNames(well) {
    console.log('Finding other gene names');
    return new Promise((resolve, reject) => {
      if (this.wellData[well].taxTerm) {
        this.rnaiWormBaserefsApi.findOne({
          where: {wbGeneSequenceId: this.wellData[well].taxTerm}
        })
          .toPromise()
          .then((results: RnaiWormbaseXrefsResultSet) => {
            this.wellData[well].geneData = results;
            resolve();
          })
          .catch((error) => {
            reject(new Error(error));
          });
      } else {
        resolve({});
      }
    });
  }

  findRnaiLibrary(where) {
    return new Promise((resolve, reject) => {
      this.rnaiLibraryApi
        .findOne({where: where})
        .toPromise()
        .then((result: RnaiLibraryResultSet) => {
          resolve(result);
        })
        .catch((error) => {
          reject(new Error(error));
        });
    });
  }

  checkWellDataValid() {
    // Check to make sure all the wells are also valid
    const valid = this.wells.filter((well) => {
      return !this.wellData[well].isValid;
    });
    this.wellDataisValid = isEmpty(valid);
  }

}

export class RnaiWellData {
  public well: string;
  public lookUp: string | number;
  public comment: string;
  public parentLibrary: RnaiLibraryResultSet;
  public geneData: RnaiWormbaseXrefsResultSet;
  public taxTerm: string | number;
  public isValid: boolean;

  constructor() {
    // The libraryID is only 1 for the Ahringer2 Library!!!
    this.geneData = new RnaiWormbaseXrefsResultSet();
    this.isValid = true;
  }

  buildRnaiWhere(lookUpList) {
    let where = {};
    const chrom = lookUpList[0];
    const plateNo = lookUpList[1];
    let well: string;

    // The well listed is from the parent library - not the stock
    if (lookUpList[0].match('L4440')) {
      this.taxTerm = 'L4440';
    } else if (lookUpList.length === 3) {
      well = lookUpList[2];
      const bioLoc = chrom + '-' + plateNo + well;
      where = {
        bioloc: bioLoc,
      };
      // The well is from the stock - it has a quadrant
    } else if (lookUpList.length === 4) {
      const quad = lookUpList[2];
      well = lookUpList[3];
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
  }
}
