import {Component, OnInit} from '@angular/core';
import {
    ExpBiosampleResultSet,
    ExpScreenResultSet,
    PlateResultSet,
    ReagentLibraryResultSet
} from '../../../../../types/sdk/models';
import {
    PlateApi,
    ExpScreenUploadWorkflowApi,
    ExpBiosampleApi,
    ReagentLibraryApi
} from '../../../../../types/sdk/services/custom';

import {ExpScreenApi} from '../../../../../types/sdk/services/custom';

import {RnaiScreenUploadWorkflowResultSet} from '../../../../../types/sdk/models';
import {JsonPipe} from '@angular/common';
import {orderBy, padStart, isNull, isEmpty, chunk} from 'lodash';

import {RnaiScreenDesign, SearchExpBiosamples, ExperimentData, RNAiExpUpload} from '../../helpers';

const libraryCode = 'AHR';
const site = 'AD';
const reagentType = 'RNAi';

@Component({
    selector: 'app-rnai-primary',
    templateUrl: './rnai-primary.component.html',
    styleUrls: ['./rnai-primary.component.css'],
    providers: [PlateApi, ExpBiosampleApi, ReagentLibraryApi]
})
export class RnaiPrimaryComponent implements OnInit {

    public expBiosampleModel: SearchExpBiosamples;
    public expDataModel: ExperimentData;
    public plateModels: Array<RnaiScreenDesign>;
    public expScreenUploads: Array<RnaiScreenUploadWorkflowResultSet>;
    public errorMessages: Array<any> = [];
    public success: Boolean = false;
    public expScreenUpload: RNAiExpUpload;
    public uploadedScreens: Array<string> = [];

    constructor(private plateApi: PlateApi,
                private expBiosampleApi: ExpBiosampleApi,
                private expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                private reagentLibraryApi: ReagentLibraryApi,
                private expScreenApi: ExpScreenApi) {
        this.expScreenUpload = new RNAiExpUpload();
    }

    ngOnInit() {
        this.initializeExpWorkflowFormUpload();
    }

    initializeExpWorkflowFormUpload() {
        this.uploadedScreens = [];
        this.plateModels = [new RnaiScreenDesign(this.plateApi)];
        this.expBiosampleModel = new SearchExpBiosamples(this.expBiosampleApi);
        this.expDataModel = new ExperimentData(this.reagentLibraryApi, this.expScreenApi, 'RNAi');
        this.expBiosampleModel.searchSamples();
        this.expScreenUploads = [];
        this.success = null;
        this.expScreenUpload = new RNAiExpUpload();
        this.errorMessages = [];
    }

    addNewScreenDesign() {
        const tPlate = new RnaiScreenDesign(this.plateApi);
        try {
            tPlate.creationDates = this.plateModels[this.plateModels.length - 1].creationDates;
            tPlate.chromosome = this.plateModels[this.plateModels.length - 1].chromosome;
            tPlate.libraryPlate = this.plateModels[this.plateModels.length - 1].libraryPlate;
            tPlate.conditionCode = this.plateModels[this.plateModels.length - 1].conditionCode;
        } catch (error) {
            console.error('there is no screen to push...');
        }
        if (this.plateModels.length > 0) {
            this.plateModels[this.plateModels.length - 1].collapse = true;
            console.log('Setting collapse');
        }
        this.plateModels.push(tPlate);
    }

    trackByFn(index: any, item: any) {
        return index;
    }

    removeScreenDesign(index: number) {
        if (index > -1) {
            this.plateModels.splice(index, 1);
        }
    }

    toggleCollapse(index: number) {
        if (this.plateModels[index].collapse) {
            this.plateModels[index].collapse = false;
        } else {
            this.plateModels[index].collapse = true;
        }
    }

    createWorkflowData() {
        this.plateModels.map((plateModel) => {
            const model = this.expScreenUpload.setDefaults(plateModel, this.expDataModel, this.expBiosampleModel);
            const year = this.expDataModel.assayDates[0].getFullYear();
            const month = padStart(String(this.expDataModel.assayDates[0].getMonth() + 1), 2, '0');
            const day = padStart(String(this.expDataModel.assayDates[0].getDate()), 2, '0');
            model.site = site;
            model.name = [`${site} ${reagentType} ${libraryCode} `,
                `${year}-${month}-${day} `,
                `${this.expBiosampleModel.expBiosample.biosampleName} `,
                `${this.expBiosampleModel.ctrlBiosample.biosampleName} `,
                `${this.expDataModel.temperature} `,
                `${plateModel.conditionCode} Chr ${plateModel.chromosome} ${plateModel.libraryPlate} ${plateModel.libraryQuadrant} `].join('');
            model.search = {
                'rnaiLibrary': {
                    'plate': plateModel.libraryPlate,
                    'quadrant': plateModel.libraryQuadrant,
                    'chrom': plateModel.chromosome,
                }
            };
            model.screenStage = 'primary';

            this.validateWorkflowData(model);
            this.expScreenUploads.push(model);
        });
        this.success = true;
        this.expScreenUploads.map((expScreenUpload) => {
            this.expScreenUploadWorkflowApi.doWork(expScreenUpload)
                .toPromise()
                .then((results) => {
                    console.log('submittted results');
                })
                .catch((error) => {
                    this.success = false;
                    this.errorMessages.push(error);
                });
        });
        this.uploadedScreens = this.expScreenUploads.map((expScreenUpload) => {
            return expScreenUpload.name;
        });
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

    validateWorkflowData(model: RnaiScreenUploadWorkflowResultSet) {
        this.errorMessages = this.expScreenUpload.validateWorkflowData(model, this.errorMessages);
    }
}

