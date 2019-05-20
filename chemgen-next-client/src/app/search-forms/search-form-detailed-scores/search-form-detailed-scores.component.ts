import {Component, OnInit} from '@angular/core';
import {SearchFormParamsFilterByHasDetailedScore} from "../../search/search.module";
import {ExpBiosampleApi, ExpScreenApi, ExpSetApi, ExpScreenUploadWorkflowApi} from "../../../types/sdk/services/custom";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
    selector: 'app-search-form-detailed-scores',
    templateUrl: './search-form-detailed-scores.component.html',
    styleUrls: ['./search-form-detailed-scores.component.css']
})
export class SearchFormDetailedScoresComponent implements OnInit {
    public searchFormParams: SearchFormParamsFilterByHasDetailedScore;

    constructor(expSetApi: ExpSetApi, expScreenApi: ExpScreenApi,
                expBiosampleApi: ExpBiosampleApi, expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                spinner: NgxSpinnerService) {
        //This is somehow undefined and i don't know why
        this.searchFormParams = new SearchFormParamsFilterByHasDetailedScore(expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner,)
        console.log(this.searchFormParams);
    }

    ngOnInit() {
    }

}
