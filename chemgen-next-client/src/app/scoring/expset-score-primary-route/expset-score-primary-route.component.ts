import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgxSpinnerService} from "ngx-spinner";
import {ExpSetApi} from "../../../types/sdk/services/custom";
import {
    ExpSetSearchResults,
    ExpSetSearch,
    ExpsetModule
} from "../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";
import {find} from 'lodash';

@Component({
    selector: 'app-expset-score-primary-route',
    templateUrl: './expset-score-primary-route.component.html',
    styleUrls: ['./expset-score-primary-route.component.css']
})
export class ExpsetScorePrimaryRouteComponent implements OnInit {

    public treatmentGroupId: number = null;
    public expSetSearch: ExpSetSearch = new ExpSetSearch({});
    public expSetsModule: ExpsetModule;
    public expSets: ExpSetSearchResults = null;

    public scored: boolean = false;
    public previouslyScored: boolean = false;

    constructor(private activatedRoute: ActivatedRoute, private expSetApi: ExpSetApi, private spinner: NgxSpinnerService) {
    }

    ngOnInit() {
        this.treatmentGroupId = this.activatedRoute.snapshot.params['treatmentGroupId'];
        this.expSetSearch.expGroupSearch = [this.treatmentGroupId];
        this.findExpSets();
    }

    findExpSets() {
        this.spinner.show();
        this.expSetApi
            .getExpSets(this.expSetSearch)
            .subscribe((results) => {
                console.log(results);
                this.expSets = results.results;
                this.expSetsModule = new ExpsetModule(this.expSets);
                this.expSetsModule.deNormalizeExpSets();
                this.checkIfHasBeenScored();
                console.log(this.expSets);
                this.spinner.hide();
            }, (error) => {
                console.log(error);
                this.spinner.hide();
            });
    }

    /**
     * Run a check to see if this set has already been scored
     */
    checkIfHasBeenScored() {
        let expManualScore = find(this.expSets.expManualScores, {manualscoreGroup: 'HAS_MANUAL_SCORE'});
        if (expManualScore) {
            this.previouslyScored = true;
        }
    }

    getNewExpSets($event) {
        this.scored = true;
        console.log('done');
    }


}