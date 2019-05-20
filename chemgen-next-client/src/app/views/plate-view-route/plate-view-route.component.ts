import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ExpSetSearch, ExpSetSearchResults} from "../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";
import {ExpSetApi} from "../../../types/sdk/services/custom";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
    selector: 'app-plate-view-route',
    templateUrl: './plate-view-route.component.html',
    styleUrls: ['./plate-view-route.component.css']
})
export class PlateViewRouteComponent implements OnInit {

    public plateId: number = null;
    public expSetSearch: ExpSetSearch = new ExpSetSearch({});
    public expSets: ExpSetSearchResults = null;

    constructor(private activatedRoute: ActivatedRoute, private expSetApi: ExpSetApi, private spinner: NgxSpinnerService) {
    }

    ngOnInit() {
        this.plateId = this.activatedRoute.snapshot.params['plateId'];
        this.expSetSearch.plateSearch = [this.plateId];
        console.log(`PlateId: ${this.plateId}`);
        this.getPlateData();
    }

    getPlateData() {
        this.spinner.show();
        this.expSetApi.getExpSets(this.expSetSearch)
            .subscribe((results: any) => {
                this.expSets = results.results;
                console.log(results);
                this.spinner.hide();
            }, (error) => {
                this.spinner.hide();
                console.log(error);
            })
    }
}
