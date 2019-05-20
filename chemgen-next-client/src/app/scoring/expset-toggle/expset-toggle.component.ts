import {Component, OnInit, Input, Renderer2, Output, OnChanges} from '@angular/core';
import {ExpManualScoresApi} from "../../../types/sdk/services/custom";
import {ExpManualScoreCodeResultSet, ExpScreenUploadWorkflowResultSet, ExpScreenResultSet, ExpManualScoresResultSet} from "../../../types/sdk/models";
import {get, has, find, isEqual} from 'lodash';

@Component({
    selector: 'app-expset-toggle',
    templateUrl: './expset-toggle.component.html',
    styleUrls: ['./expset-toggle.component.css']
})
export class ExpsetToggleComponent implements OnInit, OnChanges {
    @Input() expScreen: ExpScreenResultSet;
    @Input() expWorkflow: ExpScreenUploadWorkflowResultSet;
    @Input() treatmentGroupId: number;
    @Input() assayId: any = null;
    @Input() contactSheetResults: any = {interesting: {}};
    @Input() expManualScores: ExpManualScoresResultSet[] = [];
    //For the contact sheet we want to submit all as one batch as opposed to in real time
    @Input() submit: boolean = true;
    @Input() displayToggle: boolean = true;
    public error: any;
    public userName: string;
    public userId: string | number;
    public returnedResults: any = {};

    constructor(private expManualScoresApi: ExpManualScoresApi, private renderer: Renderer2) {
        const userName = document.getElementById('userName');
        const userId = document.getElementById('userId');
        if (userName) {
            this.userName = userName.innerText || 'dummyUser';
        }
        if (userId) {
            this.userId = userId.innerText || 0;
        }
        this.submit = true;
        this.returnedResults = {};
    }

    ngOnChanges() {
        setTimeout(() => {
            this.getManualScores();
        });
    }

    ngOnInit() {
        //Witnout the setTimeoutet function, this gets some weird error
        setTimeout(() => {
            this.getManualScores();
        });
    }


    setManualScores() {
        if (this.submit) {
            let manualScoreValue = 0;
            if (this.contactSheetResults.interesting[this.treatmentGroupId]) {
                manualScoreValue = 1;
            }
            let score = {
                'manualscoreGroup': 'FIRST_PASS',
                'manualscoreCode': 'FIRST_PASS_INTERESTING',
                'manualscoreValue': manualScoreValue,
                'screenId': this.expScreen.screenId,
                'screenName': this.expScreen.screenName,
                'assayId': this.assayId,
                'treatmentGroupId': this.treatmentGroupId,
                'scoreCodeId': 66,
                'userId': this.userId,
                'userName': this.userName,
                'expWorkflowId': String(this.expWorkflow.id),
            };
            this.submitScores([score]);
        }
    }

    submitScores(manualScores) {
        this.expManualScoresApi
            .submitScores(manualScores)
            .subscribe(() => {

            }, (error) => {
                this.error(error);
            })
    }

    getManualScores() {
        const filterExpManualScores = function (results) {
            if (find(results, (result) => {
                return isEqual(result.manualscoreGroup, 'FIRST_PASS') && isEqual(result.manualscoreValue, 1);
            })) {
                return true;
            } else {
                return false;
            }
        };
        if (!has(this.contactSheetResults.interesting, this.treatmentGroupId)) {
            this.contactSheetResults.interesting[this.treatmentGroupId] = false;
        }

        //Need to make sure this is bound to the contact sheet
        let alreadySet = false;
        if (get(this.contactSheetResults.interesting, this.treatmentGroupId)) {
            alreadySet = true;
        } else if (this.expManualScores && this.expManualScores.length) {
            this.contactSheetResults.interesting[this.treatmentGroupId] = filterExpManualScores(this.expManualScores)
        } else {
            let where: any = {and: [{'manualscoreGroup': 'FIRST_PASS'}]};
            if (this.assayId) {
                where.and.push({assayId: this.assayId});
            } else if (this.treatmentGroupId) {
                where.and.push({treatmentGroupId: this.treatmentGroupId});
            } else {
                this.error = "No Treatment Group or Assay Id specified!";
            }
            this.expManualScoresApi
                .find({
                    where: where
                })
                .subscribe((results: ExpManualScoresResultSet[]) => {
                    this.expManualScores = results;
                    this.contactSheetResults.interesting[this.treatmentGroupId] = filterExpManualScores(results);
                }, (error) => {
                    this.error(error.toString());
                })
        }
    }

}
