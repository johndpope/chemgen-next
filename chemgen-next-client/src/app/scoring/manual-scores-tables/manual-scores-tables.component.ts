import {Component, OnInit} from '@angular/core';
import {NgxSpinnerService} from "ngx-spinner";
import {ExpSetApi} from "../../../types/sdk/services/custom";

@Component({
    selector: 'app-manual-scores-tables',
    templateUrl: './manual-scores-tables.component.html',
    styleUrls: ['./manual-scores-tables.component.css']
})
export class ManualScoresTablesComponent implements OnInit {

    public errorMessage: any = null;
    public stats: Array<any> = null;
    public columnDefs = [
        {headerName: 'TreatId', field: 'treatment_group_id'},
        {headerName: 'Phenotype', field: 'manualscore_group'},
        {headerName: 'Score', field: 'manualscore_value'},
        {headerName: 'View', field: 'view'},
    ];
    public rowData: any = null;
    private gridApi;
    private gridColumnApi;

    constructor(private expSetApi: ExpSetApi, private spinner: NgxSpinnerService) {
    }

    ngOnInit() {
    }
}
