"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var search_1 = require("../../types/custom/search");
var ExpSetTypes_1 = require("../../types/custom/ExpSetTypes");
var lodash_1 = require("lodash");
var expset_module_1 = require("../scoring/expset/expset.module");
var search_form_filter_by_scores_advanced_component_1 = require("../search-forms/filter-components/search-form-filter-by-scores-advanced/search-form-filter-by-scores-advanced.component");
var manual_scores_module_1 = require("../scoring/manual-scores/manual-scores.module");
// import { SearchWormsComponent } from './search-worms/search-worms.component';
/**
 * This module is just a collection of search functions
 */
/**
 * This searches for the Exp MetaData (Screen Name, batches, worm strain, expSets, temperatures)
 */
var SearchModule = /** @class */ (function () {
    function SearchModule(expSetApi, expScreenApi, expBiosampleApi, expWorkflowApi) {
        this.expSetApi = expSetApi;
        this.expScreenApi = expScreenApi;
        this.expBiosampleApi = expBiosampleApi;
        this.expWorkflowApi = expWorkflowApi;
        //The typeahead module is not working the way I expected it too
        //I am creating a tmp array, and querying/filtering from that
        this.typeAheadExpScreenWorkflows = [];
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
    SearchModule.prototype.getExpWorkflows = function () {
        var _this = this;
        this.expWorkflowApi
            .find({
            fields: {
                id: true,
                name: true,
            }
        })
            .subscribe(function (results) {
            _this.expScreenWorkflows = results;
            _this.typeAheadExpScreenWorkflows = results;
        }, function (error) {
            console.log(error);
        });
    };
    SearchModule.prototype.getExpScreens = function (where) {
        var _this = this;
        this.expScreenApi
            .find(where)
            .subscribe(function (results) {
            _this.expScreens = results;
            return;
        }, function (error) {
            console.log(error);
            return new Error(error);
        });
    };
    /**
     * This gets a list of all possible temperatures
     */
    SearchModule.prototype.getTemperatures = function () {
        var _this = this;
        this.expSetApi.getAllTemperatures()
            .subscribe(function (results) {
            _this.temperatures = results.results;
            _this.temperatures = _this.temperatures.sort();
        }, function (error) {
            console.log(error);
        });
    };
    /**
     * This gets a list of temperatures from a particular screen
     */
    SearchModule.prototype.getTemperaturesFromExpScreen = function (screenName) {
        var _this = this;
        if (screenName) {
            var where = {
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
                .subscribe(function (results) {
                results.map(function (expWorkflow) {
                    if (lodash_1.get(expWorkflow, "temperature.$numberDouble")) {
                        expWorkflow.temperature = Number(lodash_1.get(expWorkflow, "temperature.$numberDouble"));
                    }
                });
                _this.expScreenWorkflows = lodash_1.orderBy(results, 'name');
                _this.temperatures = lodash_1.uniq(results.map(function (result) {
                    return result.temperature;
                }));
                _this.temperatures = _this.temperatures.sort();
                return;
            });
        }
    };
    /**
     * Get all batches related to a screen
     * @param screenName
     */
    SearchModule.prototype.getExpScreenWorkflowsByExpScreen = function (screenName) {
        var _this = this;
        this.typeAheadExpScreenWorkflows = [];
        var where = {};
        if (screenName) {
            where = {
                and: [
                    {
                        screenName: screenName
                    },
                    {
                        id: {
                            inq: this.expScreenWorkflows.map(function (expWorkflow) {
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
            .subscribe(function (results) {
            _this.typeAheadExpScreenWorkflows = lodash_1.orderBy(results, 'name');
        });
    };
    SearchModule.prototype.getExpBiosamples = function (where) {
        var _this = this;
        this.expBiosampleApi
            .find(where)
            .subscribe(function (results) {
            _this.expBiosamples = results;
        }, function (error) {
            console.log(error);
        });
    };
    return SearchModule;
}());
exports.SearchModule = SearchModule;
var SearchModuleFilterByContactSheet = /** @class */ (function (_super) {
    __extends(SearchModuleFilterByContactSheet, _super);
    function SearchModuleFilterByContactSheet(expSetApi, expScreenApi, expBiosampleApi, expWorkflowApi) {
        var _this = _super.call(this, expSetApi, expScreenApi, expBiosampleApi, expWorkflowApi) || this;
        _this.expSetApi = expSetApi;
        _this.expScreenApi = expScreenApi;
        _this.expBiosampleApi = expBiosampleApi;
        _this.expWorkflowApi = expWorkflowApi;
        return _this;
    }
    SearchModuleFilterByContactSheet.prototype.getExpScreens = function (where) {
        var _this = this;
        this.expScreenApi
            .find(where)
            .subscribe(function (results) {
            _this.expScreens = results;
            return;
        }, function (error) {
            console.log(error);
            return new Error(error);
        });
    };
    SearchModuleFilterByContactSheet.prototype.getExpWorkflows = function () {
        var _this = this;
        //First get all the workflowIDs that haven't been scored in the contact sheet
        //Then get the rest
        this.expSetApi.getExpWorkflowIdsNotScoredContactSheet()
            .subscribe(function (results) {
            console.log(results);
            _this.expWorkflowApi
                .find({
                where: {
                    id: { inq: results.results }
                },
                fields: {
                    id: true,
                    name: true,
                }
            })
                .subscribe(function (results) {
                _this.expScreenWorkflows = results;
                _this.typeAheadExpScreenWorkflows = results;
            }, function (error) {
                console.log(error);
            });
        }, function (error) {
            console.log(error);
        });
    };
    return SearchModuleFilterByContactSheet;
}(SearchModule));
exports.SearchModuleFilterByContactSheet = SearchModuleFilterByContactSheet;
/**
 * Search by the screen metadata - temperature, temperature range, wormstrain, etc
 * IN - Bunch of search criteria relating to the experiment
 * OUT - IDs of relevant batches
 */
var ScreenMetaDataSearch = /** @class */ (function () {
    function ScreenMetaDataSearch(expSetApi) {
        this.expSetApi = expSetApi;
        // OUTPUT
        this.expScreenWorkflowIds = null;
        this.screenMetaDataCriteria = new search_1.ScreenMetaDataCriteria({});
    }
    ScreenMetaDataSearch.prototype.search = function () {
        var _this = this;
        this.expScreenWorkflowIds = null;
        this.error = null;
        this.expSetApi
            .searchByExpWorkflowData(this.screenMetaDataCriteria)
            .subscribe(function (results) {
            if (lodash_1.get(results, ['results', 'expWorkflowIds'])) {
                _this.expScreenWorkflowIds = results.results.expWorkflowIds;
                // this.expScreenWorkflowIds = shuffle(this.expScreenWorkflowIds);
            }
        }, function (error) {
            _this.error = error;
        });
    };
    /**
     * if the user doesn't select any criteria (temperature, worm strain, etc),
     * this function returns false.
     * In that case just search for everything
     */
    ScreenMetaDataSearch.prototype.checkScreenMetaCriteria = function () {
        var _this = this;
        var thingsFound = false;
        Object.keys(this.screenMetaDataCriteria).map(function (key) {
            if (lodash_1.get(_this.screenMetaDataCriteria, key)) {
                thingsFound = true;
            }
        });
        return thingsFound;
    };
    return ScreenMetaDataSearch;
}());
exports.ScreenMetaDataSearch = ScreenMetaDataSearch;
var RNAiSearch = /** @class */ (function () {
    function RNAiSearch(expSetApi) {
        this.expSetApi = expSetApi;
        //OUTPUT
        this.expGroupIds = [];
        this.expGroups = [];
        this.results = [];
        this.reagentSearch = new search_1.ReagentDataCriteria();
    }
    RNAiSearch.prototype.search = function () {
        var _this = this;
        this.geneNotFoundMessage = null;
        this.expGroupIds = [];
        this.expGroups = [];
        this.expSetApi.getExpSetsByRNAiReagentData(this.reagentSearch)
            .subscribe(function (results) {
            if (lodash_1.get(results, ['results', 'expGroupIds'])) {
                if (lodash_1.isArray(results.results.expGroupIds) && results.results.expGroups.length) {
                    _this.expGroupIds = results.results.expGroupIds;
                }
            }
            if (lodash_1.get(results, ['results', 'expGroups'])) {
                if (lodash_1.isArray(results.results.expGroups) && results.results.expGroups.length) {
                    _this.expGroups = results.results.expGroups;
                }
            }
            if (_this.reagentSearch.rnaiList.length && !_this.expGroups.length) {
                _this.geneNotFoundMessage = "Corresponding genes not found for : " + _this.reagentSearch.rnaiList.join(', ');
            }
        }, function (error) {
            _this.error = error;
        });
    };
    return RNAiSearch;
}());
exports.RNAiSearch = RNAiSearch;
var Pagination = /** @class */ (function () {
    function Pagination(totalPages) {
        this.currentPage = 1;
        this.totalPages = 1;
        this.lowerRange = [];
        this.upperRange = [];
        this.useTotalRange = true;
        this.totalPages = totalPages;
        this.setPageRanges();
    }
    Pagination.prototype.setPageRanges = function () {
        if (this.totalPages - this.currentPage >= 15) {
            this.lowerRange = lodash_1.range(0, 5);
            this.upperRange = lodash_1.range(this.totalPages - 5, this.totalPages);
            this.useTotalRange = false;
        }
    };
    return Pagination;
}());
exports.Pagination = Pagination;
/**
 * There is a bunch of extra stuff in here
 * Because the typeahead field will only return a scalar value
 * So we store the user visible field (*Name), and get back the value
 * See the assign*ToName functions above for more details
 */
var SearchFormExpScreenFormResults = /** @class */ (function () {
    function SearchFormExpScreenFormResults() {
        this.formValid = true;
        this.expScreenFound = false;
        this.expWorkflowFound = false;
        this.biosampleFound = false;
        this.expScreenWorkflow = null;
        this.expScreenName = null;
        this.wormStrainName = null;
        this.temperature = null;
        this.temperatureLower = null;
        this.temperatureUpper = null;
        this.screenStage = null;
        this.screenType = null;
        this.instrumentPlateId = null;
        this.instrumentPlateIds = null;
        this.instrumentPlateIdFound = false;
        // This is the final verdict
        // We go through ALL THE OTHER NONSENSE to get this list
        // I AM SETTING THIS IN TWO PLACES WHYYYYYYYYY
        this.expScreenWorkflows = null;
    }
    SearchFormExpScreenFormResults.prototype.setSearchCriteria = function () {
        this.searchMetaDataCriteria = new search_1.ScreenMetaDataCriteria();
        // If a batch name is given no need to do any additional searching from the criteria
        if (this.expScreenWorkflow) {
            this.expScreenWorkflows = [this.expScreenWorkflow];
            return false;
        }
        else {
            //If a batch name ISN'T given, this.search by the rest of the metadata
            if (lodash_1.get(this, 'wormStrain')) {
                this.searchMetaDataCriteria.wormStrainId = this.wormStrain.biosampleId;
            }
            if (lodash_1.get(this, 'expScreen')) {
                this.searchMetaDataCriteria.screenId = this.expScreen.screenId;
            }
            this.searchMetaDataCriteria.plateIds = this.instrumentPlateIds;
            this.searchMetaDataCriteria.screenStage = this.screenStage;
            this.searchMetaDataCriteria.screenType = this.screenType;
            if (this.temperatureLower && this.temperatureUpper) {
                // @ts-ignore
                this.searchMetaDataCriteria.temperatureRange = [this.temperatureLower, this.temperatureUpper];
            }
            else if (this.temperature) {
                // @ts-ignore
                this.searchMetaDataCriteria.temperature = this.temperature;
            }
            return true;
        }
    };
    return SearchFormExpScreenFormResults;
}());
exports.SearchFormExpScreenFormResults = SearchFormExpScreenFormResults;
var SearchFormRnaiFormResults = /** @class */ (function () {
    function SearchFormRnaiFormResults() {
        this.rnaisList = [];
    }
    return SearchFormRnaiFormResults;
}());
exports.SearchFormRnaiFormResults = SearchFormRnaiFormResults;
var SearchFormBaseComponentParams = /** @class */ (function () {
    function SearchFormBaseComponentParams(expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner) {
        this.expSetApi = expSetApi;
        this.expScreenApi = expScreenApi;
        this.expBiosampleApi = expBiosampleApi;
        this.expScreenUploadWorkflowApi = expScreenUploadWorkflowApi;
        this.spinner = spinner;
        this.searchFormExpScreenResults = new SearchFormExpScreenFormResults();
        this.searchFormRnaiFormResults = new SearchFormRnaiFormResults();
        //These two are not ready yet, need to be refactored
        this.searchFormFilterByScoresResults = new SearchFormFilterByScoresResults();
        this.searchFormFilterByScoresAdvancedResults = new search_form_filter_by_scores_advanced_component_1.SearchFormFilterByScoresAdvancedResults();
        // We go through all the other searches (screenMeta, rnai, chemical, etc) to get the expWorkflowIds and expGroupIds
        //The expGroupIds OR expWorkflowIds are what is fed to the expSetSearch
        this.expWorkflowIds = [];
        this.expGroupIds = [];
        this.expGroups = [];
        this.formSubmitted = false;
        this.message = null;
        this.expSetView = true;
        // This is the search class (To be refactored) that returns the expSets data structure, that is fed to the UI
        this.expSetSearch = new ExpSetTypes_1.ExpSetSearch();
        // expSets is the data structure that is returned by the loopback api, and populates the UI
        this.expSets = null;
        // This is a helper module for munging the expSets data structure
        this.expSetsModule = null;
        this.initializeSearches();
    }
    SearchFormBaseComponentParams.prototype.initializeSearches = function () {
        this.searchModule = new SearchModule(this.expSetApi, this.expScreenApi, this.expBiosampleApi, this.expScreenUploadWorkflowApi);
        this.screenMetaDataSearch = new ScreenMetaDataSearch(this.expSetApi);
        this.rnaiSearch = new RNAiSearch(this.expSetApi);
        this.expSetSearch = new ExpSetTypes_1.ExpSetSearch();
    };
    //TODO Need to expand this for layering other types of expGroup searches
    //Score status, actual scores, etc
    SearchFormBaseComponentParams.prototype.searchRNAi = function () {
        var _this = this;
        if (lodash_1.isArray(this.rnaiSearch.expGroups) && lodash_1.isArray(this.expWorkflowIds)) {
            if (this.rnaiSearch.expGroups.length && this.expWorkflowIds.length) {
                var expGroups = this.rnaiSearch.expGroups.filter(function (expGroup) {
                    return lodash_1.includes(_this.expWorkflowIds, expGroup.expWorkflowId);
                });
                this.layerExpGroups(expGroups);
            }
        }
        else if (lodash_1.isArray(this.expGroupIds)) {
            this.layerExpGroups(this.rnaiSearch.expGroups);
        }
    };
    SearchFormBaseComponentParams.prototype.searchScreenMeta = function () {
        var searchExps = this.screenMetaDataSearch.checkScreenMetaCriteria();
        this.expGroups = [];
        this.expGroupIds = [];
        if (!searchExps) {
            //If the user doesn't select any criteria its just all available expWorkflowIds
            this.expWorkflowIds = this.searchModule.expScreenWorkflows.map(function (expScreenWorkflow) {
                return expScreenWorkflow.id;
            });
        }
        else if (lodash_1.isArray(this.screenMetaDataSearch.expScreenWorkflowIds) && this.screenMetaDataSearch.expScreenWorkflowIds) {
            // If the user selected any criteria (temperature, worm, etc) it will be available here
            this.expWorkflowIds = this.screenMetaDataSearch.expScreenWorkflowIds;
        }
        else if (this.searchFormExpScreenResults.expScreenWorkflows && this.searchFormExpScreenResults.expScreenWorkflows.length) {
            // If the user explicitly selected a batch it it will be available here
            this.expWorkflowIds = this.searchFormExpScreenResults.expScreenWorkflows.map(function (expScreenWorkflow) {
                return expScreenWorkflow.id;
            });
        }
        else {
            //Otherwise just get the ids selected
            this.expWorkflowIds = this.screenMetaDataSearch.expScreenWorkflowIds;
        }
        return;
    };
    SearchFormBaseComponentParams.prototype.layerExpGroups = function (expGroups) {
        var _this = this;
        expGroups.map(function (expGroup) {
            _this.expGroups.push(expGroup);
            _this.expGroupIds.push(expGroup.expGroupId);
        });
        this.expGroupIds = lodash_1.uniq(this.expGroupIds);
        return;
    };
    // Layer the criteria
    SearchFormBaseComponentParams.prototype.setExpSetSearchCriteria = function () {
        if (this.expGroupIds.length) {
            //If the user searches for specific genes or chemicals
            //They get back a list of expGroups
            this.paginationData = new Pagination(1);
            this.expSetSearch.expGroupSearch = this.expGroupIds;
        }
        else if (lodash_1.get(this.searchFormExpScreenResults, ['expScreenWorkflow', 'id'])) {
            //The user explicitly set a batch to search for
            this.expSetSearch.expWorkflowSearch = [this.searchFormExpScreenResults.expScreenWorkflow.id];
        }
        else if (lodash_1.isArray(this.expWorkflowIds) && this.expWorkflowIds.length) {
            this.paginationData = new Pagination(this.expWorkflowIds.length);
            if (this.expWorkflowIds[this.paginationData.currentPage - 1]) {
                this.expSetSearch.expWorkflowSearch = [this.expWorkflowIds[this.paginationData.currentPage - 1]];
            }
            else {
                this.message = 'There are no more results with your search parameters.';
            }
        }
        else {
            this.message = 'Invalid search parameters';
        }
    };
    SearchFormBaseComponentParams.prototype.onReset = function () {
        this.searchFormExpScreenResults = new SearchFormExpScreenFormResults();
        this.searchFormRnaiFormResults = new SearchFormRnaiFormResults();
        this.initializeSearches();
        //TODO Add in filter by scores options
        this.expWorkflowIds = null;
        this.expSetSearch = new ExpSetTypes_1.ExpSetSearch();
        this.expSets = null;
        this.expSetsModule = null;
        this.formSubmitted = false;
        this.expSetView = true;
        this.paginationData = new Pagination(1);
    };
    SearchFormBaseComponentParams.prototype.resetExpSetView = function () {
        this.expSets = null;
        this.expSetsModule = null;
        this.expSetSearch = new ExpSetTypes_1.ExpSetSearch();
    };
    SearchFormBaseComponentParams.prototype.onSubmit = function () {
        this.expWorkflowIds = null;
        this.searchFormExpScreenResults.setSearchCriteria();
        this.searchScreenMeta();
        this.searchRNAi();
        this.findExpSets();
    };
    SearchFormBaseComponentParams.prototype.processExpSetsToExpModule = function (results) {
        this.expSets = results.results;
        this.expSetsModule = new expset_module_1.ExpsetModule(this.expSets);
        this.expSetsModule.deNormalizeExpSets();
        this.spinner.hide();
    };
    /**
     * This is where we take all the search data, and finally search for expSets to return to the view
     * This is the function that is overriden in order to search by different criteria
     * ie - Search for things that have gone through the contact sheet, not gone through the contact sheet
     * ie - Things that are queued up for detailed scoring (they have that toggle checked as green)
     */
    SearchFormBaseComponentParams.prototype.findExpSets = function () {
        var _this = this;
        this.spinner.show();
        this.formSubmitted = true;
        this.resetExpSetView();
        this.setExpSetSearchCriteria();
        this.expSetApi.getExpSets(this.expSetSearch)
            .subscribe(function (results) {
            _this.processExpSetsToExpModule(results);
        }, function (error) {
            _this.spinner.hide();
            _this.message = error;
            console.log(error);
            return new Error(error);
        });
    };
    return SearchFormBaseComponentParams;
}());
exports.SearchFormBaseComponentParams = SearchFormBaseComponentParams;
var SearchFormParamsFilterByNotScoredContactSheet = /** @class */ (function (_super) {
    __extends(SearchFormParamsFilterByNotScoredContactSheet, _super);
    function SearchFormParamsFilterByNotScoredContactSheet(expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner) {
        var _this = _super.call(this, expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner) || this;
        _this.expSetApi = expSetApi;
        _this.expScreenApi = expScreenApi;
        _this.expBiosampleApi = expBiosampleApi;
        _this.expScreenUploadWorkflowApi = expScreenUploadWorkflowApi;
        _this.spinner = spinner;
        return _this;
    }
    SearchFormParamsFilterByNotScoredContactSheet.prototype.initializeSearches = function () {
        this.searchModule = new SearchModuleFilterByContactSheet(this.expSetApi, this.expScreenApi, this.expBiosampleApi, this.expScreenUploadWorkflowApi);
        this.screenMetaDataSearch = new ScreenMetaDataSearch(this.expSetApi);
        this.rnaiSearch = new RNAiSearch(this.expSetApi);
    };
    /**
     * This is where we take all the search data, and finally search for expSets to return to the view
     */
    SearchFormParamsFilterByNotScoredContactSheet.prototype.findExpSets = function () {
        var _this = this;
        this.spinner.show();
        this.formSubmitted = true;
        this.resetExpSetView();
        this.setExpSetSearchCriteria();
        this.expSetApi.getUnScoredExpSetsByPlate(this.expSetSearch)
            .subscribe(function (results) {
            _this.processExpSetsToExpModule(results);
        }, function (error) {
            console.log(error);
            _this.spinner.hide();
            _this.message = error;
            return new Error(error);
        });
    };
    return SearchFormParamsFilterByNotScoredContactSheet;
}(SearchFormBaseComponentParams));
exports.SearchFormParamsFilterByNotScoredContactSheet = SearchFormParamsFilterByNotScoredContactSheet;
var SearchFormParamsFilterByPassedContactSheet = /** @class */ (function (_super) {
    __extends(SearchFormParamsFilterByPassedContactSheet, _super);
    function SearchFormParamsFilterByPassedContactSheet(expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner) {
        var _this = _super.call(this, expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner) || this;
        _this.expSetApi = expSetApi;
        _this.expScreenApi = expScreenApi;
        _this.expBiosampleApi = expBiosampleApi;
        _this.expScreenUploadWorkflowApi = expScreenUploadWorkflowApi;
        _this.spinner = spinner;
        return _this;
    }
    SearchFormParamsFilterByPassedContactSheet.prototype.initializeSearches = function () {
        this.searchModule = new SearchModule(this.expSetApi, this.expScreenApi, this.expBiosampleApi, this.expScreenUploadWorkflowApi);
        this.screenMetaDataSearch = new ScreenMetaDataSearch(this.expSetApi);
        this.rnaiSearch = new RNAiSearch(this.expSetApi);
    };
    SearchFormParamsFilterByPassedContactSheet.prototype.setExpSetSearchCriteria = function () {
        if (this.expGroupIds.length) {
            this.paginationData = new Pagination(1);
            this.expSetSearch.expGroupSearch = this.expGroupIds;
        }
        else if (lodash_1.get(this.searchFormExpScreenResults, ['expScreenWorkflow', 'id'])) {
            this.expSetSearch.expWorkflowSearch = [this.searchFormExpScreenResults.expScreenWorkflow.id];
        }
        else if (lodash_1.isArray(this.expWorkflowIds) && this.expWorkflowIds.length) {
            this.paginationData = new Pagination(this.expWorkflowIds.length);
        }
        else {
            this.message = 'Invalid search parameters';
        }
    };
    /**
     * This is where we take all the search data, and finally search for expSets to return to the view
     */
    SearchFormParamsFilterByPassedContactSheet.prototype.findExpSets = function () {
        var _this = this;
        this.spinner.show();
        this.formSubmitted = true;
        this.resetExpSetView();
        this.setExpSetSearchCriteria();
        //TODO if we want to ONLY get things that were marked as interesting, do this
        //IF we want to get anything, mark as false
        this.expSetSearch.scoresExist = true;
        console.log(this.expSetSearch);
        this.expSetApi.getUnscoredExpSetsByFirstPass(this.expSetSearch)
            .subscribe(function (results) {
            _this.processExpSetsToExpModule(results);
        }, function (error) {
            console.log(error);
            _this.spinner.hide();
            _this.message = error;
            return new Error(error);
        });
    };
    return SearchFormParamsFilterByPassedContactSheet;
}(SearchFormBaseComponentParams));
exports.SearchFormParamsFilterByPassedContactSheet = SearchFormParamsFilterByPassedContactSheet;
/**
 * WIP - Filter by Scores
 */
var SearchFormFilterByScoresResults = /** @class */ (function () {
    function SearchFormFilterByScoresResults() {
        this.manualScoresModule = new manual_scores_module_1.ManualScoresModule();
        this.query = {};
        this.scores = this.manualScoresModule.scores;
        this.manualScores = this.manualScoresModule.manualScores;
    }
    SearchFormFilterByScoresResults.prototype.checkForOr = function () {
        if (!lodash_1.has(this.query, 'or')) {
            this.query.or = [];
        }
    };
    SearchFormFilterByScoresResults.prototype.createManualScoreQuery = function () {
        var _this = this;
        this.query = {};
        Object.keys(this.scores).map(function (key) {
            if (!lodash_1.has(_this.scores, key)) {
                throw new Error("Score key " + key + " does not exist in manual scores table!!!");
            }
            var value = lodash_1.find(_this.manualScores, { formCode: key });
            if (!value) {
                throw new Error('Could not find score with code!');
            }
            if (lodash_1.get(_this.scores, key)) {
                _this.checkForOr();
                var manualValue = value.manualValue;
                var and = { and: [] };
                and.and.push({ manualscoreValue: manualValue });
                and.and.push({ manualscoreGroup: value.manualGroup });
                _this.query.or.push(and);
            }
        });
        if (lodash_1.isEmpty(this.query)) {
            this.query = null;
        }
    };
    return SearchFormFilterByScoresResults;
}());
exports.SearchFormFilterByScoresResults = SearchFormFilterByScoresResults;
//# sourceMappingURL=search.module.js.map