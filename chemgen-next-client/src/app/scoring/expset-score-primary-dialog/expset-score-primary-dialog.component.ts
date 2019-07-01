import {Component, OnInit, ViewChild, Input} from '@angular/core';
import {ExpsetModule} from "../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";
import {ModalDirective} from "ngx-bootstrap";

@Component({
    selector: 'app-expset-score-primary-dialog',
    templateUrl: './expset-score-primary-dialog.component.html',
    styleUrls: ['./expset-score-primary-dialog.component.css']
})
export class ExpsetScorePrimaryDialogComponent implements OnInit {
    @Input('expSet') expSet: any;
    @Input('expSetModule') expSetModule: ExpsetModule;
    @Input('albums') albums: any;
    @Input('score') score: boolean;
    @Input('contactSheetResults') contactSheetResults: any = {interesting: {}};
    @ViewChild('scoreExpSetModal') scoreExpSetModal: ModalDirective;

    constructor() {
    }

    ngOnInit() {
    }

    scoreExpSets() {
        // this.showProgress = true;
        this.showChildModal();
        // this.showProgress = false;
    }

    showChildModal(): void {
        this.scoreExpSetModal.show();
    }

}
