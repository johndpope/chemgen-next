import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-search-form-view-options',
    templateUrl: './search-form-view-options.component.html',
    styleUrls: ['./search-form-view-options.component.css'],
})
export class SearchFormViewOptionsComponent implements OnInit {

    @Input('formResults') formResults: SearchFormViewOptionsResults = new SearchFormViewOptionsResults();

    constructor() {
    }

    ngOnInit() {

    }
}


export class SearchFormViewOptionsResults {
    viewOptions: any = 'contactSheetPlateView';
    rankOrder: any = 'none';
}
