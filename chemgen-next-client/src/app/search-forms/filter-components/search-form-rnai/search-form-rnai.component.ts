import {Component, Input, OnInit} from '@angular/core';
import {RNAiSearch} from "../../../search/search.module";

@Component({
    selector: 'app-search-form-rnai',
    templateUrl: './search-form-rnai.component.html',
    styleUrls: ['./search-form-rnai.component.css']
})
export class SearchFormRnaiComponent implements OnInit {

    @Input('formResults') formResults: any;
    @Input('rnaiSearch') rnaiSearch: RNAiSearch;
    rnais = '';

    constructor() {
    }

    ngOnInit() {
    }

    updateRnaisList() {
        this.rnaiSearch.reagentSearch.rnaiList = [];
        this.rnais.split('\n').map((split1) => {
            split1.split(/\s+/).map((split2) => {
                if (split2) {
                    this.rnaiSearch.reagentSearch.rnaiList.push(split2.trim())
                }
            });
        });
        if (this.rnaiSearch.reagentSearch.rnaiList.length) {
            this.rnaiSearch.search();
        }
    }

}

