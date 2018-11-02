import {
    Component,
    Input,
    OnInit,
    Output,
    EventEmitter,
    Renderer2
} from '@angular/core';
import {ExpSetApi} from '../../../types/sdk/services/custom';
import {Lightbox} from 'angular2-lightbox';
import {NouisliderModule} from 'ng2-nouislider';
import {
    compact,
    remove,
    flatten,
    isArray,
    filter,
    isObject,
    isUndefined,
    isEqual,
    find,
    orderBy,
    minBy,
    maxBy,
    get
} from 'lodash';
import {interpolateYlOrBr, interpolateViridis} from 'd3';
import {
    ExpManualScoresResultSet
} from '../../../types/sdk/models';
import {ExpManualScoresApi} from '../../../types/sdk/services/custom';
import {ExpsetModule} from '../expset/expset.module';
import {ExpSetSearchResults, ExpSetSearch} from "../../../types/custom/ExpSetTypes";

@Component({
    selector: 'app-contact-sheet',
    templateUrl: './contact-sheet-primary.component.html',
    styleUrls: ['./contact-sheet-primary.component.css'],
})
export class ContactSheetPrimaryComponent implements OnInit {
    @Input() expSets: ExpSetSearchResults;
    @Input() byPlate: Boolean = true;
    @Output() expSetsScored = new EventEmitter<boolean>();

    public expSetModule: ExpsetModule;
    public didScore: boolean;
    public errorMessage: string;
    public contactSheetResults: ContactSheetFormResults;
    public contactSheetUiOptions: ContactSheetUIOptions;
    public userName: string;
    public userId: string | number;

