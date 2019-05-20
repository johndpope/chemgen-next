import {Component, OnInit, Input} from '@angular/core';
import {ExpSetSearchResults} from "../../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";


@Component({
    selector: 'app-score-data',
    templateUrl: './score-data.component.html',
    styleUrls: ['./score-data.component.css']
})
export class ScoreDataComponent implements OnInit {
    @Input() expSet: ExpSetSearchResults;

    constructor() {
    }

    ngOnInit() {
    }

}
