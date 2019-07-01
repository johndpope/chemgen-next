// This is just a base grid module that takes care of some of the common grid functionality

export class GridBaseModule {
    private gridApi;
    private gridColumnApi;

    constructor() {

    }

    //Grid Stuff
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

    getSelectedRows() {
        this.gridApi.getModel().rowsAfterFilter();
        return this.gridApi.getSelectedRows();
    }

    getDisplayedRows() {
        let count = this.gridApi.getDisplayedRowCount();
        let rows = [];
        for (let i = 0; i < count; i++) {
            let rowNode = this.gridApi.getDisplayedRowAtIndex(i);
            rows.push(rowNode.data);
        }
        return rows;
    }
}
