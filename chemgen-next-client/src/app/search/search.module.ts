import {ReagentDataCriteria, ScreenMetaDataCriteria} from "../../types/custom/search";
import {ExpBiosampleApi, ExpScreenApi, ExpScreenUploadWorkflowApi, ExpSetApi} from "../../types/sdk/services/custom";
import {
    ExpBiosampleResultSet,
    ExpManualScoreCodeResultSet,
    ExpScreenResultSet,
    ExpScreenUploadWorkflowResultSet,
    LoopBackFilter
} from "../../types/sdk/models";
import {ExpSetSearch, ExpSetSearchResults} from "../../types/custom/ExpSetTypes";
import {shuffle, isObject, has, find, isEmpty, get, includes, isArray, orderBy, range, uniq} from 'lodash';
import {NgxSpinnerService} from "ngx-spinner";
import {ExpsetModule} from "../scoring/expset/expset.module";
import {SearchFormFilterByScoresAdvancedResults} from "../search-forms/filter-components/search-form-filter-by-scores-advanced/search-form-filter-by-scores-advanced.component";
import {ManualScoresModule} from "../scoring/manual-scores/manual-scores.module";

// import { SearchWormsComponent } from './search-worms/search-worms.component';

/**
 * This module is just a collection of search functions
 */

/**
 * This searches for the Exp MetaData (Screen Name, batches, worm strain, expSets, temperatures)
 */
export class SearchModule {
    expScreens: ExpScreenResultSet[];
    expScreenWorkflows: ExpScreenUploadWorkflowResultSet[];
    //The typeahead module is not working the way I expected it too
    //I am creating a tmp array, and querying/filtering from that
    typeAheadExpScreenWorkflows: ExpScreenUploadWorkflowResultSet[] = [];
    expBiosamples: ExpBiosampleResultSet[];
    //TODO Not sure what this is used for...
    expSets: ExpSetSearchResults;
    temperatures: Array<string | number>;

    constructor(public expSetApi: ExpSetApi, public expScreenApi: ExpScreenApi,
                public expBiosampleApi: ExpBiosampleApi, public expWorkflowApi: ExpScreenUploadWorkflowApi) {

        this.getExpWorkflows();
        this.getExpScreens({});
        this.getExpBiosamples({});
        this.getTemperatures();
    }

    /**
     * The functions are straight from the Loopback API
     * Generally they query ONE table for ONE thing
     * Examples: Worm strains, temperatures, screen names, plate IDs
     */
    /**
     * More complex search functionality is separated out into the classes below
     */

    getExpWorkflows() {
        this.expWorkflowApi
            .find({
                fields: {
                    id: true,
                    name: true,
                }
            })
            .subscribe((results: ExpScreenUploadWorkflowResultSet[]) => {
                this.expScreenWorkflows = results;
                this.typeAheadExpScreenWorkflows = results;
            }, (error) => {
                console.log(error);
            });
    }

    /**
     * Queries the exp_screen table in the database
     * where: {screenName: {like: 'mel-28'}}
     * @param where
     */
    getExpScreens(where: LoopBackFilter) {
        this.expScreenApi
            .find(where)
            .subscribe((results: ExpScreenResultSet[]) => {
                this.expScreens = results;
                return;
            }, (error) => {
                console.log(error);
                return new Error(error);
            });
    }

