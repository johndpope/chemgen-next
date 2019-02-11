import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {NgxSpinnerService} from "ngx-spinner";
import {ExpManualScoresApi, ExpSetApi} from "../../../types/sdk/services/custom";
import {ExpSetSearchResults} from "../../../types/custom/ExpSetTypes";
import {isEqual, orderBy, find} from 'lodash';
import {ExpManualScoresResultSet, ExpPlateResultSet} from "../../../types/sdk/models";
import {Lightbox} from "angular2-lightbox";

const qcScoreCode = {
    "manualscorecodeId": "69",
    "description": "Has the batch passed through a manual QC Stage.",
    "shortDescription": "Batch QC",
    "formName": "BATCH_QC",
    "formCode": "BATCH_QC",
    "manualValue": "1",
    "manualGroup": "BATCH_QC"
};

@Component({
    selector: 'app-exp-workflow-qc',
    templateUrl: './exp-workflow-qc.component.html',
    styleUrls: ['./exp-workflow-qc.component.css']
})
export class ExpWorkflowQcComponent implements OnInit {

    @Input('expSets') expSets: ExpSetSearchResults;
    @Output('expSetsScored') expSetsScored = new EventEmitter<boolean>();
    public platesAlbum: Array<any> = [];
    public qcWellResults: {} = {};
    public qcPlateResults: {} = {};
    public userName: any;
    public userId: any;

    constructor(
        private spinner: NgxSpinnerService,
        private expSetApi: ExpSetApi,
        private expManualScoresApi: ExpManualScoresApi,
        public _lightbox: Lightbox,
    ) {
        const userName = document.getElementById('userName');
        const userId = document.getElementById('userId');
        if (userName) {
            this.userName = userName.innerText || 'dummyUser';
        }
        if (userId) {
            this.userId = userId.innerText || 0;
        }
    }

    ngOnInit() {
        if (this.expSets) {
            this.createPlateAlbums();
        }
    }

    /**
     * Reorder the albums so they are grouped by plate instead of by expSet
     */
    createPlateAlbums() {
        this.expSets.expPlates = orderBy(this.expSets.expPlates, ['barcode'], ['asc']);
        this.platesAlbum = this.expSets.expPlates.map((expPlate: ExpPlateResultSet) => {
            let o = {};
            o['albums'] = [];
            o['plateId'] = expPlate.plateId;
            o['barcode'] = expPlate.barcode;
            return o;
        });

        Object.keys(this.expSets.expGroupTypeAlbums).map((key: string) => {
            this.expSets.expGroupTypeAlbums[key].map((album: { plateId, src, caption, assayId, assayWell, treatmentGroupId }) => {
                let expAssay: any = find(this.expSets.expAssays, {assayId: album.assayId});
                album.assayWell = expAssay.assayWell;
                let plateAlbum = find(this.platesAlbum, {plateId: album.plateId});
                plateAlbum.albums.push(album);
            });
        });
        this.platesAlbum.map((plateAlbum) => {
            plateAlbum.albums = orderBy(plateAlbum.albums, ['assayWell'], ['asc']);
        });
        this.initializeNotJunk();
        console.log('done');
    }

    /**
     * Initially all wells get initialized as 'not junk', since we expect most to not be junk anyways
     */
    initializeNotJunk() {
        this.platesAlbum.map((plateAlbum) => {
            this.qcPlateResults[plateAlbum.plateId] = false;
            plateAlbum.albums.map((album) => {
                this.qcWellResults[album.assayId] = false;
            });
        });
        this.expSets.expManualScores.filter((expManualScore: ExpManualScoresResultSet) => {
            return isEqual(expManualScore.manualscoreGroup, 'JUNK') && isEqual(expManualScore.manualscoreValue, 1);
        }).map((expManualScore: ExpManualScoresResultSet) => {
            this.qcWellResults[expManualScore.assayId] = true;
        });
    }

    toggleQcPlate(plateIndex) {
        let isJunk = false;
        if (this.qcPlateResults[this.platesAlbum[plateIndex].plateId]) {
            isJunk = true;
        }

        this.platesAlbum[plateIndex].albums.map((album) => {
            this.qcWellResults[album.assayId] = isJunk;
        });
    }

    generateQcScores() {

        // Add the initial score indicating the entire batch has been through QC
        let qcScores = [];
        let expScreen : any = find(this.expSets.expScreens, {screenId: Number(this.expSets.expWorkflows[0].screenId)});
        qcScores.push({
            'manualscoreGroup': 'BATCH_QC',
            'manualscoreCode': 'BATCH_QC',
            'manualscoreValue': 1,
            'screenId': this.expSets.expWorkflows[0].screenId,
            'screenName': expScreen.screenName,
            // 'assayId': 0,
            // 'treatmentGroupId': 0,
            'scoreCodeId': 69,
            'userId': this.userId,
            'userName': this.userName,
            'expWorkflowId': String(this.expSets.expWorkflows[0].id),
        });

        Object.keys(this.qcWellResults).map((assayId) => {

            let expAssay2reagent: any = find(this.expSets.expAssay2reagents, {assayId: Number(assayId)});
            let isJunk = 0;
            if (this.qcWellResults[assayId]) {
                isJunk = 1;
            }
            qcScores.push({
                'manualscoreGroup': 'JUNK',
                'manualscoreCode': 'JUNK',
                'manualscoreValue': isJunk,
                'screenId': this.expSets.expWorkflows[0].screenId,
                'screenName': expScreen.screenName,
                'assayId': assayId,
                'treatmentGroupId': expAssay2reagent.treatmentGroupId,
                'scoreCodeId': 68,
                'userId': this.userId,
                'userName': this.userName,
                'expWorkflowId': String(this.expSets.expWorkflows[0].id),
            });
        });

        return qcScores;
    }

    onSubmit() {
        const qcScores = this.generateQcScores();
        this.expManualScoresApi
            .submitScores(qcScores)
            .subscribe((results) => {
                this.expSets = null;
                this.expSetsScored.emit(true);
            }, (error) => {

            });
    }

    open(plateAlbumIndex, imageIndex: number): void {
        this._lightbox.open(this.platesAlbum[0].albums, imageIndex);
    }

}
