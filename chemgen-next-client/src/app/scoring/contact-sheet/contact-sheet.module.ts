import {Renderer2} from '@angular/core';
import {ExpManualScoresApi, ExpSetApi} from "../../../types/sdk/services/custom";
import {ExpsetModule} from "../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";
import {ExpSetSearchResults} from "../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";
import {ExpManualScoresResultSet} from "../../../types/sdk/models";
import {
    compact,
    filter,
    find,
    flatten,
    get,
    isArray,
    isEqual,
    isObject,
    isUndefined,
    maxBy,
    minBy,
    orderBy,
    remove
} from 'lodash';

/**
 * WIP - Much of the functionality from the contact-sheet-plate-view and contact-sheet-replicate-view could be put in here
 */
export class ContactSheetModule {

    public expSets: ExpSetSearchResults;
    public expSetModule: ExpsetModule;
    public didScore: boolean;
    public errorMessage: string;
    public contactSheetResults: ContactSheetFormResults;
    //So far these are only applicable to the contact sheet plate view
    public contactSheetUiOptions: ContactSheetUIOptions;
    public userName: string;
    public userId: string | number;

    //TODO Not sure how to deal with the event emitters
    // public expSetsScored = new EventEmitter<boolean>();

    constructor(private expSetApi: ExpSetApi,
                private expManualScoresApi: ExpManualScoresApi,
                private renderer: Renderer2) {
        const userName = document.getElementById('userName');
        const userId = document.getElementById('userId');
        if (userName) {
            this.userName = userName.innerText || 'dummyUser';
        }
        if (userId) {
            this.userId = userId.innerText || 0;
        }
    }

    prepareInterestingManualScores() {
        // DAMN TYPE CASTING
        const interestingTreatmentGroupIds: Array<any> = Object.keys(this.contactSheetResults.interesting).filter((treatmentGroupId: any) => {
            return this.contactSheetResults.interesting[treatmentGroupId];
        });
        let manualScores: ExpManualScoresResultSet[] = interestingTreatmentGroupIds.map((treatmentGroupId: any) => {
            const manualScore: any = this.createManualScore(1, treatmentGroupId);
            return manualScore;
        });
        manualScores = flatten(manualScores);
        manualScores = compact(manualScores);
        return manualScores;
    }

    submitInteresting() {
        let manualScores = this.prepareInterestingManualScores();
        if (isArray(manualScores)) {
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

    prepareAllManualScores() {
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
        return manualScores;
    }

    submitAll() {
        return new Promise((resolve, reject) => {
            let manualScores = this.prepareAllManualScores();
            this.submitScores(manualScores)
                .then(() => {
                    this.didScore = true;
                    resolve();
                    //TODO How to deal with this
                    // this.expSetsScored.emit(true);
                })
                .catch((error) => {
                    console.log(error);
                    this.errorMessage = 'There was a problem submitting all scores!';
                    reject(new Error(error));
                });
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

    removeInteresting() {
        Object.keys(this.contactSheetResults.interesting)
            .filter((treatmentGroupId) => {
                return this.contactSheetResults.interesting[treatmentGroupId];
            })
            .map((treatmentGroupId) => {
                this.removeByTreatmentGroupId(treatmentGroupId);
            });
    }

    removeByTreatmentGroupId(treatmentGroupId) {
        ['treatReagent', 'ctrlReagent'].map((albumName) => {
            remove(this.expSets.expGroupTypeAlbums[albumName], {treatmentGroupId: Number(treatmentGroupId)});
        });
        delete this.contactSheetResults.interesting[treatmentGroupId];
    }
}

export class ContactSheetFormResults {
    interesting: any = {};
}

export class ContactSheetUIOptions {
    public sliderConfig: any = {
        behaviour: 'drag',
        keyboard: true,
        step: 1,
        start: [50, 100],
        connect: true,
        margin: 1,
        range: {
            min: 0,
            max: 100
        },
        pips: {
            mode: 'count',
            density: 2,
            values: 6,
            stepped: true
        }
    };
    public sliderRangeValues: any = [50, 100];

    public phenotype = 'none';
    public sortOrder = 'desc';
    public displayCounts = false;

    //TODO Create UI Options class
    public filterPhenotypeOptions = [
        {
            code: 'none',
            display: 'None',
            displaySlider: false,
        },
        {
            code: 'percEmbLeth',
            display: '% Embryonic Lethality',
            displaySlider: true,
        },
        {
            code: 'percSter',
            display: '% Sterility',
            displaySlider: true,
        },
        {
            code: 'broodSize',
            display: 'Brood Size',
            displaySlider: true,
        },
        {
            code: 'wormCount',
            display: 'Worm Count',
            displaySlider: true,
        },
        {
            code: 'larvaCount',
            display: 'Larva Count',
            displaySlider: true,
        },
        {
            code: 'eggCount',
            display: 'Egg Count',
            displaySlider: true,
        },
        {
            code: 'treatmentGroupId',
            display: 'Exp Set',
            displaySlider: false,
        },
        {
            code: 'plateId',
            display: 'Plate ID',
            displaySlider: false,
        }
    ];
    phenoTypeUiOptions: any = {code: 'none', display: 'None', displaySlider: false};

}