import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: []
})
export class ScoreTableModule {
}

export class BaseGrid {
    private gridApi;
    private gridColumnApi;

    constructor(gridApi, gridColumnApi) {
        this.gridApi = gridApi;
        this.gridColumnApi = gridColumnApi;
    }

    sizeToFit() {
        this.gridApi.sizeColumnsToFit();
    }

    autoSizeAll() {
        let allColumnIds = [];
        this.gridColumnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });
        this.gridColumnApi.autoSizeColumns(allColumnIds);
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridApi.sizeColumnsToFit();
    }

}

export class ScoreSummaryTable {
    public stats: Array<any> = null;
    public columnDefs = [
        {headerName: 'Screen', field: 'screenName'},
        {headerName: 'Batch', field: 'expWorkflowName'},
        {headerName: '# Total Assays', field: 'allExpSets'},
        {headerName: '# Total First Pass', field: 'allFirstPassExpSets'},
        {headerName: '# First Pass Interesting', field: 'interestingFirstPassExpSets'},
        {headerName: '# Detailed Score', field: 'detailScoresExpSets'},
    ];
    public baseGrid: BaseGrid;

    constructor(gridApi, gridColumnApi) {
        this.baseGrid = new BaseGrid(gridApi, gridColumnApi);
    }
}
