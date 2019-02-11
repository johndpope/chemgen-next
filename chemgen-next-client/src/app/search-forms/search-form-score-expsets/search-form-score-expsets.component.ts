import {Component, OnInit} from '@angular/core';
import {
    SearchFormParamsFilterByNotScoredContactSheet, SearchFormParamsFilterByPassedContactSheet
} from "../../search/search.module";
import {ExpSetApi} from "../../../types/sdk/services/custom";
import {NgxSpinnerService} from "ngx-spinner";
import {ExpScreenApi, ExpBiosampleApi, ExpScreenUploadWorkflowApi} from "../../../types/sdk/services/custom";
import {SearchFormBaseComponentParams} from "../../search/search.module";

@Component({
    selector: 'app-search-form-score-expsets',
    templateUrl: './search-form-score-expsets.component.html',
    styleUrls: ['./search-form-score-expsets.component.css']
})
export class SearchFormScoreExpsetsComponent {

    public searchFormParams: SearchFormParamsFilterByPassedContactSheet;

    constructor(expSetApi: ExpSetApi, expScreenApi: ExpScreenApi,
                expBiosampleApi: ExpBiosampleApi, expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                spinner: NgxSpinnerService,) {
        this.searchFormParams = new SearchFormParamsFilterByPassedContactSheet(expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner);
    }

    getNewExpSets() {
        console.log('getting new expsets');
    }
}
