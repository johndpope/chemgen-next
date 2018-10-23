import {Component, OnInit, Input} from '@angular/core';
import {ManualScoresModule} from "../../scoring/manual-scores/manual-scores.module";
import {isEqual, orderBy} from 'lodash';
import {ExpManualScoreCodeResultSet} from "../../../types/sdk/models";

@Component({
    selector: 'app-search-form-filter-by-scores-advanced',
    templateUrl: './search-form-filter-by-scores-advanced.component.html',
    styleUrls: ['./search-form-filter-by-scores-advanced.component.css']
})
export class SearchFormFilterByScoresAdvancedComponent implements OnInit {

    @Input('searchFormFilterByScoresAdvancedResults') searchFormFilterByAdvancedResults: any = new SearchFormFilterByScoresAdvancedResults();

    constructor() {
    }

    ngOnInit() {
    }

}

export class SearchFormFilterByScoresAdvancedGroups {
    manualScoresModule: ManualScoresModule = new ManualScoresModule();
    scores: any;
    manualScores;
    selectedHasValue: boolean = true;
    customSelected: ExpManualScoreCodeResultSet;
    equalOptions: any = [
        {value: true, display: 'Equal'},
        {value: false, display: 'Not Equal'},
    ];

    constructor() {
        this.scores = this.manualScoresModule.scores;
        this.manualScores = this.manualScoresModule.manualScores;
        this.manualScores = orderBy(this.manualScores, 'manualGroup');
    }
}

export class SearchFormFilterByScoresAdvancedResults {
    andGroups: Array<Array<SearchFormFilterByScoresAdvancedGroups>> = [[new SearchFormFilterByScoresAdvancedGroups()]];
    query: any = {};

    addAnyCond(indexAny: number, i: number) {
        this.andGroups[indexAny].push(new SearchFormFilterByScoresAdvancedGroups());
    }

    addAndCond() {
        this.andGroups.push([new SearchFormFilterByScoresAdvancedGroups()]);
    }

    removeAndGroup(indexAnd: number) {
        if (indexAnd > -1) {
            this.andGroups.splice(indexAnd, 1);
        }
    }

    removeAnyGroup(indexAnd: number, i: number) {
        if (indexAnd > -1) {
            this.andGroups[indexAnd].splice(i, 1);
        }
    }


    createQuery() {
        this.query = {};

        let hasSelection = false;
        let and = [];
        this.andGroups.map((anyGroup, indexAnd: number) => {
            and.push({or: []});
            let hasAndSelection = false;
            anyGroup.map((group: SearchFormFilterByScoresAdvancedGroups, indexAny: number) => {
                if (group.customSelected) {
                    hasSelection = true;
                    hasAndSelection = true;
                    if (group.selectedHasValue) {
                        and[indexAnd].or.push({and: [{scoreCodeId: group.customSelected.manualscorecodeId}, {manualscoreValue: group.customSelected.manualValue}]});
                    } else {
                        and[indexAnd].or.push({and: [{scoreCodeId: group.customSelected.manualscorecodeId}, {manualscoreValue: {neq: group.customSelected.manualValue}}]});
                    }
                } else {
                    this.andGroups[indexAnd].splice(indexAny, 1);
                }
            });
            if (isEqual(and[and.length - 1].or.length, 0)) {
                and.pop();
            }
        });
        if (hasSelection) {
            this.query = {and: and};
        }
    }
}

