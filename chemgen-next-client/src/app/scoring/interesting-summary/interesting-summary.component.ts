import {Component, OnInit, Input} from '@angular/core';
import {ExpSetApi} from "../../../types/sdk/services/custom";
import {
    ExpsetModule,
    ExpSetSearch,
    ExpSetSearchResults
} from "../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";
import {ScoreSummaryTable} from "../score-table/score-table.module";
import {RnaiLibraryResultSet} from "../../../types/sdk/models";
import {get} from 'lodash';
import {HotkeysService, Hotkey} from "angular2-hotkeys";

@Component({
    selector: 'app-interesting-summary',
    templateUrl: './interesting-summary.component.html',
    styleUrls: ['./interesting-summary.component.css']
})
export class InterestingSummaryComponent implements OnInit {

    @Input() expSetSearch: ExpSetSearch = new ExpSetSearch({screenSearch: [1]});
    @Input() expSets: ExpSetSearchResults;
    @Input() expSetModule: ExpsetModule;

    /**
     * Summary Stats Table - this is the same table that appears on the scored-summary
     */
    public scoreSummaryTable: ScoreSummaryTable;
    public scoreSummaryTableRows: Array<any> = null;
    private gridApi;
    private gridColumnApi;
    public rowSelection: string = "single";
    public columnDefs = [
        {headerName: 'Screen', field: 'screenName'},
        {headerName: 'Batch', field: 'expWorkflowName'},
        {headerName: 'Stage', field: 'screenStage'},
        {headerName: 'Type', field: 'screenType'},
        {headerName: 'ExpBiosample', field: 'experimentBiosample'},
        {headerName: 'CtrlBiosample', field: 'ctrlBiosample'},
        {headerName: 'Reagent Types', field: 'reagentTypes'},
        {headerName: 'Reagent Names', field: 'reagentNames'},
        {headerName: 'Primary Target Gene Ids', field: 'primaryTargetGeneIds'},
        {headerName: 'Primary Target Gene Systematic Names', field: 'primaryTargetGeneSytematicNames'},
        {headerName: 'Primary Target Gene Common Names', field: 'primaryTargetGeneCommonNames'},
        {headerName: 'Master Plate Well', field: 'masterPlateWells'},
        {headerName: 'Stock Plate Well', field: 'stockPlateWells'},
    ];
    public exportCSVFileName: string = 'export.csv';

    constructor(private expSetApi: ExpSetApi, private hotkeysService: HotkeysService) {
        this.scoreSummaryTable = new ScoreSummaryTable(this.gridApi, this.gridColumnApi);
    }

    ngOnInit() {
        // this.getInterestingExpSets();
        this.expSetModule.deNormalizeExpSets();
        this.generateInterestingScoreSummaryTable();
        this.registerHotKeys();
    }

    registerHotKeys() {
        this.hotkeysService.reset();
        this.hotkeysService.add(new Hotkey(['t'], (event: KeyboardEvent): boolean => {
            const elem = document.getElementById(`scoreSummaryTable`);
            if (elem) {
                elem.scrollIntoView();
            } else {
                console.error('Element corresponding to expSet does not exist!');
            }
            return false; // Prevent bubbling
        }, undefined, 'Return to the table'));
    }

    getInterestingExpSets() {
        console.log('getting interesting expsets');
        this.expSetApi.getInterestingExpSets(this.expSetSearch)
            .subscribe((results: any) => {
                console.log('got results');
                this.expSets = results.results;
                this.expSetModule = new ExpsetModule(this.expSets);
                this.expSetModule.deNormalizeExpSets();
                this.generateInterestingScoreSummaryTable();
            }, (error) => {
                console.log(error);
            })

    }


    generateInterestingScoreSummaryTable() {

        const rows = this.expSetModule.expSetsDeNorm.map((expSet) => {
            return {
                treatmentGroupId: expSet.albums.treatmentGroupId,
                screenName: expSet.expScreen.screenName,
                expWorkflowName: expSet.expWorkflow.name,
                temperature: expSet.expWorkflow.temperature,
                screenStage: expSet.expWorkflow.screenStage,
                screenType: expSet.expWorkflow.screenType,
                ctrlBiosample: expSet.expWorkflow.biosamples.ctrlBiosample.name,
                experimentBiosample: expSet.expWorkflow.biosamples.experimentBiosample.name,
                reagentNames: expSet.rnaisList.map((rnaiResult: RnaiLibraryResultSet) => {
                    return rnaiResult.reagentName;
                }).join(", "),
                reagentTypes: this.getReagentNames(expSet),
                primaryTargetGeneIds: this.getPrimaryTargetGeneIds(expSet),
                primaryTargetGeneSytematicNames: this.getPrimaryTargetGeneSystematicNames(expSet),
                primaryTargetGeneCommonNames: this.getPrimaryTargetGeneCommonNames(expSet),
                stockPlateWells: this.getStockPlateWells(expSet),
                masterPlateWells: this.getMasterPlateWells(expSet),
            }
        });
        console.log(rows);
        this.scoreSummaryTableRows = rows;
        return rows;
    }

    getMasterPlateWells(expSet) {
        expSet.rnaisList.map((rnaiResult: RnaiLibraryResultSet) => {
            return rnaiResult.masterPlateWell;
        }).join(", ")
    }

    getStockPlateWells(expSet) {
        return expSet.rnaisList.map((rnaiResult: RnaiLibraryResultSet) => {
            return rnaiResult.stockPlateWell;
        }).join(", ")
    }

    getPrimaryTargetGeneCommonNames(expSet) {
        return expSet.rnaisList.map((rnaiResult: RnaiLibraryResultSet) => {
            return rnaiResult.primaryTargetGeneCommonName;
        }).join(", ")
    }

    getPrimaryTargetGeneSystematicNames(expSet) {
        return expSet.rnaisList.map((rnaiResult: RnaiLibraryResultSet) => {
            return rnaiResult.primaryTargetGeneSystematicName;
        }).join(", ");
    }

    /**
     * Get the reagent names from either the chemical list or the rnaiList
     * @param expSet
     */
    getReagentNames(expSet) {
        return expSet.rnaisList.map((rnaiResult: RnaiLibraryResultSet) => {
            return rnaiResult.reagentName;
        }).join(", ")
    }

    getPrimaryTargetGeneIds(expSet) {
        return expSet.rnaisList.map((rnaiResult: RnaiLibraryResultSet) => {
            return rnaiResult.primaryTargetGeneId;
        }).join(", ");
    }

    /**
     * User can hit the export button to export the data as a csv
     */
    onBtnExport() {
        this.gridApi.exportDataAsCsv({fileName: this.exportCSVFileName});
    }

    /**
     * When a user clicks on a row it should put the corresponding expset into view
     * @param $event
     */
    onSelectionChanged($event) {
        let selectedRows = this.gridApi.getSelectedRows();
        if (selectedRows.length && get(selectedRows[0], 'treatmentGroupId')) {

            const elem = document.getElementById(`expSet-${selectedRows[0].treatmentGroupId}`);
            if (elem) {
                elem.scrollIntoView();
            } else {
                console.error('Element corresponding to expSet does not exist!');
            }
        }
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
}
