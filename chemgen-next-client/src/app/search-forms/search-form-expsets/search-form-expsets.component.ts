import {Component, OnInit} from '@angular/core';
import {ExpBiosampleApi, ExpScreenApi, ExpScreenUploadWorkflowApi, ExpSetApi} from "../../../types/sdk/services/custom";
import {NgxSpinnerService} from "ngx-spinner";
import {
    SearchFormBaseComponentParams,
} from "../../search/search.module";

/**
 * This shows the replicates view
 */

@Component({
    selector: 'app-search-form-expsets',
    templateUrl: './search-form-expsets.component.html',
    styleUrls: ['./search-form-expsets.component.css']
})
export class SearchFormExpsetsComponent  implements OnInit {
    public searchFormParams: SearchFormBaseComponentParams;
    constructor( expSetApi: ExpSetApi,  expScreenApi: ExpScreenApi,
                 expBiosampleApi: ExpBiosampleApi,  expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                 spinner: NgxSpinnerService,) {
        this.searchFormParams = new SearchFormBaseComponentParams(expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner,)
    }

    ngOnInit() {
    }
}
