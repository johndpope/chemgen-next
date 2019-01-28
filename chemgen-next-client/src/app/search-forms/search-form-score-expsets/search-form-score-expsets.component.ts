import {Component, OnInit} from '@angular/core';
import {isEmpty, cloneDeep, get, isEqual, range} from 'lodash';

import {SearchFormExpScreenFormResults} from "../search-form-exp-screen/search-form-exp-screen.component";
import {SearchFormRnaiFormResults} from "../search-form-rnai/search-form-rnai.component";
import {ExpSetApi} from "../../../types/sdk/services/custom";
import {ExpsetModule} from "../../scoring/expset/expset.module";
import {NgxSpinnerService} from "ngx-spinner";
import {ExpSetSearchResults, ExpSetSearch} from "../../../types/custom/ExpSetTypes";

@Component({
    selector: 'app-search-form-score-expsets',
    templateUrl: './search-form-score-expsets.component.html',
    styleUrls: ['./search-form-score-expsets.component.css']
})
export class SearchFormScoreExpsetsComponent implements OnInit {
    searchFormExpScreenResults: SearchFormExpScreenFormResults = new SearchFormExpScreenFormResults();
    searchFormRnaiFormResults: SearchFormRnaiFormResults = new SearchFormRnaiFormResults();
    expSetSearch: ExpSetSearch = new ExpSetSearch();

    public expSets: ExpSetSearchResults = null;
    public expSetModule: ExpsetModule;

    public formSubmitted = false;
    public expSetView = true;

    constructor(private expSetApi: ExpSetApi, private spinner: NgxSpinnerService) {
        this.expSetSearch.currentPage = 1;
    }

    ngOnInit() {
    }

    getNewExpSets() {
        this.formSubmitted = false;
        this.onSubmit();
    }

    onSubmit() {
        this.expSets = null;
        this.expSetModule = null;
        this.expSetSearch.pageSize = 10;
        this.expSetSearch.scoresExist = true;
        this.expSetSearch.ctrlLimit = 4;
        this.expSetSearch.skip = null;
        this.expSetSearch = this.searchFormExpScreenResults.setExpSetSearchCriteria(this.expSetSearch);
        //TODO Add back in the RNAi endpoint
        if (!isEmpty(this.searchFormRnaiFormResults.rnaisList)) {
            //TODO The pagination when looking for genes is WONKY
            //So just set teh pageSize to be ridiculously high so that we only return 1 page
            this.expSetSearch.pageSize = 10000;
            this.expSetSearch.rnaiSearch = this.searchFormRnaiFormResults.rnaisList;
            this.expSetSearch.skip = null;
        } else {
            this.expSetSearch.pageSize = 1;
        }

        this.formSubmitted = true;
        this.findExpSets();
    }

    findExpSets() {
        this.spinner.show();
        this.expSetApi.getUnscoredExpSetsByFirstPass(this.expSetSearch)
            .subscribe((results) => {
                this.expSets = results.results;
                this.expSetModule = new ExpsetModule(this.expSets);
                this.expSetModule.deNormalizeExpSets();
                this.spinner.hide();
            }, (error) => {
                console.log(error);
                this.spinner.hide();
                return new Error(error);
            });

    }
}
