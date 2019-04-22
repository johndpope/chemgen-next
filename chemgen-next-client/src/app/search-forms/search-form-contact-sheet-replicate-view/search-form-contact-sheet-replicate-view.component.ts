import {Component, OnInit} from '@angular/core';
import {ExpSetApi} from '../../../types/sdk/services/custom';
import {NgxSpinnerService} from "ngx-spinner";
import {ExpScreenApi, ExpBiosampleApi, ExpScreenUploadWorkflowApi} from "../../../types/sdk/services/custom";
import {SearchFormParamsFilterByNotScoredContactSheet} from "../../search/search.module";
import {ExpSetSearch} from "../../../types/custom/ExpSetTypes";
import {get, includes, find} from 'lodash';
import {ExpScreenUploadWorkflowResultSet} from "../../../types/sdk/models";

@Component({
    selector: 'app-search-form-contact-sheet-replicate-view',
    templateUrl: './search-form-contact-sheet-replicate-view.component.html',
    styleUrls: ['./search-form-contact-sheet-replicate-view.component.css']
})
export class SearchFormContactSheetReplicateViewComponent implements OnInit {
    public searchFormParams: SearchFormParamsFilterByNotScoredContactSheet;
    public contactSheetsSubmitted: ExpScreenUploadWorkflowResultSet[] = [];

    constructor(expSetApi: ExpSetApi, expScreenApi: ExpScreenApi,
                expBiosampleApi: ExpBiosampleApi, expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                spinner: NgxSpinnerService,) {
        this.searchFormParams = new SearchFormParamsFilterByNotScoredContactSheet(expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner)
    }

    ngOnInit() {
    }


    /**
     * Check to see if the batch being searched for was already scored
     */
    wasBatchScored() {
        return find(this.contactSheetsSubmitted, (expWorkflow) => {
            return includes(this.searchFormParams.expSetSearch.expWorkflowSearch, expWorkflow.id);
        });
    }

    /**
     * Once the contact sheet is submitted get a new set
     */
    getNewExpSets() {
        //Once a batch is finished it will be removed from the list
        //This is only valid for the replicateSetContactSheet
        //The Plate view contact sheet can be scored several times for the same batch
        this.searchFormParams.searchModule.typeAheadExpScreenWorkflows.shift();
        //Keep track of the contactSheets that were already submitted
        if (get(this.searchFormParams, ['expSets', 'expWorkflows', 0])) {
            let expWorkflow = this.searchFormParams.expSets.expWorkflows[0];
            this.contactSheetsSubmitted.push(expWorkflow);
        }
        this.searchFormParams.expSetSearch = new ExpSetSearch();
        this.searchFormParams.expSets = null;
        this.searchFormParams.formSubmitted = false;
        this.searchFormParams.onSubmit();
    }

}
