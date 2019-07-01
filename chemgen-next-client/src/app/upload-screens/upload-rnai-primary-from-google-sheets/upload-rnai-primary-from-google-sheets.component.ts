import {Component, OnInit} from '@angular/core';
import {ExpScreenUploadWorkflowResultSet} from "../../../types/sdk/models";
import {ExpScreenUploadWorkflowApi} from "../../../types/sdk/services/custom";
import {get, isArray, isObject, isEqual} from 'lodash';
import {NgxSpinnerService} from "ngx-spinner";

@Component({
    selector: 'app-upload-rnai-primary-from-google-sheets',
    templateUrl: './upload-rnai-primary-from-google-sheets.component.html',
    styleUrls: ['./upload-rnai-primary-from-google-sheets.component.css']
})
export class UploadRnaiPrimaryFromGoogleSheetsComponent implements OnInit {

    // public spreadsheetId = '1ZctLTu9Bc8RrT-Q2mdPd30urFqhMoNRi1gLP2BxjhXw';
    public spreadsheetId = null;
    public parseSheetsheetAPIError = null;
    public parseSheetsheetDataEntryError = null;
    public batchHasErrors = false;
    public parsedBatchData: { batches, errors, hasErrors, expWorkflows, foundWorkflows } = null;
    public rowsWithErrors = [];
    public spreadsheetUrl: string = null;

    constructor(private expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi, private spinner: NgxSpinnerService) {
    }

    ngOnInit() {
    }

    onSubmit() {
        this.parsedBatchData = null;
        this.getSpreadSheetIdFromUrl();
        this.getParsedSpreadsheetResults();
    }

    getSpreadSheetIdFromUrl() {
        this.spreadsheetId = this.spreadsheetUrl.split('/')[5];
    }

    /**
     * This calls the 'uploadFromGoogleSpreadSheet' API
     * which parses the google spreadsheet,
     * makes an attempt at error checking
     * and then returns a parsed data object
     * parsedBatchData:
     * batches - parsed spreadsheet data from google sheets
     * errors - a object with error types and true / false indicators
     * hasErrors - top level key to describe if there were ANY errors with the batch
     * expWorkflows - if the parser is happy it spits back some expWorkflows
     *
     */
    public getParsedSpreadsheetResults() {
        this.spinner.show();
        this.parseSheetsheetAPIError = null;
        this.batchHasErrors = false;
        this.parseSheetsheetDataEntryError = false;

        // let spreadsheetId = '1ZctLTu9Bc8RrT-Q2mdPd30urFqhMoNRi1gLP2BxjhXw';
        // let spreadsheetId = '1cAvER7aXYuwIVX-DHR1NWX2YaiKRZCDtru-sd8HSuVc';
        this.expScreenUploadWorkflowApi
            .uploadFromGoogleSpreadSheet(this.spreadsheetId)
            .subscribe((results) => {
                this.parsedBatchData = get(results, 'batchObj');
                this.parseSpreadSheetErrorChecking(results);
                this.spinner.hide();
            }, (error) => {
                this.parseSheetsheetAPIError = error;
                this.spinner.hide();
            });
    }

    /**
     * Check the parsed results for errors to then display to the user
     * @param results
     */
    public parseSpreadSheetErrorChecking(results) {
        if (!get(results, ['batchObj', 'batches'])) {
            this.parseSheetsheetAPIError(`There was an error parsing the data.`);
            //This could also potentially mean thtat there was an error in the data entry itself
            this.parseSheetsheetDataEntryError = true;
        } else if (get(results, ['batchObj', 'hasErrors']) &&
            isEqual(get(results, ['batchObj', 'hasErrors']), true)) {
            this.parseSheetsheetDataEntryError = true;
            this.getRowsWithErrors(results);
        } else {
            this.parseSheetsheetDataEntryError = false;
        }
    }

    /**
     * Each row has an attached 'error' array on it, which is just a list of errors encountered in that row
     * Potential error types:
     * ScreenMoniker (using mip_1E instead of mips_1E)
     * Date errors - mistyping dates, not using valid dates, having other junk in that date field
     * Temperature errors - not having the temperature
     * CtrlBatch error - A user can only use a control batch that was previously defined
     * So if the BatchIds are M1,M2,M3 the control batch can't be M4
     * @param results
     */
    public getRowsWithErrors(results) {
        if (get(results, ['batchObj', 'batches']) && isObject(get(results, ['batchObj', 'batches']))) {
            Object.keys(get(results, ['batchObj', 'batches'])).map((batchKey) => {
                const batch: Array<any> = get(results, ['batchObj', 'batches', batchKey]);
                batch.map((batchRow: any) => {
                    if (get(batchRow, 'errors') && isArray(batchRow['errors'])) {
                        if (batchRow['errors'].length >= 1) {
                            this.rowsWithErrors.push(batchRow);
                        }
                    }
                });
            })
        }
    }

}
