import {Component, OnInit} from '@angular/core';
import {ExpBiosampleApi, ExpScreenApi, ExpScreenUploadWorkflowApi, ExpSetApi} from '../../../types/sdk/services/custom';
import {NgxSpinnerService} from "ngx-spinner";
import {SearchFormParamsFilterByNotScoredContactSheet} from "../../search/search.module";

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

    constructor(expSetApi: ExpSetApi, expScreenApi: ExpScreenApi,
                expBiosampleApi: ExpBiosampleApi, expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                spinner: NgxSpinnerService,) {
        this.searchFormParams = new SearchFormParamsFilterByNotScoredContactSheet(expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner,)
    }

    ngOnInit() {
    }

    getNewExpSets() {
        //Ensure expWorkflowIds are up to date
        this.searchFormParams.searchModule.getExpWorkflows();
        this.searchFormParams.expSets = null;
        this.searchFormParams.formSubmitted = false;
        this.searchFormParams.onSubmit();
        console.log('get some new exp sets');
    }

}

