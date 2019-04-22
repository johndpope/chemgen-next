import {Component, OnInit, Input} from '@angular/core';
import {ExpsetModule} from '../expset/expset.module';
import {ExpSetSearch} from "../../../types/custom/ExpSetTypes";

/**
 * WIP
 * Allow for searching by different expData - genesList, chemicals, expWorkflow, plate, barcode, date, etc
 * Also add infinite scroll
 */

@Component({
    selector: 'app-expset-sheet',
    templateUrl: './expset-sheet.component.html',
    styleUrls: ['./expset-sheet.component.css']
})
export class ExpsetSheetComponent implements OnInit {
    @Input() expSets: any;
    @Input() expSetSearch: ExpSetSearch;
    @Input() expSetModule: ExpsetModule;
    @Input() displayToggle: boolean = true;

    constructor() {
    }

    ngOnInit() {
    }

}
