import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {SearchFormViewOptionsResults} from '../../search-forms/search-form-view-options/search-form-view-options.component';
import {SearchFormExpScreenFormResults} from '../../search-forms/search-form-exp-screen/search-form-exp-screen.component';
import {SearchFormRnaiFormResults} from '../../search-forms/search-form-rnai/search-form-rnai.component';
import {isEmpty, isEqual} from 'lodash';
import {ExpSetApi} from '../../../types/sdk/services/custom';
import {NgxSpinnerService} from "ngx-spinner";
import {ExpSetSearch} from "../../../types/custom/ExpSetTypes";

/**
 * This form is very much the kitchen sink of all the forms
 * It has all the options, which is great for dev, but not much else
 */

@Component({
    // selector: 'app-search-form-worms',
    templateUrl: './search-form-worms.component.html',
    styleUrls: ['./search-form-worms.component.css'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchFormWormsComponent implements OnInit {

    searchFormViewOptionsResults: SearchFormViewOptionsResults = new SearchFormViewOptionsResults();
    searchFormExpScreenResults: SearchFormExpScreenFormResults = new SearchFormExpScreenFormResults();
    searchFormRnaiFormResults: SearchFormRnaiFormResults = new SearchFormRnaiFormResults();

    expSetSearch: ExpSetSearch = new ExpSetSearch();
    expSets: any = null;
    public formSubmitted = false;
    public showProgress = false;

    public contactSheetView = false;
    public contactSheetPlateView = false;
    public expSetView = false;

    constructor(private expSetApi: ExpSetApi) {
    }

    ngOnInit() {
    }

    getNewExpSets() {
        this.formSubmitted = false;
        this.showProgress = false;
        this.onSubmit();
    }

    onSubmit() {
        this.expSets = null;
        this.expSetSearch.pageSize = 50;
        this.expSetSearch.ctrlLimit = 20;
        this.expSetSearch = this.searchFormExpScreenResults.setExpSetSearchCriteria(this.expSetSearch);
        // use the getRnais endpoint instead
        if (!isEmpty(this.searchFormRnaiFormResults.rnaisList)) {
            this.expSetSearch.rnaiSearch = this.searchFormRnaiFormResults.rnaisList;
        }

        // Set the View
        if (isEqual(this.searchFormViewOptionsResults.viewOptions, 'expSetView')) {
            this.expSetSearch.scoresExist = null;
            this.expSetView = true;
            this.contactSheetView = false;
        } else if (isEqual(this.searchFormViewOptionsResults.viewOptions, 'contactSheetView')) {
            // this.expSetSearch.filterManualScores = true;
            this.expSetSearch.scoresExist= false;
            this.expSetView = false;
            this.contactSheetView = true;
        } else if (isEqual(this.searchFormViewOptionsResults.viewOptions, 'contactSheetPlateView')) {
            // this.expSetSearch.filterManualScores = true;
            this.expSetSearch.scoresExist= false;
            this.expSetView = false;
            this.contactSheetPlateView = true;
        }

        // Order
        // TODO if filtering based on an rnaiList / chemicalsList, this is done on the client side
        // if (isEqual(this.searchFormViewOptionsResults.rankOrder, 'plateId')) {
        //     this.expSetSearch.orderBy = 'plateId';
        // } else if (!isEqual(this.searchFormViewOptionsResults.rankOrder, 'none')) {
        //     const orders = this.searchFormViewOptionsResults.rankOrder.split('-');
        //     this.expSetSearch.orderBy = orders[0];
        //     this.expSetSearch.order = orders[1];
        // }

        this.formSubmitted = true;
        this.showProgress = true;
        if(this.expSetView){
            this.expSetApi.getUnScoredExpSetsByPlate(this.expSetSearch)
                .toPromise()
                .then((results) => {
                    console.log('got contactSheetResults');
                    this.expSets = results.results;
                    this.showProgress = false;
                })
                .catch((error) => {
                    console.log(error);
                    return new Error(error);
                });
        }
        else if (this.contactSheetPlateView) {
            this.expSetApi.getUnScoredExpSetsByPlate(this.expSetSearch)
                .toPromise()
                .then((results) => {
                    console.log('got contactSheetResults');
                    this.expSets = results.results;
                    this.showProgress = false;
                })
                .catch((error) => {
                    console.log(error);
                    return new Error(error);
                });

        } else if (isEqual(this.searchFormViewOptionsResults.rankOrder, 'none')) {
            this.expSetApi.getUnScoredExpSets(this.expSetSearch)
                .toPromise()
                .then((results) => {
                    console.log('got contactSheetResults');
                    this.expSets = results.results;
                    this.showProgress = false;
                })
                .catch((error) => {
                    console.log(error);
                    return new Error(error);
                });
        } else {
            this.expSetApi.getUnScoredExpSetsByCounts(this.expSetSearch)
                .toPromise()
                .then((results) => {
                    console.log('got contactSheetResults');
                    this.showProgress = false;
                    console.log(JSON.stringify(results.results));
                    this.expSets = results.results;
                })
                .catch((error) => {
                    console.log(error);
                    return new Error(error);
                });
        }
    }
}

