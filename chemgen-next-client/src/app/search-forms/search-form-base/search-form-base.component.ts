import {Component, Input} from '@angular/core';
import {SearchFormBaseComponentParams} from "../../search/search.module";

/**
 * This is the base search form, from which all (ok most) of the other search forms inherit
 */

@Component({
    selector: 'app-search-form-base',
    templateUrl: './search-form-base.component.html',
    styleUrls: ['./search-form-base.component.css']
})
export class SearchFormBaseComponent {
    @Input('searchFormParams') searchFormParams: SearchFormBaseComponentParams;
    @Input('title') title: string;

    constructor() {

    }

    getNewExpSets() {
        this.searchFormParams.formSubmitted = false;
        this.searchFormParams.onSubmit();
    }


    /**
     * This is linked to the pagination on the front end
     * @param pageNo
     */
    getNewPage(pageNo: number) {
        this.searchFormParams.paginationData.currentPage = pageNo;
        console.log(`Getting a new page ${pageNo}`);
        this.searchFormParams.findExpSets();
    }

}

