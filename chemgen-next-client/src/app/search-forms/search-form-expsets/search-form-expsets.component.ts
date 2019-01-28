import {Component, OnInit} from '@angular/core';

import {isEmpty, cloneDeep, get, isEqual, range} from 'lodash';

import {SearchFormExpScreenFormResults} from "../search-form-exp-screen/search-form-exp-screen.component";
import {SearchFormRnaiFormResults} from "../search-form-rnai/search-form-rnai.component";
import {ExpSetApi} from "../../../types/sdk/services/custom";
import {ExpsetModule} from "../../scoring/expset/expset.module";
import {NgxSpinnerService} from "ngx-spinner";
import {ExpSetSearchResults, ExpSetSearch} from "../../../types/custom/ExpSetTypes";
import {SearchFormFilterByScoresResults} from "../search-form-filter-by-scores/search-form-filter-by-scores.component";
import {SearchFormFilterByScoresAdvancedResults} from "../search-form-filter-by-scores-advanced/search-form-filter-by-scores-advanced.component";

@Component({
    templateUrl: './search-form-expsets.component.html',
    styleUrls: ['./search-form-expsets.component.css']
})
export class SearchFormExpsetsComponent implements OnInit {
    searchFormExpScreenResults: SearchFormExpScreenFormResults = new SearchFormExpScreenFormResults();
    searchFormRnaiFormResults: SearchFormRnaiFormResults = new SearchFormRnaiFormResults();
    searchFormFilterByScoresResults: SearchFormFilterByScoresResults = new SearchFormFilterByScoresResults();
    searchFormFilterByScoresAdvancedResults: SearchFormFilterByScoresAdvancedResults = new SearchFormFilterByScoresAdvancedResults();

    expSetSearch: ExpSetSearch = new ExpSetSearch();

    public expSets: ExpSetSearchResults = null;
    public expSetsModule: ExpsetModule = null;

    public formSubmitted = false;
    public expSetView = true;
    public lowerPageRange: Array<number> = [];
    public upperPageRange: Array<number> = [];
    public message: string = null;

    constructor(private expSetApi: ExpSetApi, private spinner: NgxSpinnerService) {
        this.expSetSearch.currentPage = 1;
    }

    ngOnInit() {
    }

    getNewExpSets() {
        this.formSubmitted = false;
        this.onSubmit();
    }

    onReset() {
        this.searchFormExpScreenResults = new SearchFormExpScreenFormResults();
        this.searchFormRnaiFormResults = new SearchFormRnaiFormResults();
        this.searchFormFilterByScoresResults = new SearchFormFilterByScoresResults();
        this.searchFormFilterByScoresAdvancedResults = new SearchFormFilterByScoresAdvancedResults();

        this.expSetSearch = new ExpSetSearch();

        this.expSets = null;
        this.expSetsModule = null;

        this.formSubmitted = false;
        this.expSetView = true;
        this.lowerPageRange = [];
        this.upperPageRange = [];
    }

    onSubmit() {
        this.expSets = null;
        this.expSetsModule = null;
        this.expSetSearch.pageSize = 1;
        this.expSetSearch.ctrlLimit = 4;
        this.expSetSearch.skip = null;
        this.searchFormFilterByScoresResults.createManualScoreQuery();
        this.searchFormFilterByScoresAdvancedResults.createQuery();

        if (!isEmpty(this.searchFormFilterByScoresAdvancedResults.query)) {
            //@ts-ignore
            this.expSetSearch.scoresQuery = this.searchFormFilterByScoresAdvancedResults.query;
        } else if (!isEmpty(this.searchFormFilterByScoresResults.query)) {
            //@ts-ignore
            this.expSetSearch.scoresQuery = this.searchFormFilterByScoresResults.query;
        }

        this.expSetSearch = this.searchFormExpScreenResults.setExpSetSearchCriteria(this.expSetSearch);

        //TODO Add back in the RNAi endpoint
        if (!isEmpty(this.searchFormRnaiFormResults.rnaisList)) {
            //TODO The pagination when looking for genes is WONKY
            //So just set the pageSize to be ridiculously high so that we only return 1 page
            this.expSetSearch.pageSize = 10000;
            this.expSetSearch.rnaiSearch = this.searchFormRnaiFormResults.rnaisList;
            this.expSetSearch.skip = null;
        } else {
            this.expSetSearch.pageSize = 1;
        }

        //@ts-ignore
        if (this.expSetSearch.rnaiSearch.length && this.expSetSearch.scoresQuery) {
            this.message = 'Only 1 of RNAi list and Scores filter will return expected results. Score Query will take precedence.';
        }
        this.formSubmitted = true;
        this.findExpSets();
    }

    getNewPage(pageNo: number) {
        this.expSets = null;
        this.expSetsModule = null;
        this.expSetSearch.currentPage = pageNo;
        this.formSubmitted = true;
        this.findExpSets();
    }

    findExpSets() {
        this.spinner.show();
        this.expSetApi.getExpSets(this.expSetSearch)
            .subscribe((results) => {
                this.expSets = results.results;

                this.upperPageRange = [];
                this.lowerPageRange = [];
                let pageLimit = this.expSets.currentPage + 4;
                if (pageLimit > this.expSets.totalPages) {
                    pageLimit = this.expSets.totalPages + 1;
                }
                this.lowerPageRange = range(this.expSets.currentPage + 1, pageLimit);
                if (this.expSets.totalPages > this.expSets.currentPage + 4) {
                    this.upperPageRange = range(this.expSets.totalPages - 5, this.expSets.totalPages);
                }

                this.expSetsModule = new ExpsetModule(this.expSets);
                this.expSetsModule.deNormalizeExpSets();
                this.spinner.hide();
            }, (error) => {
                console.log(error);
                this.spinner.hide();
                return new Error(error);
            });

    }
}
