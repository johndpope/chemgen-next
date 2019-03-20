import {Component, OnInit} from '@angular/core';
import {NgxSpinnerService} from "ngx-spinner";
import {SearchFormBaseComponentParams} from "../../search/search.module";
import {ExpScreenApi, ExpBiosampleApi, ExpScreenUploadWorkflowApi, ExpSetApi} from "../../../types/sdk/services/custom";

/**
 * TODO All these search forms need to be factored to a module
 */

@Component({
    selector: 'app-search-form-exp-workflow-qc',
    templateUrl: './search-form-exp-workflow-qc.component.html',
    styleUrls: ['./search-form-exp-workflow-qc.component.css']
})
export class SearchFormExpWorkflowQcComponent implements OnInit {
    public searchFormParams: SearchFormBaseComponentParams;

    constructor(expSetApi: ExpSetApi, expScreenApi: ExpScreenApi,
                expBiosampleApi: ExpBiosampleApi, expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                spinner: NgxSpinnerService,) {
        this.searchFormParams = new SearchFormBaseComponentParams(expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner,)
    }

    getNewExpSets() {
        //Ensure expWorkflowIds are up to date
        this.searchFormParams.searchModule.getExpWorkflows();
        this.searchFormParams.expSets = null;
        this.searchFormParams.formSubmitted = false;
        this.searchFormParams.onSubmit();
        console.log('get some new exp sets');
    }

    ngOnInit() {
    }
}