    constructor(private expSetApi: ExpSetApi,
                private expManualScoresApi: ExpManualScoresApi,
                public _lightbox: Lightbox,
                private renderer: Renderer2) {
        this.didScore = false;
        this.errorMessage = '';
        this.contactSheetResults = new ContactSheetFormResults();
        this.contactSheetUiOptions = new ContactSheetUIOptions();
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
        this.parseExpSetsToAlbums();
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
                this.expSetsScored.emit(true);
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

    sliderChanged() {
        const seenTreatmentGroup = {};
        ['treatReagent', 'ctrlReagent'].map((albumName) => {
            this.expSets.expGroupTypeAlbums[albumName].map((imageMeta: any) => {
                if (!get(seenTreatmentGroup, imageMeta.treatmentGroupId)) {
                    if (Number(imageMeta[this.contactSheetUiOptions.phenotype]) >= this.contactSheetUiOptions.sliderRangeValues[0]
                        && Number(imageMeta[this.contactSheetUiOptions.phenotype]) <= this.contactSheetUiOptions.sliderRangeValues[1]) {
                        this.contactSheetResults.interesting[imageMeta.treatmentGroupId] = true;
                        seenTreatmentGroup[imageMeta.treatmentGroupId] = true;
                    } else {
                        this.contactSheetResults.interesting[imageMeta.treatmentGroupId] = false;
                    }
                }
            });
        });
    }

    phenotypeChanged() {
        this.contactSheetUiOptions.phenoTypeUiOptions = find(this.contactSheetUiOptions.filterPhenotypeOptions, {'code': this.contactSheetUiOptions.phenotype});
        if (isEqual(this.contactSheetUiOptions.phenoTypeUiOptions.displaySlider, false)) {
            ['treatReagent', 'ctrlReagent'].map((albumName) => {
                if (get(this.expSets, 'expGroupTypeAlbums') && get(this.expSets.expGroupTypeAlbums, albumName)) {
                    this.expSets.expGroupTypeAlbums[albumName] = orderBy(this.expSets.expGroupTypeAlbums[albumName], ['plateId', 'imagePath'], ['asc', 'asc']);
                }
            });
        } else {
            if (get(this.expSets, 'expGroupTypeAlbums') && get(this.expSets.expGroupTypeAlbums, 'treatReagent') && get(this.expSets.expGroupTypeAlbums, 'ctrlReagent')) {
                let minTreat = 0;
                let maxTreat = 100;
                let minCtrl = 0;
                let maxCtrl = 0;
                const tmaxTreat = maxBy(this.expSets.expGroupTypeAlbums.treatReagent, this.contactSheetUiOptions.phenotype);
                if (isObject(maxTreat) && get(maxTreat, this.contactSheetUiOptions.phenotype)) {
                    maxTreat = tmaxTreat[this.contactSheetUiOptions.phenotype];
                }
                const tminTreat = minBy(this.expSets.expGroupTypeAlbums.treatReagent, this.contactSheetUiOptions.phenotype);
                if (isObject(minTreat) && get(minTreat, this.contactSheetUiOptions.phenotype)) {
                    minTreat = tminTreat[this.contactSheetUiOptions.phenotype];
                }
                const tminCtrl = minBy(this.expSets.expGroupTypeAlbums.ctrlReagent, this.contactSheetUiOptions.phenotype);
                if (isObject(minCtrl) && get(minCtrl, this.contactSheetUiOptions.phenotype)) {
                    minCtrl = tminCtrl[this.contactSheetUiOptions.phenotype];
                }
                const tmaxCtrl = maxBy(this.expSets.expGroupTypeAlbums.ctrlReagent, this.contactSheetUiOptions.phenotype);
                if (isObject(maxCtrl) && get(maxCtrl, this.contactSheetUiOptions.phenotype)) {
                    maxCtrl = tmaxCtrl[this.contactSheetUiOptions.phenotype];
                }

                this.contactSheetUiOptions.sliderConfig.range.min = Math.min(minTreat, minCtrl) - 1;
                this.contactSheetUiOptions.sliderConfig.range.max = Math.max(maxCtrl, maxTreat) + 1;

                this.contactSheetUiOptions.sliderConfig.start[0] = this.contactSheetUiOptions.sliderConfig.range.min;
                this.contactSheetUiOptions.sliderConfig.start[1] = this.contactSheetUiOptions.sliderConfig.range.max;
            }
            ['treatReagent', 'ctrlReagent'].map((albumName) => {
                if (get(this.expSets, 'expGroupTypeAlbums') && get(this.expSets.expGroupTypeAlbums, albumName)) {
                    this.expSets.expGroupTypeAlbums[albumName] = orderBy(this.expSets.expGroupTypeAlbums[albumName], this.contactSheetUiOptions.phenotype, this.contactSheetUiOptions.sortOrder);
                }
            });
        }
    }

    //TODO Moving most of this code to the server side

    parseExpSetsToAlbums() {
        this.expSetModule = new ExpsetModule(this.expSets);
        ['treatReagent', 'ctrlReagent', 'ctrlNull', 'ctrlStrain'].map((expGroupType) => {
            if (get(this.expSets, 'expGroupTypeAlbums') && get(this.expSets.expGroupTypeAlbums, expGroupType)) {
                this.expSets.expGroupTypeAlbums[expGroupType].map((imageMeta: any) => {
                    if (imageMeta.treatmentGroupId) {
                        this.contactSheetResults.interesting[imageMeta.treatmentGroupId] = false;
                    }
                });
            }
        });
        ['treatReagent', 'ctrlReagent'].map((expGroupType) => {
            if (get(this.expSets, 'expGroupTypeAlbums') && get(this.expSets.expGroupTypeAlbums, expGroupType)) {
                this.expSets.expGroupTypeAlbums[expGroupType].map((album: any) => {
                    album.expSet = this.expSetModule.getExpSet(album) || {};
                });
            }
        });
        this.phenotypeChanged();
    }

    reset() {
        Object.keys(this.contactSheetResults.interesting).map((treatmentGroupId) => {
            this.contactSheetResults.interesting[treatmentGroupId] = false;
        });
    }

    parseInterestingToAlbumListener($event: string) {

    }

    getExpSetsListener($event: any) {

    }
}

export class ContactSheetFormResults {
    interesting: any = {};
}

class ContactSheetUIOptions {
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
