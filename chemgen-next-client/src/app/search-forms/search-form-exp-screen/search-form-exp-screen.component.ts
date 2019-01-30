import {Component, OnInit, Output, Input} from '@angular/core';
import {ExpScreenApi, ExpBiosampleApi, ExpScreenUploadWorkflowApi, ExpSetApi} from '../../../types/sdk/services/custom';
import {ExpBiosampleResultSet, ExpScreenResultSet, ExpScreenUploadWorkflowResultSet} from '../../../types/sdk/models';
import {find, set, get, uniq, orderBy} from 'lodash';
import {ExpSetSearch} from "../../../types/custom/ExpSetTypes";

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
    expScreens: ExpScreenResultSet[];
    expScreenWorkflows: ExpScreenUploadWorkflowResultSet[];
    temperatures: Array<number>;
    expBiosamples: ExpBiosampleResultSet[];
    noResult = false;
    search: ExpSetSearch = new ExpSetSearch();

    constructor(private expScreenApi: ExpScreenApi,
                private expSetApi: ExpSetApi,
                private expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                private expBiosampleApi: ExpBiosampleApi) {
        this.expScreens = [];
        this.expScreenWorkflows = [];
        this.temperatures = [];
        this.getExpScreens();
        this.getExpBiosamples();
        this.getTemperatures();
        this.getExpScreenWorkflowNames();

    }

    ngOnInit() {
    }

    /**
     * Initial Form Setup  -
     * 1. Get the Temperatures
     * 2. Get Screens
     * 3. Get BioSamples / Worm Strains
     */

    getTemperatures() {
        this.expSetApi.getAllTemperatures()
            .subscribe((results) => {
                this.temperatures = results.results;
                this.temperatures = this.temperatures.sort();
            }, (error) => {
                console.log(error);
            })
    }

    getExpBiosamples() {
        this.expBiosampleApi
            .find()
            .subscribe((results: ExpBiosampleResultSet[]) => {
                this.expBiosamples = results;
            }, (error) => {
                console.log(error);
            });
    }

    getExpScreenWorkflowNames() {
        this.expScreenWorkflows = [];
        this.expScreenUploadWorkflowApi
            .find({
                fields: {
                    id: true,
                    name: true,
                },
            })
            .subscribe((results: ExpScreenUploadWorkflowResultSet[]) => {
                this.expScreenWorkflows = orderBy(results, 'name');
                return;
            });
    }


    getExpScreens() {
        this.expScreenApi
            .find(this.expScreenWhere)
            .subscribe((results: ExpScreenResultSet[]) => {
                this.expScreens = results;
                return;
            }, (error) => {
                console.log(error);
                return new Error(error);
            });
    }

    /**
     * Begin Typeahead checks
     * Ensure the typeahead is getting an actual value - it is possible to trick it
     * If it has an actual value go search the expWorkflows for it
     * If it doesn't then raise an error
     */
    assignNameToWormStrain() {
        this.formResults.wormStrain = null;
        let expBiosample: any = find(this.expBiosamples, {biosampleName: this.formResults.wormStrainName});
        if (expBiosample) {
            this.formResults.wormStrain = expBiosample;
            this.getExpWorkflows();
        }
        this.isFormValid();
    }

    assignNameToExpScreen() {
        set(this.formResults, 'expScreenFound', false);
        this.formResults.expScreen = null;
        let expScreen: any = find(this.expScreens, {screenName: this.formResults.expScreenName});
        if (expScreen) {
            this.formResults.expScreen = expScreen;
            this.getTemperaturesFromExpScreen();
            this.getExpScreenWorkflowsByExpScreen();
            this.getExpWorkflows();
        }
        this.isFormValid();
    }

    assignNameToExpWorkflow() {
        set(this.formResults, 'expWorkflowFound', false);
        this.formResults.expScreenWorkflow = null;
        let expWorkflow: any = find(this.expScreenWorkflows, {name: this.formResults.expScreenWorkflowName});
        if (expWorkflow) {
            this.formResults.expScreenWorkflow = expWorkflow;
            this.getExpWorkflows();
        }
        this.isFormValid();
    }

    //Search workflow by PlateID
    //TODO Add a check to ensure this plate ACTUALLY exists
    addPlateId() {
        if (this.formResults.instrumentPlateId) {
            this.formResults.instrumentPlateIds = [this.formResults.instrumentPlateId];
            this.search = new ExpSetSearch({});
            this.search.expWorkflowDeepSearch.instrumentPlateIds = this.formResults.instrumentPlateIds;

            this.expSetApi.searchByExpWorkflowData(this.search)
                .subscribe((ids: any) => {
                    if (get(ids, 'results') && ids.results.length) {
                        //Plate with ID exists
                        this.formResults.instrumentPlateIdFound = false;
                        this.getExpWorkflows();
                    } else {
                        //Plate with ID doesn't exist
                        this.formResults.instrumentPlateIdFound = true;
                    }
                }, (error) => {
                    console.log(error);
                });

        }
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
     * Filter based on the Exp Screen
     */

    /**
     * Filter temperatures based on Exp Screen
     */
    getTemperaturesFromExpScreen() {
        if (this.formResults.expScreen.screenName) {

            const where: any = {
                screenName: this.formResults.expScreen.screenName
            };
            this.expScreenUploadWorkflowApi
                .find({
                    where: where,
                    fields: {
                        id: true,
                        screenId: true,
                        temperature: true,
                        screenName: true,
                        assayDates: true,
                        name: true,
                    },
                })
                .subscribe((results: ExpScreenUploadWorkflowResultSet[]) => {
                    results.map((expWorkflow) => {
                        if (get(expWorkflow, "temperature.$numberDouble")) {
                            expWorkflow.temperature = Number(get(expWorkflow, "temperature.$numberDouble"));
                        }
                    });
                    this.expScreenWorkflows = orderBy(results, 'name');
                    this.temperatures = uniq(results.map((result) => {
                        return result.temperature;
                    }));
                    this.temperatures = this.temperatures.sort();
                    return;
                });
        }
    }


    getExpScreenWorkflowsByExpScreen() {
        this.expScreenWorkflows = [];
        this.formResults.expScreenWorkflow = null;

        const where: any = {
            screenName: this.formResults.expScreen.screenName
        };
        this.expScreenUploadWorkflowApi
            .find({
                where: where,
                fields: {
                    id: true,
                    name: true,
                },
            })
            .subscribe((results: ExpScreenUploadWorkflowResultSet[]) => {
                this.expScreenWorkflows = orderBy(results, 'name');
                return;
            });
    }

    /**
     * Once the form is filled out, get the corresponding expWorkflows
     */
    getExpWorkflows() {
        this.search = new ExpSetSearch({});
        this.formResults.expScreenWorkflows = null;
        if (this.formResults.expScreen) {
            this.search.screenSearch = [this.formResults.expScreen.screenId];
        }
        if (!this.formResults.expScreenWorkflow) {
            if (this.formResults.temperature) {
                this.search.expWorkflowDeepSearch.temperature = this.formResults.temperature;
            }
            if (this.formResults.temperatureLower && this.formResults.temperatureUpper) {
                this.search.expWorkflowDeepSearch.temperatureRange = [this.formResults.temperatureLower, this.formResults.temperatureUpper];
                this.search.expWorkflowDeepSearch.temperatureRange = this.search.expWorkflowDeepSearch.temperatureRange.sort();
            }
            if (this.formResults.wormStrain) {
                this.search.expWorkflowDeepSearch.wormStrains = [this.formResults.wormStrain.biosampleId];
            }

            if (this.formResults.screenType) {
                this.search.expWorkflowDeepSearch.screenType = this.formResults.screenType;
            }
            if (this.formResults.screenStage) {
                this.search.expWorkflowDeepSearch.screenStage = this.formResults.screenStage;
            }

            if (this.formResults.instrumentPlateIds) {
                this.search.expWorkflowDeepSearch.instrumentPlateIds = this.formResults.instrumentPlateIds;
            }
            this.expSetApi.searchByExpWorkflowData(this.search)
                .subscribe((ids: any) => {
                    if (get(ids, 'results') && ids.results.length) {
                        this.formResults.expScreenWorkflows = ids.results;
                    }
                }, (error) => {
                    console.log(error);
                })
        }

    }

}