    /**
     * This gets a list of all possible temperatures
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

    /**
     * This gets a list of temperatures from a particular screen
     */
    getTemperaturesFromExpScreen(screenName) {
        if (screenName) {

            const where: any = {
                screenName: screenName,
            };
            this.expWorkflowApi
                .find({
                    where: where,
                    fields: {
                        id: true,
                        screenId: true,
                        temperature: true,
                        screenName: true,
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


    /**
     * Get all batches related to a screen
     * SELECT * from exp_screen where screen_id IN (1,2,3)
     * @param screenName
     */
    getExpScreenWorkflowsByExpScreen(screenName) {
        let where: any = {};
        if (screenName) {
            where = {
                and: [
                    {
                        screenName: screenName
                    },
                    {
                        id: {
                            inq: this.expScreenWorkflows.map((expWorkflow: ExpScreenUploadWorkflowResultSet) => {
                                return expWorkflow.id;
                            })
                        }
                    }
                ]
            };
        }

        this.expWorkflowApi
            .find({
                where: where,
                fields: {
                    id: true,
                    name: true,
                    screenName: true,
                    screenId: true,
                },
            })
            .subscribe((expScreenUploadWorkflowResultSets: ExpScreenUploadWorkflowResultSet[]) =>{
                this.typeAheadExpScreenWorkflows = expScreenUploadWorkflowResultSets;
            }, (error) =>{
                this.typeAheadExpScreenWorkflows = [];
            });

    }

    getExpBiosamples(where: LoopBackFilter) {
        this.expBiosampleApi
            .find(where)
            .subscribe((results: ExpBiosampleResultSet[]) => {
                this.expBiosamples = results;
            }, (error) => {
                console.log(error);
            });
    }
}

export class SearchModuleFilterByContactSheet extends SearchModule {

    constructor(public expSetApi: ExpSetApi, public expScreenApi: ExpScreenApi,
                public expBiosampleApi: ExpBiosampleApi, public expWorkflowApi: ExpScreenUploadWorkflowApi) {
        super(expSetApi, expScreenApi, expBiosampleApi, expWorkflowApi);
    }

    getExpScreens(where: LoopBackFilter) {
        this.expScreenApi
            .find(where)
            .subscribe((results: ExpScreenResultSet[]) => {
                this.expScreens = results;
                return;
            }, (error) => {
                console.log(error);
                return new Error(error);
            });
    }

    getExpWorkflows() {
        //First get all the workflowIDs that haven't been scored in the contact sheet
        //Then get the rest
        this.expSetApi
            .getExpWorkflowIdsNotScoredContactSheet()
            .subscribe((results) => {
                this.expWorkflowApi
                    .find({
                        where: {
                            id: {inq: results.results}
                        },
                        fields: {
                            id: true,
                            name: true,
                        }
                    })
                    .subscribe((results: ExpScreenUploadWorkflowResultSet[]) => {
                        this.expScreenWorkflows = results;
                        this.typeAheadExpScreenWorkflows = results;
                    }, (error) => {
                        this.expScreenWorkflows = [];
                        this.typeAheadExpScreenWorkflows = [];
                        console.log(error);
                    });
            }, (error) => {
                console.log(error);
            });
    }


}

export interface SearchInterface {
    search(): void;
}

/**
 * Search by the screen metadata - temperature, temperature range, wormstrain, etc
 * IN - Bunch of search criteria relating to the experiment
 * OUT - IDs of relevant batches
 */
export class ScreenMetaDataSearch implements SearchInterface {
    // INPUT
    screenMetaDataCriteria: ScreenMetaDataCriteria;
    // OUTPUT
    expScreenWorkflowIds ?: Array<any> = null;
    error: any;

    constructor(private expSetApi: ExpSetApi) {
        this.screenMetaDataCriteria = new ScreenMetaDataCriteria({});
    }

    search() {
        this.expScreenWorkflowIds = null;
        this.error = null;
        this.expSetApi
            .searchByExpWorkflowData(this.screenMetaDataCriteria)
            .subscribe((results: any) => {
                if (get(results, ['results', 'expWorkflowIds'])) {
                    this.expScreenWorkflowIds = results.results.expWorkflowIds;
                }
            }, (error) => {
                this.error = error;
            });
    }

    /**
     * if the user doesn't select any criteria (temperature, worm strain, etc),
     * this function returns false.
     * In that case just search for everything
     */
    checkScreenMetaCriteria(): Boolean {
        let thingsFound = false;
        Object.keys(this.screenMetaDataCriteria).map((key) => {
            if (get(this.screenMetaDataCriteria, key)) {
                thingsFound = true;
            }
        });
        return thingsFound;
    }
}

export class RNAiSearch implements SearchInterface {
    //INPUT
    public reagentSearch: ReagentDataCriteria;
    //OUTPUT
    public expGroupIds: Array<number> = [];
    public expGroups: Array<{ expGroupId, expWorkflowId }> = [];
    public results: Array<{ expGroupId, expWorkflowId, expGroups }> = [];
    public error: any;
    public geneNotFoundMessage: string;

    constructor(private expSetApi: ExpSetApi) {
        this.reagentSearch = new ReagentDataCriteria();
    }

    search() {
        this.geneNotFoundMessage = null;
        this.expGroupIds = [];
        this.expGroups = [];
        this.expSetApi
            .getExpSetsByRNAiReagentData(this.reagentSearch)
            .subscribe((results: any) => {
                if (get(results, ['results', 'expGroupIds'])) {
                    if (isArray(results.results.expGroupIds) && results.results.expGroups.length) {
                        this.expGroupIds = results.results.expGroupIds;
                    }
                }
                if (get(results, ['results', 'expGroups'])) {
                    if (isArray(results.results.expGroups) && results.results.expGroups.length) {
                        this.expGroups = results.results.expGroups;
                    }
                }
                if (this.reagentSearch.rnaiList.length && !this.expGroups.length) {
                    this.geneNotFoundMessage = `Corresponding genes not found for : ${this.reagentSearch.rnaiList.join(', ')}`;
                }

            }, (error) => {
                this.error = error;
            })
    }

}

export class Pagination {
    currentPage: number = 1;
    totalPages: number = 1;
    lowerRange: Array<number> = [];
    upperRange: Array<number> = [];
    useTotalRange: boolean = true;

    constructor(totalPages) {
        this.totalPages = totalPages;
        this.setPageRanges();
    }

    setPageRanges() {
        if (this.totalPages - this.currentPage >= 15) {
            this.lowerRange = range(0, 5);
            this.upperRange = range(this.totalPages - 5, this.totalPages);
            this.useTotalRange = false;
        }
    }
}

/**
 * There is a bunch of extra stuff in here
 * Because the typeahead field will only return a scalar value
 * So we store the user visible field (*Name), and get back the value
 * See the assign*ToName functions above for more details
 */
export class SearchFormExpScreenFormResults {
    formValid = true;
    expScreenFound = false;
    expWorkflowFound = false;
    biosampleFound = false;
    expScreenWorkflow ?: ExpScreenUploadWorkflowResultSet = null;
    expScreenWorkflowName ?: string;
    expScreen ?: ExpScreenResultSet;
    expScreenName ?: string = null;
    wormStrain ?: ExpBiosampleResultSet;
    wormStrainName ?: string = null;
    temperature ?: string | number = null;
    temperatureLower ?: number = null;
    temperatureUpper ?: number = null;
    screenStage ?: string = null;
    screenType ?: string = null;
    instrumentPlateId ?: string | number = null;
    instrumentPlateIds ?: Array<any> = null;
    instrumentPlateIdFound = false;
    searchMetaDataCriteria: ScreenMetaDataCriteria;
    // This is the final verdict
    // We go through ALL THE OTHER NONSENSE to get this list
    // I AM SETTING THIS IN TWO PLACES WHYYYYYYYYY
    expScreenWorkflows ?: ExpScreenUploadWorkflowResultSet[] = null;

    setSearchCriteria(): Boolean {
        this.searchMetaDataCriteria = new ScreenMetaDataCriteria();
        // If a batch name is given no need to do any additional searching from the criteria
        if (this.expScreenWorkflow) {
            this.expScreenWorkflows = [this.expScreenWorkflow];
            return false;
        } else {
            //If a batch name ISN'T given, this.search by the rest of the metadata
            if (get(this, 'wormStrain')) {
                this.searchMetaDataCriteria.wormStrainId = this.wormStrain.biosampleId;
            }
            if (get(this, 'expScreen')) {
                this.searchMetaDataCriteria.screenId = this.expScreen.screenId;
            }

            this.searchMetaDataCriteria.plateIds = this.instrumentPlateIds;
            this.searchMetaDataCriteria.screenStage = this.screenStage;
            this.searchMetaDataCriteria.screenType = this.screenType;
            if (this.temperatureLower && this.temperatureUpper) {
                // @ts-ignore
                this.searchMetaDataCriteria.temperatureRange = [this.temperatureLower, this.temperatureUpper];
            } else if (this.temperature) {
                // @ts-ignore
                this.searchMetaDataCriteria.temperature = this.temperature;
            }
            return true;
        }
    }
}

export class SearchFormRnaiFormResults {
    rnaisList: Array<string> = [];
}

export class SearchFormBaseComponentParams {
    public searchFormExpScreenResults: SearchFormExpScreenFormResults = new SearchFormExpScreenFormResults();
    public searchFormRnaiFormResults: SearchFormRnaiFormResults = new SearchFormRnaiFormResults();
    //These two are not ready yet, need to be refactored
    public searchFormFilterByScoresResults: SearchFormFilterByScoresResults = new SearchFormFilterByScoresResults();
    public searchFormFilterByScoresAdvancedResults: SearchFormFilterByScoresAdvancedResults = new SearchFormFilterByScoresAdvancedResults();

    //Search module is the base exp screen module
    public searchModule: SearchModule;
    public screenMetaDataSearch: ScreenMetaDataSearch;
    public rnaiSearch: RNAiSearch;

    // We go through all the other searches (screenMeta, rnai, chemical, etc) to get the expWorkflowIds and expGroupIds
    //The expGroupIds OR expWorkflowIds are what is fed to the expSetSearch
    public expWorkflowIds: String[] = [];
    public expGroupIds: Array<number> = [];
    public expGroups: Array<{ expGroupId, expWorkflowId }> = [];

    public formSubmitted = false;
    public message: string = null;
    public expSetView = true;

    // This is the search class (To be refactored) that returns the expSets data structure, that is fed to the UI
    public expSetSearch: ExpSetSearch = new ExpSetSearch();

    // expSets is the data structure that is returned by the loopback api, and populates the UI
    public expSets: ExpSetSearchResults = null;
    // This is a helper module for munging the expSets data structure
    public expSetsModule: ExpsetModule = null;

    public paginationData: Pagination;

    constructor(public expSetApi: ExpSetApi, public expScreenApi: ExpScreenApi,
                public expBiosampleApi: ExpBiosampleApi, public expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                public spinner: NgxSpinnerService,) {
        this.initializeSearches();
    }

    initializeSearches() {
        this.searchModule = new SearchModule(this.expSetApi, this.expScreenApi, this.expBiosampleApi, this.expScreenUploadWorkflowApi);
        this.screenMetaDataSearch = new ScreenMetaDataSearch(this.expSetApi);
        this.rnaiSearch = new RNAiSearch(this.expSetApi);
        this.expSetSearch = new ExpSetSearch();
    }

    //TODO Need to expand this for layering other types of expGroup searches
    //Score status, actual scores, etc
    searchRNAi() {
        if (isArray(this.rnaiSearch.expGroups) && isArray(this.expWorkflowIds)) {
            if (this.rnaiSearch.expGroups.length && this.expWorkflowIds.length) {
                let expGroups = this.rnaiSearch.expGroups.filter((expGroup) => {
                    return includes(this.expWorkflowIds, expGroup.expWorkflowId);
                });
                this.layerExpGroups(expGroups);
            }
        } else if (isArray(this.expGroupIds)) {
            this.layerExpGroups(this.rnaiSearch.expGroups);
        }
    }

    searchScreenMeta() {
        const searchExps = this.screenMetaDataSearch.checkScreenMetaCriteria();
        this.expGroups = [];
        this.expGroupIds = [];

        if (!searchExps) {
            //If the user doesn't select any criteria its just all available expWorkflowIds
            if (isArray(this.searchModule.expScreenWorkflows)) {
                this.expWorkflowIds = this.searchModule.expScreenWorkflows.map((expScreenWorkflow) => {
                    return expScreenWorkflow.id;
                });
            } else {
                //Sometimes if the user immediately presses submit some of the things act funny
                this.expWorkflowIds = [];
            }
        } else if (isArray(this.screenMetaDataSearch.expScreenWorkflowIds) && this.screenMetaDataSearch.expScreenWorkflowIds) {
            // If the user selected any criteria (temperature, worm, etc) it will be available here
            this.expWorkflowIds = this.screenMetaDataSearch.expScreenWorkflowIds;
        } else if (this.searchFormExpScreenResults.expScreenWorkflows && this.searchFormExpScreenResults.expScreenWorkflows.length) {
            // If the user explicitly selected a batch it it will be available here
            this.expWorkflowIds = this.searchFormExpScreenResults.expScreenWorkflows.map((expScreenWorkflow) => {
                return expScreenWorkflow.id;
            });
        } else {
            //Otherwise just get the ids selected
            this.expWorkflowIds = this.screenMetaDataSearch.expScreenWorkflowIds;
        }
        return;
    }

    layerExpGroups(expGroups) {
        expGroups.map((expGroup) => {
            this.expGroups.push(expGroup);
            this.expGroupIds.push(expGroup.expGroupId);
        });
        this.expGroupIds = uniq(this.expGroupIds);
        return;
    }

    // Layer the criteria
    setExpSetSearchCriteria() {
        if (this.expGroupIds.length) {
            //If the user searches for specific genes or chemicals
            //They get back a list of expGroups
            this.paginationData = new Pagination(1);
            this.expSetSearch.expGroupSearch = this.expGroupIds;
        } else if (get(this.searchFormExpScreenResults, ['expScreenWorkflow', 'id'])) {
            //The user explicitly set a batch to search for
            this.expSetSearch.expWorkflowSearch = [this.searchFormExpScreenResults.expScreenWorkflow.id];
        } else if (isArray(this.expWorkflowIds) && this.expWorkflowIds.length) {
            this.paginationData = new Pagination(this.expWorkflowIds.length);
            if (this.expWorkflowIds[this.paginationData.currentPage - 1]) {
                this.expSetSearch.expWorkflowSearch = [this.expWorkflowIds[this.paginationData.currentPage - 1]];
            } else {
                this.message = 'There are no more results with your search parameters.';
            }
        } else {
            this.message = 'Invalid search parameters';
        }
    }

    onReset() {
        this.searchFormExpScreenResults = new SearchFormExpScreenFormResults();
        this.searchFormRnaiFormResults = new SearchFormRnaiFormResults();
        this.initializeSearches();
        //TODO Add in filter by scores options

        this.expWorkflowIds = null;
        this.expSetSearch = new ExpSetSearch();

        this.expSets = null;
        this.expSetsModule = null;
        this.formSubmitted = false;
        this.expSetView = true;
        this.paginationData = new Pagination(1);
    }

    resetExpSetView() {
        this.expSets = null;
        this.expSetsModule = null;
        this.expSetSearch = new ExpSetSearch();
    }

    onSubmit() {
        this.expWorkflowIds = null;
        this.searchFormExpScreenResults.setSearchCriteria();
        this.searchScreenMeta();
        this.searchRNAi();
        this.findExpSets();
    }

    processExpSetsToExpModule(results: any) {
        this.expSets = results.results;
        this.expSetsModule = new ExpsetModule(this.expSets);
        this.expSetsModule.deNormalizeExpSets();
        this.spinner.hide();
    }

    /**
     * This is where we take all the search data, and finally search for expSets to return to the view
     * This is the function that is overriden in order to search by different criteria
     * ie - Search for things that have gone through the contact sheet, not gone through the contact sheet
     * ie - Things that are queued up for detailed scoring (they have that toggle checked as green)
     */
    findExpSets() {
        this.spinner.show();
        this.formSubmitted = true;

        this.resetExpSetView();
        this.setExpSetSearchCriteria();

        this.expSetApi.getExpSets(this.expSetSearch)
            .subscribe((results) => {
                this.processExpSetsToExpModule(results);
            }, (error) => {
                this.spinner.hide();
                this.message = error;
                console.log(error);
                return new Error(error);
            });
    }

}

export class SearchFormParamsFilterByNotScoredContactSheet extends SearchFormBaseComponentParams {
    public searchModule: SearchModuleFilterByContactSheet;

    constructor(public expSetApi: ExpSetApi, public expScreenApi: ExpScreenApi,
                public expBiosampleApi: ExpBiosampleApi, public expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                public spinner: NgxSpinnerService,) {
        super(expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner);
    }

    initializeSearches() {
        this.searchModule = new SearchModuleFilterByContactSheet(this.expSetApi, this.expScreenApi, this.expBiosampleApi, this.expScreenUploadWorkflowApi);
        this.screenMetaDataSearch = new ScreenMetaDataSearch(this.expSetApi);
        this.rnaiSearch = new RNAiSearch(this.expSetApi);
    }

    /**
     * This is where we take all the search data, and finally search for expSets to return to the view
     */
    findExpSets() {
        this.spinner.show();
        this.formSubmitted = true;

        this.resetExpSetView();
        this.setExpSetSearchCriteria();

        this.expSetApi
            .getUnScoredExpSetsByPlate(this.expSetSearch)
            .subscribe((results) => {
                this.processExpSetsToExpModule(results);
            }, (error) => {
                console.log(error);
                this.spinner.hide();
                this.message = error;
                return new Error(error);
            });
    }
}

export class SearchFormParamsFilterByPassedContactSheet extends SearchFormBaseComponentParams {
    //TODO Not sure if this should stay
    //This filters by all expWorkflows that have NOT been through the contact sheet
    //We actually want to be able to score anything that is queued up as interesting (any ExpSets with the green toggle)
    //With an option to score ANYTHING, green toggle or not
    // public searchModule: SearchModuleFilterByContactSheet;
    public searchModule: SearchModule;

    constructor(public expSetApi: ExpSetApi, public expScreenApi: ExpScreenApi,
                public expBiosampleApi: ExpBiosampleApi, public expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
                public spinner: NgxSpinnerService,) {
        super(expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner);
    }

    initializeSearches() {
        this.searchModule = new SearchModule(this.expSetApi, this.expScreenApi, this.expBiosampleApi, this.expScreenUploadWorkflowApi);
        this.screenMetaDataSearch = new ScreenMetaDataSearch(this.expSetApi);
        this.rnaiSearch = new RNAiSearch(this.expSetApi);
    }

    setExpSetSearchCriteria() {
        if (this.expGroupIds.length) {
            this.paginationData = new Pagination(1);
            this.expSetSearch.expGroupSearch = this.expGroupIds;
        } else if (get(this.searchFormExpScreenResults, ['expScreenWorkflow', 'id'])) {
            this.expSetSearch.expWorkflowSearch = [this.searchFormExpScreenResults.expScreenWorkflow.id];
        } else if (isArray(this.expWorkflowIds) && this.expWorkflowIds.length) {
            this.paginationData = new Pagination(this.expWorkflowIds.length);
        } else {
            this.message = 'Invalid search parameters';
        }
    }

    /**
     * This is where we take all the search data, and finally search for expSets to return to the view
     */
    findExpSets() {
        this.spinner.show();
        this.formSubmitted = true;

        this.resetExpSetView();
        this.setExpSetSearchCriteria();

        //TODO if we want to ONLY get things that were marked as interesting, do this
        //IF we want to get anything, mark as false
        this.expSetSearch.scoresExist = true;
        console.log(this.expSetSearch);
        this.expSetApi
            .getUnscoredExpSetsByFirstPass(this.expSetSearch)
            .subscribe((results) => {
                this.processExpSetsToExpModule(results);
            }, (error) => {
                console.log(error);
                this.spinner.hide();
                this.message = error;
                return new Error(error);
            });
    }
}

/**
 * WIP - Filter by Scores
 */
export class SearchFormFilterByScoresResults {
    manualScoresModule = new ManualScoresModule();
    scores: any;
    manualScores: ExpManualScoreCodeResultSet[];
    query: any = {};

    constructor() {
        this.scores = this.manualScoresModule.scores;
        this.manualScores = this.manualScoresModule.manualScores;
    }

    checkForOr() {
        if (!has(this.query, 'or')) {
            this.query.or = [];
        }
    }

    createManualScoreQuery() {
        this.query = {};
        Object.keys(this.scores).map((key) => {

            if (!has(this.scores, key)) {
                throw new Error(`Score key ${key} does not exist in manual scores table!!!`);
            }
            const value = find(this.manualScores, {formCode: key});
            if (!value) {
                throw new Error('Could not find score with code!');
            }

            if (get(this.scores, key)) {
                this.checkForOr();
                let manualValue = value.manualValue;
                let and = {and: []};
                and.and.push({manualscoreValue: manualValue});
                and.and.push({manualscoreGroup: value.manualGroup});
                this.query.or.push(and);
            }

        });
        if (isEmpty(this.query)) {
            this.query = null;
        }
    }

}

