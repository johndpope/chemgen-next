import {Component, OnInit, Input, Output, OnChanges, EventEmitter} from '@angular/core';
import {ExpSetSearch, ExpsetModule} from "../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";
import {isEmpty, isEqual} from 'lodash';

@Component({
    selector: 'app-expset-score-primary-sheet',
    templateUrl: './expset-score-primary-sheet.component.html',
    styleUrls: ['./expset-score-primary-sheet.component.css']
})
export class ExpsetScorePrimarySheetComponent implements OnChanges {
    @Input() expSets: any;
    @Input() expSetSearch: ExpSetSearch;
    @Input() expSetModule: ExpsetModule;
    @Output() getMoreExpSets = new EventEmitter<boolean>();

    constructor() {
    }

    ngOnChanges(){
        console.log('in on changes....');
        console.log(`ExpSets Len : ${this.expSetModule.expSetsDeNorm.length}`);

        if(isEqual(this.expSetModule.expSetsDeNorm.length, 0)){
            this.getMoreExpSets.emit(true);
            console.log('get more exp sets!');
        }else if (isEmpty(this.expSetModule.expSetsDeNorm)){
            this.getMoreExpSets.emit(true);
            console.log('get more exp sets!');
        }

    }

}
