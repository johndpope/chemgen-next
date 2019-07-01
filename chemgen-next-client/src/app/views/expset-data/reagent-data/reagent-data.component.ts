import {Component, Input, OnInit} from '@angular/core';
import {ExpSetSearchResults} from "../../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";
import {isEqual} from 'lodash';

@Component({
    selector: 'app-reagent-data',
    templateUrl: './reagent-data.component.html',
    styleUrls: ['./reagent-data.component.css']
})
export class ReagentDataComponent implements OnInit {
    @Input() expSet: ExpSetSearchResults;

    constructor() {
    }

    ngOnInit() {
    }

    returnLibraryName(id: number) {
        if (isEqual(id, 2)) {
            return 'Chembridge';
        } else if (isEqual(id, 3)) {
            return 'FDA';
        } else {
            return `Unknown library id : ${id}`;
        }

    }
}
