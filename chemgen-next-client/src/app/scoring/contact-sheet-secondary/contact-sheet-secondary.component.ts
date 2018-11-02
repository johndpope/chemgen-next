import {Component, OnInit, Renderer2} from '@angular/core';
import {SearchFormViewOptionsResults} from "../../search-forms/search-form-view-options/search-form-view-options.component";
import {SearchFormExpScreenFormResults} from "../../search-forms/search-form-exp-screen/search-form-exp-screen.component";
import {SearchFormRnaiFormResults} from "../../search-forms/search-form-rnai/search-form-rnai.component";
import {ExpManualScoresApi, ExpSetApi} from "../../../types/sdk/services/custom";
import {NgxSpinnerService} from "ngx-spinner";
import {ExpSetSearchResults, ExpSetSearch} from "../../../types/custom/ExpSetTypes";
import {ExpsetModule} from "../expset/expset.module";
import {Lightbox} from "angular2-lightbox";
import {ContactSheetFormResults} from "../contact-sheet-primary/contact-sheet-primary.component";
import {flatten, get, find, compact, isArray, remove, isUndefined, filter} from 'lodash';
import {ExpManualScoresResultSet} from "../../../types/sdk/models";


@Component({
    // selector: 'app-contact-sheet-by-expset',
    templateUrl: './contact-sheet-secondary.component.html',
    styleUrls: ['./contact-sheet-secondary.component.css']
})
export class ContactSheetSecondaryComponent implements OnInit {

    searchFormExpScreenResults: SearchFormExpScreenFormResults = new SearchFormExpScreenFormResults();
    searchFormRnaiFormResults: SearchFormRnaiFormResults = new SearchFormRnaiFormResults();
    expSetSearch: ExpSetSearch = new ExpSetSearch();

    public expSets: ExpSetSearchResults = null;
    public expSetsModule: ExpsetModule;
    public formSubmitted: boolean = false;

    public expSetView = true;

    public contactSheetResults: ContactSheetFormResults = new ContactSheetFormResults();
    public didScore: boolean;
    public errorMessage: string;
    public userName: string;
    public userId: string | number;

    constructor(private expSetApi: ExpSetApi,
                private expManualScoresApi: ExpManualScoresApi,
                private spinner: NgxSpinnerService,
                private renderer: Renderer2,
                public _lightbox: Lightbox) {
        this.expSetSearch.currentPage = 1;
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
    }

    getNewExpSets() {
        // this.showProgress = false;
        this.onSubmit();
    }

    onSubmit() {
        this.formSubmitted = false;
        this.expSets = null;
        this.expSetSearch.pageSize = 1;
        this.expSetSearch.ctrlLimit = 20;
        if (this.searchFormExpScreenResults.expScreen) {
            this.expSetSearch.screenSearch = [this.searchFormExpScreenResults.expScreen.screenId];
        }

        if (this.searchFormExpScreenResults.expScreenWorkflow) {
            this.expSetSearch.expWorkflowSearch = [this.searchFormExpScreenResults.expScreenWorkflow.id];
        }

        this.spinner.show();
        this.expSetApi.getUnScoredExpSetsByPlate(this.expSetSearch)
            .toPromise()
            .then((results) => {
                this.formSubmitted = true;
                console.log('got contactSheetResults');
                this.spinner.hide();
                this.expSets = results.results;
                this.expSetsModule = new ExpsetModule(this.expSets);
                this.expSetsModule.deNormalizeExpSets();
                this.initializeInteresting();
            })
            .catch((error) => {
                this.spinner.hide();
                console.log(error);
                return new Error(error);
            });

    }

    open(album, index: number): void {
        // open lightbox
        this._lightbox.open(album, index);
    }

    initializeInteresting() {
        ['treatReagent', 'ctrlReagent', 'ctrlNull', 'ctrlStrain'].map((expGroupType) => {
            if (get(this.expSets, 'expGroupTypeAlbums') && get(this.expSets.expGroupTypeAlbums, expGroupType)) {
                this.expSets.expGroupTypeAlbums[expGroupType].map((imageMeta: any) => {
                    if (imageMeta.treatmentGroupId) {
                        this.contactSheetResults.interesting[imageMeta.treatmentGroupId] = false;
                    }
                });
            }
        });
    }

