import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
    ExpsetModule,
    ExpSetSearch,
    ExpSetSearchResults
} from "../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";
import {ExpSetApi} from "../../../types/sdk/services/custom";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
    selector: 'app-related-expsets-route',
    templateUrl: './related-expsets-route.component.html',
    styleUrls: ['./related-expsets-route.component.css']
})
export class RelatedExpsetsRouteComponent implements OnInit {

    public treatmentGroupId: number = null;
    public expSetSearch: ExpSetSearch = new ExpSetSearch({});
    public expSetsModule: ExpsetModule;
    public expSets: ExpSetSearchResults = null;

    constructor(private activatedRoute: ActivatedRoute, private expSetApi: ExpSetApi, private spinner: NgxSpinnerService) {
    }

    ngOnInit(): void {
        this.treatmentGroupId = this.activatedRoute.snapshot.params['treatmentGroupId'];
        this.expSetSearch.expGroupSearch = [this.treatmentGroupId];
        console.log(`TreatmentGroupId: ${this.treatmentGroupId}`);
        this.getRelatedExpSets();
    }

    getRelatedExpSets() {
        this.spinner.show();
        this.expSetApi
            .getRelatedExpSets(this.expSetSearch)
            .subscribe((results) => {
                console.log(results);
                this.expSets = results.results;
                this.expSetsModule = new ExpsetModule(this.expSets);
                this.expSetsModule.deNormalizeExpSets();
                this.spinner.hide();
            }, (error) => {
                console.log(error);
                this.spinner.hide();
            })
    }
}
