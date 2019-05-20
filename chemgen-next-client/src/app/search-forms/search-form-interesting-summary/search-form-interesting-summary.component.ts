import {Component, OnInit} from '@angular/core';
import {ExpBiosampleApi, ExpScreenApi, ExpScreenUploadWorkflowApi, ExpSetApi} from "../../../types/sdk/services/custom";
import {NgxSpinnerService} from "ngx-spinner";
import {
    SearchFormParamsFilterByPassedContactSheet,
} from "../../search/search.module";

@Component({
    selector: 'app-search-form-interesting-summary',
    templateUrl: './search-form-interesting-summary.component.html',
    styleUrls: ['./search-form-interesting-summary.component.css']
})
export class SearchFormInterestingSummaryComponent implements OnInit {

    public searchFormParams: SearchFormParamsFilterByPassedContactSheet;

    constructor(expSetApi: ExpSetApi, expScreenApi: ExpScreenApi,
                expBiosampleApi: ExpBiosampleApi, expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                spinner: NgxSpinnerService,) {
        this.searchFormParams = new SearchFormParamsFilterByPassedContactSheet(expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner,)
    }

    ngOnInit() {
    }

}
