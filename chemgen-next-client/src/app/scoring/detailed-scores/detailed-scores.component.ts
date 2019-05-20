import {Component, OnInit, Input} from '@angular/core';
import {ExpManualScoresApi, ExpSetApi} from "../../../types/sdk/services/custom";
import {ExpManualScoresResultSet} from "../../../types/sdk/models";
import {maxBy, find, uniq, get, groupBy, isEqual} from 'lodash';
import {
    ExpsetModule,
    ExpSetSearch,
    ExpSetSearchResults
} from "../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";

@Component({
    selector: 'app-detailed-scores',
    templateUrl: './detailed-scores.component.html',
    styleUrls: ['./detailed-scores.component.css']
})
export class DetailedScoresComponent implements OnInit {

    //These will all be inputs once I hook up the search form
    @Input() expSets: ExpSetSearchResults = null;
    @Input() expSetModule: ExpsetModule = null;
    @Input() expSetSearch: ExpSetSearch;

    public detailedScores: ExpManualScoresResultSet[] = null;
    public groupedManualScores: any = null;
    // TODO This is a major hack
    // We should pull this in from the score codes table
    public manualScoreCategories: Array<any> = ["M_NO_EFFECT", "M_EMB_LETH", "M_ENH_STE",
        "M_SUP_EMB_ENH", "M_SUP_STE_ENH", "M_SUP_PE_LVA_ENH", "M_ENH_PE_LVA_ENH",
        "M_UF", "M_CONT", "M_NW", "M_NB",
        "WT_NO_EFFECT", "WT_EMB_LETH", "WT_ENH_STE", "WT_UF", "WT_CONT", "WT_NW", "WT_PROB",
        "WT_NB", "WT_LB", "WT_LVA", "WT_STE",
        "WT_PE"];
    public detailedScoreTableData: Array<any> = null;
    //Main PhenoTypes
    public mainPhenoTypeColumnDefs: any = [
        //Data
        {
            headerName: 'Data',
            children: [
                {headerName: 'Timestamp', field: 'timestamp'},
                {headerName: 'User', field: 'userName'},
                {headerName: 'GroupId', field: 'treatmentGroupId'},
            ]
        },
        //Mutant
        {
            headerName: 'Mutant',
            children: [
                {headerName: 'No Effect', field: 'M_NO_EFFECT'},
                {headerName: 'Emb Leth', field: 'M_EMB_LETH'},
                {headerName: 'Enh Ste', field: 'M_ENH_STE'},
            ]
        }, {
            //N2
            headerName: 'N2',
            children: [
                {headerName: 'No Effect', field: 'WT_NO_EFFECT'},
                {headerName: 'Emb Leth', field: 'WT_EMB_LETH'},
                {headerName: 'Enh Ste', field: 'WT_ENH_STE'},
            ]
        }
    ];
    public secondaryPhenoTypeColumnDefs: any = [
        //Data
        {
            headerName: 'Data',
            children: [
                {headerName: 'Timestamp', field: 'timestamp'},
                {headerName: 'User', field: 'userName'},
                {headerName: 'GroupId', field: 'treatmentGroupId'},
            ]
        },
        //Mutant
        {
            headerName: 'Mutant',
            children: [
                {headerName: 'Sup of EmbEnh', field: 'M_SUP_EMB_ENH'},
                {headerName: 'Sup of SteEnh', field: 'M_SUP_STE_ENH'},
                {headerName: 'Sup of PE/LVA Enh', field: 'M_SUP_PE_LVA_ENH'},
                {headerName: 'Enh of PE/LVA in Enh', field: 'M_ENH_PE_LVA_ENH'},
                {headerName: 'Underfeeding', field: 'M_UF'},
                {headerName: 'Contamination', field: 'M_CONT'},
                {headerName: 'No Worm', field: 'M_NW'},
                {headerName: 'No Bacteria', field: 'M_NB'},
            ]
        }, {
            //N2
            headerName: 'N2',
            children: [
                {headerName: 'Underfeeding', field: 'WT_UF'},
                {headerName: 'Contamination', field: 'WT_CONT'},
                {headerName: 'No Worm', field: 'WT_NW'},
                {headerName: 'Problem', field: 'WT_PROB'},
                {headerName: 'No Bacteria', field: 'WT_NB'},
                {headerName: 'Low Brood', field: 'WT_LB'},
                {headerName: 'LVA', field: 'WT_LVA'},
                {headerName: 'STE', field: 'WT_STE'},
                {headerName: 'PE', field: 'WT_PE'},
            ]
        }
    ];
    private gridApi;
    private gridColumnApi;
    private secondaryGridApi;
    private secondaryGridColumnApi;
    public rowSelection: string = "single";

