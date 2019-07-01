import {Component, OnInit} from '@angular/core';
import {ExpScreenUploadWorkflowApi, PlateApi, RnaiLibraryApi} from "../../../types/sdk/services/custom";
import {GridBaseModule} from "../../grid/grid-base/grid-base.module";
import {find, isEqual, get, compact, padStart} from 'lodash';
import {LoopBackFilter, PlateResultSet} from "../../../types/sdk/models";
import {Observable} from "rxjs";

@Component({
    selector: 'app-upload-rnai-primary',
    templateUrl: './upload-rnai-primary.component.html',
    styleUrls: ['./upload-rnai-primary.component.css']
})
export class UploadRnaiPrimaryComponent implements OnInit {

    //Store all the results here -
    public screenUploadResults = new ScreenUploadResults();
    public screenType: Array<any> = [
        {display: 'Permissive', barcodeKey: 'E'},
        {display: 'Restrictive', barcodeKey: 'S'}
    ];
    public quadMapping: any = {
        'Q1': 'A1',
        'Q2': 'B1',
        'Q3': 'A2',
        'Q4': 'B2',
    };
    public batches: any = {};
    public batchesList: Array<any> = [];


    // ctrlNull - L4440
    public ctrlNullTable: PlateGrid;

    // treatRnai - RnaiM
    public treatRnaiTable: PlateGrid;

    // ctrlRnai - Rnai
    public ctrlRnaiTable: PlateGrid;

    // ctrlStrain - L4440M
    public ctrlStrainTable: PlateGrid;

    constructor(private plateApi: PlateApi,
                private expWorkflowApi: ExpScreenUploadWorkflowApi,
                private rnaiLibraryApi: RnaiLibraryApi) {
        this.ctrlNullTable = new PlateGrid(this.plateApi);
        this.ctrlStrainTable = new PlateGrid(this.plateApi);
        this.ctrlRnaiTable = new PlateGrid(this.plateApi);
        this.treatRnaiTable = new PlateGrid(this.plateApi);
    }

    ngOnInit() {
    }

    /**
     * Search for the L4440 plats
     */
    searchCtrlNullPlates() {
        let where: any = {
            and: [
                {creationdate: {inq: this.parseDatesForMicroscope(this.ctrlNullTable.dates)}},
                {name: {like: `L4440%${this.screenUploadResults.screenType.barcodeKey}%`}},
                {name: {nlike: `%M%`}},
            ]
        };

        this.ctrlNullTable.searchPlates(where);
    }

    /**
     * Search for the L4440 in the mutant plates
     */
    searchCtrlStrainPlates() {
        let where: any = {
            and: [
                {creationdate: {inq: this.parseDatesForMicroscope(this.ctrlStrainTable.dates)}},
                {name: {like: `L4440%${this.screenUploadResults.screenType.barcodeKey}%`}},
                {name: {like: `%M%`}},
            ]
        };

        this.ctrlStrainTable.searchPlates(where);
    }

    /**
     * Search for RNAi N2 plates
     */
    searchCtrlRnaiPlates() {
        let where: any = {
            and: [
                {creationdate: {inq: this.parseDatesForMicroscope(this.ctrlRnaiTable.dates)}},
                {name: {like: `Rna%${this.screenUploadResults.screenType.barcodeKey}%`}},
                {name: {nlike: `%M%`}},
            ]
        };

        this.ctrlRnaiTable.searchPlates(where);
    }

    /**
     * Search for the rnai + mutant plates
     */
    searchTreatRnaiPlates() {
        let where: any = {
            and: [
                {creationdate: {inq: this.parseDatesForMicroscope(this.treatRnaiTable.dates)}},
                {name: {like: `Rna%${this.screenUploadResults.screenType.barcodeKey}%`}},
                {name: {like: `%M%`}},
            ]
        };

        this.treatRnaiTable.searchPlates(where);
    }

