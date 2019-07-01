import {Component, OnInit, Input} from '@angular/core';
import {ExpSetSearchResults} from "../../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";

@Component({
    selector: 'app-plate-data',
    templateUrl: './plate-data.component.html',
    styleUrls: ['./plate-data.component.css']
})
export class PlateDataComponent implements OnInit {
    @Input() expSet: ExpSetSearchResults = null;

    constructor() {
    }

    ngOnInit() {
    }

}
