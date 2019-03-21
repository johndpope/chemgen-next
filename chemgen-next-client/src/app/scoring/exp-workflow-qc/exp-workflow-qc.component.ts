import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {NgxSpinnerService} from "ngx-spinner";
import {ExpManualScoresApi, ExpSetApi} from "../../../types/sdk/services/custom";
import {ExpSetSearchResults} from "../../../types/custom/ExpSetTypes";
import {get, uniq, trim, isEqual, orderBy, find} from 'lodash';
import {ExpAssay2reagentResultSet, ExpManualScoresResultSet, ExpPlateResultSet} from "../../../types/sdk/models";
import {Lightbox} from "angular2-lightbox";
import {Memoize} from 'lodash-decorators';

/**
 * WIP - Create tables like the one I have in slack, or the one that is created when I create those spreadsheets
 * That have a mapping of plates -> ExpGroupTypes
 * And Wells -> ExpGroupTypes
 */
@Component({
    selector: 'app-exp-workflow-qc',
    templateUrl: './exp-workflow-qc.component.html',
    styleUrls: ['./exp-workflow-qc.component.css']
})
export class ExpWorkflowQcComponent implements OnInit {

    @Input('expSets') expSets: ExpSetSearchResults;
    @Output('expSetsScored') expSetsScored = new EventEmitter<boolean>();
    public qcWellTable: Array<any> = [];
    public qcPlateTable: Array<any> = [];

    public qcPerWellColumnDefs = [
        {headerName: 'Barcode', field: 'Barcode'},
        {headerName: 'Well', field: 'Well'},
        {
            headerName: 'ExpGroupType', field: 'ExpGroupType', cellStyle: function (params) {
                if (params.value.match('treat')) {
                    //mark police cells as red
                    return {color: 'white', backgroundColor: '#8FBC8F'};
                } else if (params.value == 'ctrl_rnai') {
                    return {color: 'white', backgroundColor: '#BA55D3'};
                } else if (params.value == 'ctrl_null') {
                    return {color: 'white', backgroundColor: '#9370DB'};
                } else if (params.value == 'ctrl_strain') {
                    return {color: 'white', backgroundColor: '#DDA0DD'};
                }
            }
        },
        {headerName: 'ExpGroupId', field: 'ExpGroupId'},
        {headerName: 'TreatmentGroupId', field: 'TreatmentGroupId'},
    ];
    private qcPerWellGridApi;
    private qcPerWellGridColumnApi;

    public qcPerPlateColumnDefs = [
        {headerName: 'Barcode', field: 'Barcode'},
        {
            headerName: 'ExpGroupTypes', field: 'ExpGroupTypes', cellStyle: function (params) {
                if (params.value.match('treat')) {
                    //mark police cells as red
                    return {color: 'white', backgroundColor: '#8FBC8F'};
                } else if (params.value.match('rnai')) {
                    return {color: 'white', backgroundColor: '#BA55D3'};
                } else if (params.value.match('ctrl_null')) {
                    return {color: 'white', backgroundColor: '#9370DB'};
                } else if (params.value.match('ctrl_strain')) {
                    return {color: 'white', backgroundColor: '#DDA0DD'};
                }
            }
        },
        {headerName: 'ImageDate', field: 'ImageDate'},
    ];
    private qcPerPlateGridApi;
    private qcPerPlateGridColumnApi;

    constructor(
        private spinner: NgxSpinnerService,
        private expSetApi: ExpSetApi,
        private expManualScoresApi: ExpManualScoresApi,
        public _lightbox: Lightbox,
    ) {
    }

    ngOnInit() {
        if (this.expSets) {
            this.createPerWellQCTable();
            this.createQCPerPlateTable();
        }
    }


    createPerWellQCTable() {
        this.qcWellTable = this.expSets.expAssay2reagents.map((expAssay2reagent: ExpAssay2reagentResultSet) => {
            return this.setPerWellQCRow(expAssay2reagent);
        });
    }

    setPerWellQCRow(expAssay2reagent: ExpAssay2reagentResultSet) {
        let row: { Barcode, Well, ExpGroupType, ExpGroupId, TreatmentGroupId } = {
            Barcode: '',
            Well: '',
            ExpGroupType: '',
            ExpGroupId: '',
            TreatmentGroupId: ''
        };
        row['Barcode'] = get(this.findExpPlate(expAssay2reagent), 'barcode');
        row['Well'] = get(this.findExpAssay(expAssay2reagent), 'assayWell');
        row['ExpGroupType'] = expAssay2reagent.reagentType;
        row['ExpGroupId'] = expAssay2reagent.expGroupId;
        row['TreatmentGroupId'] = expAssay2reagent.treatmentGroupId;
        return row;
    }

    createQCPerPlateTable() {
        this.qcPlateTable = this.expSets.expPlates.map((expPlate: ExpPlateResultSet) => {
            let expGroupTypes = this.findExpGroupTypes(expPlate).sort();
            let row : {Barcode, ExpGroupTypes, ImageDate} = {Barcode: expPlate.barcode, ImageDate: expPlate.plateImageDate, ExpGroupTypes: expGroupTypes.join(', ')};
            return row;
        });
    }

    findExpGroupTypes(expPlate: ExpPlateResultSet) : Array<string>{
        let expAssay2reagents: ExpAssay2reagentResultSet[] = this.expSets.expAssay2reagents.filter((expAssay2reagent) => {
            return isEqual(expAssay2reagent.plateId, expPlate.plateId);
        });
        let expGroupTypes = expAssay2reagents.map((expAssay2reagent) => {
            return expAssay2reagent.reagentType;
        });
        return uniq(expGroupTypes);
    }

    findExpAssay(expAssay2reagent: ExpAssay2reagentResultSet) {
        return find(this.expSets.expAssays, {assayId: expAssay2reagent.assayId});
    }

    @Memoize
    findExpPlate(expAssay2reagent: ExpAssay2reagentResultSet) {
        return find(this.expSets.expPlates, {plateId: expAssay2reagent.plateId});
    }

    sizeToFit() {
        this.qcPerWellGridApi.sizeColumnsToFit();
        this.qcPerPlateGridApi.sizeColumnsToFit();

    }

    autoSizeAll() {
        let allColumnIds = [];
        this.qcPerWellGridColumnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });
        this.qcPerWellGridColumnApi.autoSizeColumns(allColumnIds);
        allColumnIds = [];
        this.qcPerPlateGridColumnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });
        this.qcPerPlateGridColumnApi.autoSizeColumns(allColumnIds);
    }

    onPerWellGridReady(params) {
        this.qcPerWellGridApi = params.api;
        this.qcPerWellGridColumnApi = params.columnApi;
        this.qcPerWellGridApi.sizeColumnsToFit();
    }
    onPerPlateGridReady(params) {
        this.qcPerPlateGridApi = params.api;
        this.qcPerPlateGridColumnApi = params.columnApi;
        this.qcPerPlateGridApi.sizeColumnsToFit();
    }
}