    splitToBatches() {
        this.batches = {};
        let expBiosampleName = 'mel-28';
        let controlBiosampleName = 'N2';
        let screenType = this.screenUploadResults.screenType.display;
        // let batchName = `AHR2 ${this.treatRnaiTable.dates[0]} ${expBiosampleName} ${controlBiosampleName} ${screenType} Chr ${chrom} Plate ${plate} Q ${quadrant}`;

        let match = /RNAi(\w+).(\d+)(\w{2})/;
        // Batches are named chr plate quadrant
        this.treatRnaiTable.getDisplayedRows().map((plate: PlateResultSet) => {
            let matches = match.exec(plate.name);
            let chr = matches[1];
            let rnaiPlate = matches[2];
            let quad = matches[3];
            quad = this.checkQuadMapping(quad);
            let batchName = `${chr}-${rnaiPlate}-${quad}`;
            if (!get(this.batches, batchName)) {
                this.batches[batchName] = {};
                this.batches[batchName]['treatRnai'] = [];
                this.batches[batchName]['ctrlRnai'] = [];
            }
            this.batches[batchName]['treatRnai'].push(plate);
        });
        this.ctrlRnaiTable.getDisplayedRows().map((plate: PlateResultSet) => {
            let matches = match.exec(plate.name);
            let chr = matches[1];
            let rnaiPlate = matches[2];
            let quad = matches[3];
            quad = this.checkQuadMapping(quad);
            let batchName = `${chr}-${rnaiPlate}-${quad}`;
            if (!get(this.batches, batchName)) {
                this.batches[batchName] = {};
                this.batches[batchName]['treatRnai'] = [];
                this.batches[batchName]['ctrlRnai'] = [];
            }
            this.batches[batchName]['ctrlRnai'].push(plate);
        });

        this.batchesList = [];
        Object.keys(this.batches).map((batchName) => {
            let batch: { treatRnai, ctrlRnai } = this.batches[batchName];
            this.batchesList.push({name: batchName, ctrlRnai: batch.ctrlRnai, treatRnai: batch.treatRnai});
        });
    }

    checkQuadMapping(quad) {
        if (get(this.quadMapping, quad)) {
            return get(this.quadMapping, quad);
        } else {
            return quad;
        }
    }

    parseDatesForMicroscope(dates: Array<any>) {
        dates = compact(dates);
        return dates.map((date: Date) => {
            let month: number | string;
            month = date.getMonth() + 1;
            month = padStart(String(month), 2, '0');
            let day: number | string;
            day = date.getDate();
            day = padStart(String(day), 2, '0');
            return `${date.getFullYear()}-${month}-${day}`;
        });
    }
}

export class ScreenUploadResults {
    public screenType: { display, barcodeKey };


}

/**
 * This class deals with all the grid behavior to display the plates
 * I also threw the dates in here since they are used for the search
 */
export class PlateGrid extends GridBaseModule {

    public rows: PlateResultSet[] = [];
    public dates: Array<any> = [null];
    public rowSelection: string = "multiple";
    public screenTypeBarcodeKey: string = null;
    public mutantBarcodeKey: string = 'M';

    public columnDefs = [
        {headerName: 'Date', field: 'creationdate'},
        {headerName: 'Barcode', field: 'name'},
    ];

    constructor(private plateApi: PlateApi) {
        super();
    }

    public setSearch() {

    }

    addDate() {
        this.dates.push(this.dates[this.dates.length - 1]);
    }

    removeDate(index) {
        if (index > -1) {
            this.dates.splice(index, 1);
        }
    }

    removeRows() {
        let selectedRows = this.getSelectedRows();
        this.rows = this.rows.filter((plate: PlateResultSet) => {
            return !find(selectedRows, {csPlateid: plate.csPlateid});
        });
    }


    public searchPlates(where: any) {
        this.plateApi
            .find({
                where: where,
                limit: 100,
                fields: {
                    csPlateid: true,
                    id: true,
                    name: true,
                    platebarcode: true,
                    creationdate: true,
                    imagepath: true
                }
            })
            .subscribe((plates: PlateResultSet[]) => {
                this.rows = plates;
            }, (error) => {
                console.error(error);
            })
    }
}