    constructor(private expSetApi: ExpSetApi, private expManualScoresApi: ExpManualScoresApi) {
    }

    ngOnInit() {
        this.getSomeScores();
    }

    // TODO add filter for has_manual_score
    // I think there is one in the codebase somewhere
    getSomeScores() {
        if (this.expSetModule) {
            this.expSetModule.deNormalizeExpSets();
            this.detailedScores = this.expSets.expManualScores;
            this.groupScoresByTreatmentGroupAndDateTime();
        }
        // this.expSetSearch = new ExpSetSearch({expGroupSearch: [4003]});
        // this.expSetApi
        //     .getExpSets(this.expSetSearch)
        //     .subscribe((results) => {
        //         this.expSets = results.results;
        //         this.expSetModule = new ExpsetModule(this.expSets);
        //         this.expSetModule.deNormalizeExpSets();
        //         this.detailedScores = this.expSets.expManualScores;
        //         this.groupScoresByTreatmentGroupAndDateTime();
        //     }, (error) => {
        //         console.log(error);
        //     });
    }

    groupScoresByTreatmentGroupAndDateTime() {
        const results = groupBy(this.detailedScores, 'treatmentGroupId');
        const newResults: any = {};
        Object.keys(results).map((key) => {
            const t = groupBy(results[key], 'timestamp');
            Object.keys(t).map((timestamp) => {
                //Get only scores that are detailed scores - we don't care about first pass here
                if (!find(t[timestamp], {manualscoreGroup: 'HAS_MANUAL_SCORE'})) {
                    delete t[timestamp];
                }
            });
            newResults[key] = t;
        });
        this.groupedManualScores = newResults;
        this.createScoresTable();
    }

    createScoresTable() {
        const tableRows = [];
        Object.keys(this.groupedManualScores).map((treatmentGroupId) => {
            Object.keys(this.groupedManualScores[treatmentGroupId]).map((timestamp) => {
                let tableRow: any = {};
                let thisScoreSet: ExpManualScoresResultSet[] = this.groupedManualScores[treatmentGroupId][timestamp];
                //Go through each of the categories
                //And get the corresponding score for it
                this.manualScoreCategories.map((category: string) => {
                    //These are the scores corresponding to that single category
                    let scores = thisScoreSet.filter((score: ExpManualScoresResultSet) => {
                        return isEqual(score.manualscoreGroup, category);
                    });
                    //Since this is serialized from an html form, each value in the category gets a value
                    if (scores) {
                        let maxScoreCategory = maxBy(scores, 'manualscoreValue');
                        if (maxScoreCategory) {
                            tableRow[category] = maxScoreCategory.manualscoreValue;
                        }
                    }
                });
                //We have this because before the contact sheet we got a bunch of scores that were basically null for everything
                if (Object.keys(tableRow).length) {
                    tableRow['treatmentGroupId'] = thisScoreSet[0].treatmentGroupId;
                    tableRow['timestamp'] = timestamp;
                    tableRow['userName'] = thisScoreSet[0].userName;
                    tableRows.push(tableRow);
                }
            });
        });
        this.detailedScoreTableData = tableRows;
        console.log(tableRows);
    }

    //SOOOOO much copying and pasting

    /**
     * When a user clicks on a row it should put the corresponding expset into view
     * @param $event
     */
    onSelectionChangedPrimary($event) {
        this.onSelectionChanged();
    }

    onSelectionChangedSecondary($event) {
        this.onSelectionChanged();
    }

    onSelectionChanged() {
        console.log('should be changing the view')
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
    //I don't know that sizeToFit and autoSizeAll get used...
    // sizeToFit() {
    //     this.gridApi.sizeColumnsToFit();
    // }
    //
    // autoSizeAll() {
    //     let allColumnIds = [];
    //     this.gridColumnApi.getAllColumns().forEach(function (column) {
    //         allColumnIds.push(column.colId);
    //     });
    //     this.gridColumnApi.autoSizeColumns(allColumnIds);
    // }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridApi.sizeColumnsToFit();
    }

    onSecondaryGridReady(params) {
        this.secondaryGridApi = params.api;
        this.secondaryGridColumnApi = params.columnApi;
        this.secondaryGridApi.sizeColumnsToFit();
    }
}
