"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var manual_scores_module_1 = require("../../../scoring/manual-scores/manual-scores.module");
var lodash_1 = require("lodash");
var SearchFormFilterByScoresAdvancedComponent = /** @class */ (function () {
    function SearchFormFilterByScoresAdvancedComponent() {
        this.searchFormFilterByAdvancedResults = new SearchFormFilterByScoresAdvancedResults();
    }
    SearchFormFilterByScoresAdvancedComponent.prototype.ngOnInit = function () {
    };
    __decorate([
        core_1.Input('searchFormFilterByScoresAdvancedResults')
    ], SearchFormFilterByScoresAdvancedComponent.prototype, "searchFormFilterByAdvancedResults", void 0);
    SearchFormFilterByScoresAdvancedComponent = __decorate([
        core_1.Component({
            selector: 'app-search-form-filter-by-scores-advanced',
            templateUrl: './search-form-filter-by-scores-advanced.component.html',
            styleUrls: ['./search-form-filter-by-scores-advanced.component.css']
        })
    ], SearchFormFilterByScoresAdvancedComponent);
    return SearchFormFilterByScoresAdvancedComponent;
}());
exports.SearchFormFilterByScoresAdvancedComponent = SearchFormFilterByScoresAdvancedComponent;
var SearchFormFilterByScoresAdvancedGroups = /** @class */ (function () {
    function SearchFormFilterByScoresAdvancedGroups() {
        this.manualScoresModule = new manual_scores_module_1.ManualScoresModule();
        this.selectedHasValue = true;
        this.equalOptions = [
            { value: true, display: 'Equal' },
            { value: false, display: 'Not Equal' },
        ];
        this.scores = this.manualScoresModule.scores;
        this.manualScores = this.manualScoresModule.manualScores;
        this.manualScores = lodash_1.orderBy(this.manualScores, 'manualGroup');
    }
    return SearchFormFilterByScoresAdvancedGroups;
}());
exports.SearchFormFilterByScoresAdvancedGroups = SearchFormFilterByScoresAdvancedGroups;
var SearchFormFilterByScoresAdvancedResults = /** @class */ (function () {
    function SearchFormFilterByScoresAdvancedResults() {
        this.andGroups = [[new SearchFormFilterByScoresAdvancedGroups()]];
        this.query = {};
    }
    SearchFormFilterByScoresAdvancedResults.prototype.addAnyCond = function (indexAny, i) {
        this.andGroups[indexAny].push(new SearchFormFilterByScoresAdvancedGroups());
    };
    SearchFormFilterByScoresAdvancedResults.prototype.addAndCond = function () {
        this.andGroups.push([new SearchFormFilterByScoresAdvancedGroups()]);
    };
    SearchFormFilterByScoresAdvancedResults.prototype.removeAndGroup = function (indexAnd) {
        if (indexAnd > -1) {
            this.andGroups.splice(indexAnd, 1);
        }
    };
    SearchFormFilterByScoresAdvancedResults.prototype.removeAnyGroup = function (indexAnd, i) {
        if (indexAnd > -1) {
            this.andGroups[indexAnd].splice(i, 1);
        }
    };
    SearchFormFilterByScoresAdvancedResults.prototype.createQuery = function () {
        var _this = this;
        this.query = {};
        var hasSelection = false;
        var and = [];
        this.andGroups.map(function (anyGroup, indexAnd) {
            and.push({ or: [] });
            var hasAndSelection = false;
            anyGroup.map(function (group, indexAny) {
                if (group.customSelected) {
                    hasSelection = true;
                    hasAndSelection = true;
                    if (group.selectedHasValue) {
                        and[indexAnd].or.push({ and: [{ scoreCodeId: group.customSelected.manualscorecodeId }, { manualscoreValue: group.customSelected.manualValue }] });
                    }
                    else {
                        and[indexAnd].or.push({ and: [{ scoreCodeId: group.customSelected.manualscorecodeId }, { manualscoreValue: { neq: group.customSelected.manualValue } }] });
                    }
                }
                else {
                    _this.andGroups[indexAnd].splice(indexAny, 1);
                }
            });
            if (lodash_1.isEqual(and[and.length - 1].or.length, 0)) {
                and.pop();
            }
        });
        if (hasSelection) {
            this.query = { and: and };
        }
    };
    return SearchFormFilterByScoresAdvancedResults;
}());
exports.SearchFormFilterByScoresAdvancedResults = SearchFormFilterByScoresAdvancedResults;
//# sourceMappingURL=search-form-filter-by-scores-advanced.component.js.map