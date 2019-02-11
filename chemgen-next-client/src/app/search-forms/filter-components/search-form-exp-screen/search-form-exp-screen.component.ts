import {Component, Input, OnInit} from '@angular/core';
import {
    ExpBiosampleApi,
    ExpScreenApi,
    ExpScreenUploadWorkflowApi,
    ExpSetApi
} from '../../../../types/sdk/services/custom';
import {find, get, set} from 'lodash';
import {ScreenMetaDataSearch, SearchFormExpScreenFormResults, SearchModule} from "../../../search/search.module";
import {ScreenMetaDataCriteria} from "../../../../types/custom/search";

/**
 * This form is there to filter Exp Screens and Batches to get specific results
 */

@Component({
    selector: 'app-search-form-exp-screen',
    templateUrl: './search-form-exp-screen.component.html',
    styleUrls: ['./search-form-exp-screen.component.css']
})
export class SearchFormExpScreenComponent implements OnInit {

    @Input('expScreenWhere') expScreenWhere: any = {};
    @Input('formResults') formResults: SearchFormExpScreenFormResults;
    //TODO Do I want these to be INPUT?
    @Input('searchModule') searchModule: SearchModule;
    @Input('screenMetaDataSearch') screenMetaDataSearch: ScreenMetaDataSearch;

    noResult = false;

    // search: ExpSetSearch = new ExpSetSearch();

    constructor(private expScreenApi: ExpScreenApi,
                private expSetApi: ExpSetApi,
                private expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                private expBiosampleApi: ExpBiosampleApi) {
        /**
         * Initial Form Setup  - Happens in the searchModule
         * 1. Get the Temperatures
         * 2. Get Screens
         * 3. Get BioSamples / Worm Strains
         */
    }

    ngOnInit() {
    }

    /**
     * Begin Typeahead checks
     * Ensure the typeahead is getting an actual value - it is possible to trick it
     * If it has an actual value go search the expWorkflows for it
     * If it doesn't then raise an error
     * Typeahead will only take a scalar value as its IN/OUT
     * We use the NAME since that is what the user wants to see
     * We have to assign it back to its actual value
     */
    assignNameToWormStrain() {
        this.formResults.wormStrain = null;
        let expBiosample: any = find(this.searchModule.expBiosamples, {biosampleName: this.formResults.wormStrainName});
        if (expBiosample) {
            this.formResults.wormStrain = expBiosample;
            this.searchExpWorkflows();
        }
        this.isFormValid();
    }

    assignNameToExpScreen() {
        set(this.formResults, 'expScreenFound', false);
        this.formResults.expScreen = null;
        let expScreen: any = find(this.searchModule.expScreens, {screenName: this.formResults.expScreenName});
        if (expScreen) {
            this.formResults.expScreen = expScreen;
            this.searchModule.getTemperaturesFromExpScreen(expScreen.screenName);
            this.searchModule.getExpScreenWorkflowsByExpScreen(expScreen.screenName);
            this.searchExpWorkflows();
        }
        this.isFormValid();
    }

    assignNameToExpWorkflow() {
        set(this.formResults, 'expWorkflowFound', false);
        this.formResults.expScreenWorkflow = null;
        let expWorkflow: any = find(this.searchModule.expScreenWorkflows, {name: this.formResults.expScreenWorkflowName});
        if (expWorkflow) {
            this.formResults.expScreenWorkflow = expWorkflow;
            this.searchExpWorkflows();
        }
        this.isFormValid();
    }

    typeaheadNoResults(field: string, event: boolean): void {
        this.noResult = event;
        set(this.formResults, field, event);
        this.isFormValid();
    }

    isFormValid() {
        this.formResults.formValid = true;
        ['expScreenFound', 'expWorkflowFound', 'biosampleFound'].map((key: string) => {
            if (get(this.formResults, key)) {
                this.formResults.formValid = false;
            }
        });
    }

    /**
     * End TypeAhead checks
     */

    /**
     * this is not right
     * we want someplace to aggregate all the batches
     */

    searchCriteriaChanged() {
        this.formResults.setSearchCriteria();
        // If the user sets the batchId then we don't need to go and look for it
        if (this.formResults.expScreenWorkflows && this.formResults.expScreenWorkflows.length) {
            this.screenMetaDataSearch.expScreenWorkflowIds = this.formResults.expScreenWorkflows;
        } else {
            this.screenMetaDataSearch.expScreenWorkflowIds = null;
        }
        this.screenMetaDataSearch.screenMetaDataCriteria = this.formResults.searchMetaDataCriteria;
    }

    searchExpWorkflows() {
        this.searchCriteriaChanged();
        this.screenMetaDataSearch.search();
    }

    //Search workflow by PlateID
    addPlateId() {
        this.searchCriteriaChanged();
        if (this.formResults.instrumentPlateId) {
            this.formResults.instrumentPlateIds = [this.formResults.instrumentPlateId];
            let search = new ScreenMetaDataCriteria({});
            search.plateIds = this.formResults.instrumentPlateIds;

            this.expSetApi.searchByExpWorkflowData(search)
                .subscribe((results: any) => {
                    if (get(results, ['results', 'expWorkflowIds'])) {
                        this.formResults.instrumentPlateIdFound = false;
                    } else {
                        this.formResults.instrumentPlateIdFound = true;
                    }
                }, (error) => {
                    console.log(error);
                });
        }
    }


    /**
     * Filter temperatures based on Exp Screen
     */
    getTemperaturesFromExpScreen() {
        console.log('getting temperatures!');
        this.searchModule.getTemperaturesFromExpScreen(this.formResults.expScreen.screenName);
    }

}

