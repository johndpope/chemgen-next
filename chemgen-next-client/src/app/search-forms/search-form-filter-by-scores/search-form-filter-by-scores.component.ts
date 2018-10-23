import {Component, OnInit, OnChanges, Input} from '@angular/core';
import {ManualScoresModule} from "../../scoring/manual-scores/manual-scores.module";
import {isEmpty, has, get, find} from 'lodash';
import {ExpManualScoreCodeResultSet} from "../../../types/sdk/models";

@Component({
    selector: 'app-search-form-filter-by-scores',
    templateUrl: './search-form-filter-by-scores.component.html',
    styleUrls: ['./search-form-filter-by-scores.component.css']
})
export class SearchFormFilterByScoresComponent implements OnInit, OnChanges {

    @Input() searchFormFilterByScoresResults: SearchFormFilterByScoresResults = new SearchFormFilterByScoresResults();

    constructor() {
    }

    ngOnInit() {
    }

    ngOnChanges() {
        console.log('changes');
        this.searchFormFilterByScoresResults.createManualScoreQuery();
    }

}

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
        if(isEmpty(this.query)){
            this.query = null;
        }
    }

}
