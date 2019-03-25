import {Component, OnInit} from '@angular/core';
import {ExpManualScoresApi} from "../../../types/sdk/services/custom";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
    // selector: 'app-scored-summary',
    templateUrl: './scored-summary.component.html',
    styleUrls: ['./scored-summary.component.css']
})
export class ScoredSummaryComponent implements OnInit {

    public errorMessage: any = null;
    public stats: Array<any> = null;
    public columnDefs = [
        {headerName: 'Screen', field: 'screenName' },
        {headerName: 'Batch', field: 'expWorkflowName' },
        {headerName: '# Total Assays', field: 'allExpSets'},
        {headerName: '# Total First Pass', field: 'allFirstPassExpSets'},
        {headerName: '# First Pass Interesting', field: 'interestingFirstPassExpSets'},
        {headerName: '# Detailed Score', field: 'detailScoresExpSets'},
    ];
    private gridApi;
    private gridColumnApi;

    constructor(private expManualScoresApi: ExpManualScoresApi, private spinner: NgxSpinnerService) {
    }

    ngOnInit() {
        this.getSummaryStats();
    }

    sizeToFit() {
        this.gridApi.sizeColumnsToFit();
    }

    autoSizeAll() {
        let allColumnIds = [];
        this.gridColumnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId);
        });
        this.gridColumnApi.autoSizeColumns(allColumnIds);
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridApi.sizeColumnsToFit();
    }

    getSummaryStats() {
        this.spinner.show();
        this.expManualScoresApi
            .summary({})
            .subscribe((results) => {
                this.stats = results.results;
                this.spinner.hide();
            }, (error) => {
                this.spinner.hide();
                this.errorMessage = error.toString();
            });

    }

}
