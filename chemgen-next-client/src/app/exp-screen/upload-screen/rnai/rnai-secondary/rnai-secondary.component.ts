import {Component, OnInit} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {ExpBiosampleResultSet, ExpScreenResultSet, PlateResultSet, ReagentLibraryResultSet, RnaiScreenUploadWorkflowResultSet, PlatePlan96ResultSet} from "../../../../../types/sdk/models";
import {PlateApi, ExpBiosampleApi, ExpScreenUploadWorkflowApi, ReagentLibraryApi, PlatePlan96Api, ExpScreenApi} from "../../../../../types/sdk/services/custom";
import {SearchPlatePlans, ScreenDesign, ExperimentData, SearchExpBiosamples, RNAiExpUpload, RnaiScreenDesign} from '../../helpers';
import {isNull, isEmpty} from 'lodash';

@Component({
  // selector: 'app-rnai-secondary',
  templateUrl: './rnai-secondary.component.html',
  styleUrls: ['./rnai-secondary.component.css']
})
export class RnaiSecondaryComponent implements OnInit {
  public expBiosampleModel: SearchExpBiosamples;
  public expDataModel: ExperimentData;
  public plateModels: Array<RnaiSecondaryScreenDesign>;
  public expScreenUploads: Array<RnaiScreenUploadWorkflowResultSet>;
  public platePlansModel: SearchPlatePlans;
  public platePlan: PlatePlan96ResultSet;
  public errorMessages: Array<any> = [];
  public success: Boolean = false;
  public expScreenUpload: RNAiExpUpload;

  constructor(private plateApi: PlateApi,
              private expBiosampleApi: ExpBiosampleApi,
              private expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
              private reagentLibraryApi: ReagentLibraryApi,
              private platePlan96Api: PlatePlan96Api,
              private expScreenApi: ExpScreenApi) {
    this.expScreenUpload = new RNAiExpUpload();

  }

  ngOnInit() {
    this.plateModels = [new RnaiSecondaryScreenDesign(this.plateApi)];
    this.expBiosampleModel = new SearchExpBiosamples(this.expBiosampleApi);
    this.expDataModel = new ExperimentData(this.reagentLibraryApi, this.expScreenApi, 'RNAi');
    this.platePlansModel = new SearchPlatePlans(this.platePlan96Api, 1);
    this.expBiosampleModel.searchSamples();
    this.expScreenUploads = [];
  }

  addNewScreenDesign() {
    const tPlate = new RnaiSecondaryScreenDesign(this.plateApi);
    try {
      tPlate.creationDates = this.plateModels[this.plateModels.length - 1].creationDates;
    } catch (error) {
      console.error('there is no screen to push...');
    }
    this.plateModels.push(tPlate);
  }

  removeScreenDesign(index: number) {
    if (index > -1) {
      this.plateModels.splice(index, 1);
    }
  }

  submitWorkflowData() {
    this.errorMessages = [];
    this.expScreenUploads = [];
    this.createWorkflowData();
    if (!isEmpty(this.errorMessages)) {
      // There are errors do not submit!!!
    } else {
      // Make the call!
      this.success = true;
    }
  }

  createWorkflowData() {
    this.plateModels.map((plateModel) => {
      // const model = new RnaiScreenUploadWorkflowResultSet();
      const model = this.expScreenUpload.setDefaults(plateModel, this.expDataModel, this.expBiosampleModel);

      model.screenStage = 'secondary';
      model.platePlan = {name: this.platePlan.platePlanName};
      model.platePlanId = String(this.platePlan.id);
      this.validateWorkflowData(model);
      this.expScreenUploads.push(model);
    });

    this.expScreenUploads.forEach((expScreenUpload) => {
      this.expScreenUploadWorkflowApi.doWork(expScreenUpload)
        .toPromise()
        .then((results) => {
          console.log('wheeee!');
          console.log(JSON.stringify(results));
        })
        .catch((error) => {
          this.errorMessages.push('There was an error submitting. Please report this error!');
          console.error(`I have an error ${error}`);
        });
    });
  }

  validateWorkflowData(model: RnaiScreenUploadWorkflowResultSet) {
    this.errorMessages = this.expScreenUpload.validateWorkflowData(model, this.errorMessages);
    if (isNull(model.platePlanId)) {
      this.errorMessages.push('You must select a plate plan!');
    }
  }

}

/**
 * WIP - There is waaaaaaaay too much redundancy between this and the RnaiScreenDesign in the primary plate
 */
class RnaiSecondaryScreenDesign extends RnaiScreenDesign {

  public buildSearchNames() {
    this.searchNamePatterns = [`RNAi%${this.conditionCode}%`];
  }
}


