import {Component, OnInit} from '@angular/core';
import {ExpAssay2reagentApi, ExpSetApi, ChemicalLibraryApi} from "../../../types/sdk/services/custom";
import {
    ExpSetSearch,
    ExpSetSearchResults,
    ExpsetModule
} from "../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";
import {NgxSpinnerService} from "ngx-spinner";
import {ChemicalLibraryResultSet} from "../../../types/sdk/models";
import {get, isEqual} from 'lodash';
import {HotkeysService, Hotkey} from "angular2-hotkeys";

@Component({
    selector: 'app-search-form-chemical-library',
    templateUrl: './search-form-chemical-library.component.html',
    styleUrls: ['./search-form-chemical-library.component.css']
})
export class SearchFormChemicalLibraryComponent implements OnInit {

    public expSetSearch: ExpSetSearch = new ExpSetSearch({});
    public expSetsModule: ExpsetModule;
    public expSets: ExpSetSearchResults = null;

    private gridApi;
    private gridColumnApi;

    public chemicalLibraryTable: ChemicalLibraryResultSet[] = null;
    public rowSelection: string = "multiple";
    public columnDefs = [
        {headerName: 'Library Id', field: 'libraryId'},
        {headerName: 'PlateWell', field: 'plateWell'},
        {headerName: 'Compound Library Id', field: 'compoundLibraryId'},
        {headerName: 'Compound Systematic Name', field: 'compoundSystematicName'},
        {headerName: 'Compound MW', field: 'compoundMw'},
        {headerName: 'Compound Formula', field: 'compoundFormula'},
    ];
    public invalidSearch: string = null;

    constructor(private expSetApi: ExpSetApi, private expAssay2reagentApi: ExpAssay2reagentApi, private chemicalLibraryApi: ChemicalLibraryApi, private spinner: NgxSpinnerService, private hotkeysService: HotkeysService) {
        // this.getRnaiLibraryTableData();
        this.getChemicalLibraryTableData();
    }

    ngOnInit() {
        this.registerHotKeys();
    }

    registerHotKeys() {
        this.hotkeysService.reset();
        this.hotkeysService.add(new Hotkey(['t'], (event: KeyboardEvent): boolean => {
            const elem = document.getElementById(`chemicalLibraryTable`);
            if (elem) {
                elem.scrollIntoView();
            } else {
                console.error('Element corresponding to chemicalLibraryTable does not exist!');
            }
            return false; // Prevent bubbling
        }, undefined, 'Return to the table'));
    }

    getChemicalLibraryTableData() {
        this.chemicalLibraryApi
            .find({
                // where: {libraryId: 2},
                // limit: 20000,
            })
            .subscribe((chemicalResults: ChemicalLibraryResultSet[]) => {
                this.chemicalLibraryTable = chemicalResults;
                this.chemicalLibraryTable.map((chemicalResult) => {
                    chemicalResult['plateWell'] = `${chemicalResult.plate}-${chemicalResult.well}`;
                });
                console.log('got results');
            }, (error) => {
                console.log(error);
            });
    }

    onSelectionChanged() {
        this.isReagentSearchValid();
        if (isEqual(this.invalidSearch, null)) {
            this.getExpGroupIdsFromSelections();
        }
    }

    getExpGroupIdsFromSelections() {
        let selectedRows = this.gridApi.getSelectedRows();
        let chemicalSearch: Array<{ libraryId, reagentId }> = selectedRows.map((row) => {
            return {libraryId: row.libraryId, reagentId: row.compoundId};
        });

        this.spinner.show();
        this.expSetApi
            .getExpSetsByLibraryData(chemicalSearch)
            .subscribe((results) => {
                this.expSets = results.results;
                this.expSetsModule = new ExpsetModule(this.expSets);
                this.expSetsModule.deNormalizeExpSets();
                this.spinner.hide();
                let id = get(this.expSetsModule.expSetsDeNorm, [0, 'albums', 'treatmentGroupId']);
                console.log(`Id is : expSet-${id}`);
                this.setFocusExpSets(`expSet-${id}`);
                console.log(results);
            }, (error) => {
                this.spinner.hide();
                console.log(error);
            });
    }

    isReagentSearchValid() {
        this.invalidSearch = null;
        let selectedRows = this.gridApi.getSelectedRows();
        if (selectedRows.length && selectedRows.length <= 100) {
            this.invalidSearch = null;
        } else {
            this.invalidSearch = `Your search contains ${selectedRows.length} library results. It must contain between 1 and 100. Please modify your search.`;
        }
    }

    /**
     * Once we have the expSets we want to set them as the focus on the page
     * @param id
     */
    setFocusExpSets(id: string) {
        if (id) {
            // We have to set a bit of a timeout here in order to
            // make sure the expSets have actually shown up on the page
            setTimeout(() => {
                const elem = document.getElementById(id);
                if (elem) {
                    elem.scrollIntoView();
                } else {
                    console.error(`Element corresponding to ${id} does not exist!`);
                }
            }, 500);
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
