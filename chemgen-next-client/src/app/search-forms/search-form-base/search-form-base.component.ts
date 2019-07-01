import {Component, Input} from '@angular/core';
import {SearchFormBaseComponentParams} from "../../search/search.module";

/**
 * This is the base expSetSearch form, from which all (ok most) of the other expSetSearch forms inherit
 */

@Component({
    selector: 'app-search-form-base',
    templateUrl: './search-form-base.component.html',
    styleUrls: ['./search-form-base.component.css']
})
export class SearchFormBaseComponent {
    @Input('searchFormParams') searchFormParams: SearchFormBaseComponentParams;
    @Input('title') title: string;
    @Input('formDesc') formDesc: string;
    @Input('showRNAiTab') showRNAiTab: boolean = true;

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