    submitInteresting() {
        // DAMN TYPE CASTING
        const interestingTreatmentGroupIds: Array<any> = Object.keys(this.contactSheetResults.interesting).filter((treatmentGroupId: any) => {
            return this.contactSheetResults.interesting[treatmentGroupId];
        });
        let manualScores: ExpManualScoresResultSet[] = interestingTreatmentGroupIds.map((treatmentGroupId: any) => {
            const manualScore: any = this.createManualScore(1, treatmentGroupId);
            return manualScore;
        });
        if (!isUndefined(manualScores) && isArray(manualScores)) {
            manualScores = flatten(manualScores);
            manualScores = compact(manualScores);
            this.submitScores(manualScores)
                .then(() => {
                    this.removeInteresting();
                })
                .catch((error) => {
                    console.log(error);
                    this.errorMessage = 'There was an error submitting interesting scores!';
                });
        }
    }

    reset() {
        Object.keys(this.contactSheetResults.interesting).map((treatmentGroupId) => {
            this.contactSheetResults.interesting[treatmentGroupId] = false;
        });
    }

    removeByTreatmentGroupId(treatmentGroupId) {
        ['treatReagent', 'ctrlReagent'].map((albumName) => {
            remove(this.expSets.expGroupTypeAlbums[albumName], {treatmentGroupId: Number(treatmentGroupId)});
        });
        delete this.contactSheetResults.interesting[treatmentGroupId];
    }

    removeInteresting() {
        Object.keys(this.contactSheetResults.interesting)
            .filter((treatmentGroupId) => {
                return this.contactSheetResults.interesting[treatmentGroupId];
            })
            .map((treatmentGroupId) => {
                this.removeByTreatmentGroupId(treatmentGroupId);
            });
    }

    submitAll() {
        let manualScores: ExpManualScoresResultSet[] = Object.keys(this.contactSheetResults.interesting).map((treatmentGroupId) => {
            let manualScoreValue = 0;
            if (this.contactSheetResults.interesting[treatmentGroupId]) {
                manualScoreValue = 1;
            }
            const manualScore: any = this.createManualScore(manualScoreValue, Number(treatmentGroupId));
            return manualScore;
        });
        manualScores = flatten(manualScores);
        manualScores = compact(manualScores);
        this.submitScores(manualScores)
            .then(() => {
                this.didScore = true;
                // this.expSetsScored.emit(true);
                this.onSubmit();
            })
            .catch((error) => {
                console.log(error);
                this.errorMessage = 'There was a problem submitting all scores!';
            });
    }

    createManualScore(manualScoreValue: number, treatmentGroupId: number) {
        const expAssay: Array<any> = filter(this.expSets.expGroupTypeAlbums.treatReagent, {treatmentGroupId: Number(treatmentGroupId)});
        if (isArray(expAssay) && expAssay.length) {
            const expScreen: any = find(this.expSets.expScreens, {screenId: Number(expAssay[0].screenId)});
            return expAssay.map((imageMeta: any) => {
                return {
                    'manualscoreGroup': 'FIRST_PASS',
                    'manualscoreCode': 'FIRST_PASS_INTERESTING',
                    'manualscoreValue': manualScoreValue,
                    'screenId': expScreen.screenId,
                    'screenName': expScreen.screenName,
                    'assayId': imageMeta.assayId,
                    'treatmentGroupId': treatmentGroupId,
                    'scoreCodeId': 66,
                    'userId': this.userId,
                    'userName': this.userName,
                    'expWorkflowId': String(imageMeta.expWorkflowId),
                };
            })
        } else {
            return null;
        }
    }

    //TODO Refactor scoring into a module
    submitScores(manualScores) {
        return new Promise((resolve, reject) => {
            this.expManualScoresApi
                .submitScores(manualScores)
                .toPromise()
                .then((results) => {
                    resolve();
                })
                .catch((error) => {
                    console.log(error);
                    reject(new Error(error));
                });
        });
    }

}
