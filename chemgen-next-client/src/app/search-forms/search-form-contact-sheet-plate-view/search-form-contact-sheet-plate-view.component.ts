import {Component, OnInit} from '@angular/core';
import {ExpBiosampleApi, ExpScreenApi, ExpScreenUploadWorkflowApi, ExpSetApi} from '../../../types/sdk/services/custom';
import {NgxSpinnerService} from "ngx-spinner";
import {SearchFormParamsFilterByNotScoredContactSheet} from "../../search/search.module";
import {ExpScreenUploadWorkflowResultSet} from "../../../types/sdk/models";
import {get} from 'lodash';

/**
 * This is the search form to get the screens by Plate
 */
@Component({
    selector: 'app-search-form-contact-sheet-plate-view',
    templateUrl: './search-form-contact-sheet-plate-view.component.html',
    styleUrls: ['./search-form-contact-sheet-plate-view.component.css']
})
export class SearchFormContactSheetPlateViewComponent implements OnInit {
    public searchFormParams: SearchFormParamsFilterByNotScoredContactSheet;
    public contactSheetsSubmitted: Array<string> = [];

    constructor(expSetApi: ExpSetApi, expScreenApi: ExpScreenApi,
                expBiosampleApi: ExpBiosampleApi, expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                spinner: NgxSpinnerService,) {
        this.searchFormParams = new SearchFormParamsFilterByNotScoredContactSheet(expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner)
    }

    ngOnInit() {
    }

    getNewExpSets() {
        if (get(this.searchFormParams, ['expSets', 'expWorkflows', 0])) {
            let expWorkflow = this.searchFormParams.expSets.expWorkflows[0];
            let barcode = this.searchFormParams.expSets.expGroupTypeAlbums.treatReagent[0].barcode;
            this.contactSheetsSubmitted.push(`${expWorkflow.name} Barcode: ${barcode}`);
        }
        this.searchFormParams.searchModule.getExpWorkflows();
        this.searchFormParams.expSets = null;
        this.searchFormParams.formSubmitted = false;
        this.searchFormParams.onSubmit();
    }

}

