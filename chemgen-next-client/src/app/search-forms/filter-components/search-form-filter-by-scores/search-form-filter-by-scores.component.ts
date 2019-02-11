import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {SearchFormFilterByScoresResults} from "../../../search/search.module";

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

