import {Component, OnInit} from '@angular/core';

import {isEmpty, cloneDeep, get, isEqual, range} from 'lodash';
import {SearchFormExpScreenFormResults} from "../search-form-exp-screen/search-form-exp-screen.component";
import {SearchFormRnaiFormResults} from "../search-form-rnai/search-form-rnai.component";
import {ExpSetApi} from "../../../types/sdk/services/custom";
import {ExpsetModule} from "../../scoring/expset/expset.module";
import {NgxSpinnerService} from "ngx-spinner";
import {ExpSetSearchResults, ExpSetSearch} from "../../../types/custom/ExpSetTypes";

/**
 * TODO All these search forms need to be factored to a module
 */

@Component({
    selector: 'app-search-form-exp-workflow-qc',
    templateUrl: './search-form-exp-workflow-qc.component.html',
    styleUrls: ['./search-form-exp-workflow-qc.component.css']
})
export class SearchFormExpWorkflowQcComponent implements OnInit {
    searchFormExpScreenResults: SearchFormExpScreenFormResults = new SearchFormExpScreenFormResults();
    searchFormRnaiFormResults: SearchFormRnaiFormResults = new SearchFormRnaiFormResults();
    expSetSearch: ExpSetSearch = new ExpSetSearch();

    public expSets: ExpSetSearchResults = null;
    public expSetsModule: ExpsetModule;
    public formSubmitted: boolean = false;

    public expSetView = true;

    constructor(private expSetApi: ExpSetApi, private spinner: NgxSpinnerService) {
        this.expSetSearch.currentPage = 1;
    }

    ngOnInit() {
    }

    getNewExpSets() {
        this.onSubmit();
    }

    onSubmit() {
        this.formSubmitted = false;
        this.expSets = null;
        this.expSetSearch.pageSize = 1;
        this.expSetSearch.ctrlLimit = 4;
        if (this.searchFormExpScreenResults.expScreen) {
            this.expSetSearch.screenSearch = [this.searchFormExpScreenResults.expScreen.screenId];
        }

        if (this.searchFormExpScreenResults.expScreenWorkflow) {
            this.expSetSearch.expWorkflowSearch = [this.searchFormExpScreenResults.expScreenWorkflow.id];
        }

        //We don't need any of this stuff for QC
        this.expSetSearch.expSets = false;
        this.expSetSearch.albums = false;
        this.expSetSearch.modelPredictedCounts = false;

        this.spinner.show();
        this.expSetApi.getExpSetsByWorkflowId(this.expSetSearch)
            .subscribe((results) => {
                this.formSubmitted = true;
                this.spinner.hide();
                this.expSets = results.results;
            }, (error) =>{
                this.spinner.hide();
            })

    }

}
