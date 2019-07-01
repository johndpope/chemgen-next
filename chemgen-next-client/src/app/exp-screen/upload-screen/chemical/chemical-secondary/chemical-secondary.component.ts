import {Component, OnInit} from '@angular/core';
import {SearchPlatePlans, ExperimentData, SearchExpBiosamples} from '../../helpers';
import {ChemicalExpUpload} from '../exp-screen-upload-screen-chemical-helpers/exp-screen-upload-screen-chemical-helpers.module';
import {ChemicalScreenDesign} from '../exp-screen-upload-screen-chemical-helpers/exp-screen-upload-screen-chemical-helpers.module';

import {PlatePlan96ResultSet, ExpScreenUploadWorkflowResultSet} from "../../../../../types/sdk/models";
import {
    ExpScreenApi,
    PlatePlan96Api,
    ExpBiosampleApi,
    ExpScreenUploadWorkflowApi,
    ReagentLibraryApi,
    PlateApi
} from "../../../../../types/sdk/services/custom";
import {isNull, isEmpty} from 'lodash';

@Component({
    // selector: 'app-chemical-secondary',
    templateUrl: './chemical-secondary.component.html',
    styleUrls: ['./chemical-secondary.component.css']
})
export class ChemicalSecondaryComponent implements OnInit {
    public expBiosampleModel: SearchExpBiosamples;
    public expDataModel: ExperimentData;
    public plateModels: Array<ChemicalScreenDesign>;
    public expScreenUploads: Array<ExpScreenUploadWorkflowResultSet>;
    public platePlansModel: SearchPlatePlans;
    public platePlan: PlatePlan96ResultSet;
    public errorMessages: Array<any> = [];
    public success: Boolean = false;
    public expScreenUpload: ChemicalExpUpload;
    public screenStage = 'secondary';

    constructor(private plateApi: PlateApi,
                private expBiosampleApi: ExpBiosampleApi,
                private expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                private reagentLibraryApi: ReagentLibraryApi,
                private platePlan96Api: PlatePlan96Api,
                private expScreenApi: ExpScreenApi) {
        this.expScreenUpload = new ChemicalExpUpload();

    }

    ngOnInit() {
        this.plateModels = [new ChemicalScreenDesign(this.plateApi)];
        this.expBiosampleModel = new SearchExpBiosamples(this.expBiosampleApi);
        this.expDataModel = new ExperimentData(this.reagentLibraryApi, this.expScreenApi, 'Chemical');
        this.platePlansModel = new SearchPlatePlans(this.platePlan96Api, 3);
        this.expBiosampleModel.searchSamples();
        this.expScreenUploads = [];
        this.plateModels[0].buildSearchNames();
    }

    addNewScreenDesign() {
        const tPlate = new ChemicalScreenDesign(this.plateApi);
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

    validateWorkflowData(model: ExpScreenUploadWorkflowResultSet) {
        this.errorMessages = this.expScreenUpload.validateWorkflowData(model, this.errorMessages);
        if (isNull(model.platePlanId)) {
            this.errorMessages.push('You must select a plate plan!');
        }
    }
}