export class SearchFormExpScreenFormResults {
    formValid = true;
    expScreenFound = false;
    expWorkflowFound = false;
    biosampleFound = false;
    expScreenWorkflow ?: ExpScreenUploadWorkflowResultSet = null;
    expScreenWorkflows ?: ExpScreenUploadWorkflowResultSet[] = null;
    expScreenWorkflowName ?: string;
    expScreen ?: ExpScreenResultSet;
    expScreenName ?: string = null;
    wormStrain ?: ExpBiosampleResultSet;
    wormStrainName ?: string = null;
    temperature ?: string | number = null;
    temperatureLower ?: string | number = null;
    temperatureUpper ?: string | number = null;
    screenStage ?: string = null;
    screenType ?: string = null;
    instrumentPlateId ?: string | number = null;
    instrumentPlateIds ?: Array<any> = null;
    instrumentPlateIdFound = false;

    setExpSetSearchCriteria(search: ExpSetSearch) {

        // search.expScreenWorkflows = null;
        if (this.expScreen) {
            search.screenSearch = [this.expScreen.screenId];
        }

        if (this.expScreenWorkflows) {
            search.expWorkflowSearch = this.expScreenWorkflows;
        } else if (this.expScreenWorkflow) {
            search.expWorkflowSearch = [this.expScreenWorkflow.id];
        }

        if (this.expScreen) {
            search.screenSearch = [this.expScreen.screenId];
        }
        if (!this.expScreenWorkflow && !this.expScreenWorkflows) {
            search.expWorkflowDeepSearch.screenStage = this.screenStage;
            search.expWorkflowDeepSearch.screenType = this.screenType;
            if (this.temperatureLower && this.temperatureUpper) {
                search.expWorkflowDeepSearch.temperatureRange = [this.temperatureLower, this.temperatureUpper];
            }
            if (this.instrumentPlateIds) {
                search.expWorkflowDeepSearch.instrumentPlateIds = this.instrumentPlateIds;
            }
            if (this.wormStrain) {
                search.expWorkflowDeepSearch.wormStrains = [this.wormStrain];
            }
        }
        return search;
    }
}
