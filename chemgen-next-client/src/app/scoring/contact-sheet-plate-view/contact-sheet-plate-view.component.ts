import {Component, EventEmitter, Input, OnInit, Output, Renderer2} from '@angular/core';
import {ExpManualScoresApi, ExpSetApi} from "../../../types/sdk/services/custom";
import {Lightbox} from 'angular2-lightbox';
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
    trim,
    remove,
    chunk,
} from 'lodash';
import {ExpManualScoresResultSet, ExpPlateResultSet} from "../../../types/sdk/models";
import {ExpSetSearchResults, ExpsetModule} from "../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";
import {ContactSheetFormResults, ContactSheetUIOptions} from "../contact-sheet/contact-sheet.module";
import {HotkeysService, Hotkey} from "angular2-hotkeys";

/**
 * TODO There should be a scoring module
 * THere is a lot of copy/paste from the other contact sheet
 */

@Component({
    selector: 'app-contact-sheet-plate-view',
    templateUrl: './contact-sheet-plate-view.component.html',
    styleUrls: ['./contact-sheet-plate-view.component.css'],
})
export class ContactSheetPlateViewComponent implements OnInit {
    @Input() expSets: ExpSetSearchResults;
    @Input() byPlate: Boolean = true;
    @Input() expSetModule: ExpsetModule;
    @Output() expSetsScored = new EventEmitter<boolean>();

    public didScore: boolean;
    public errorMessage: string;
    public contactSheetResults: ContactSheetFormResults;
    //So far these are only applicable to the contact sheet plate view
    public contactSheetUiOptions: ContactSheetUIOptions;
    public userName: string;
    public userId: string | number;
    public plateData: { treatReagentPlate, ctrlReagentPlate, ctrlNullPlate, ctrlStrainPlate };
    public submissionErrors: Array<any> = [];

    constructor(private expSetApi: ExpSetApi,
                private expManualScoresApi: ExpManualScoresApi,
                public _lightbox: Lightbox,
                private renderer: Renderer2,
                private hotkeysService: HotkeysService) {
        this.didScore = false;
        this.errorMessage = '';
        this.contactSheetResults = new ContactSheetFormResults();
        this.contactSheetUiOptions = new ContactSheetUIOptions();
        const userName = document.getElementById('userName');
        const userId = document.getElementById('userId');
        if (userName) {
            this.userName = userName.innerText || 'dummyUser';
            this.userName = trim(this.userName);
        }
        if (userId) {
            this.userId = userId.innerText || 0;
        }
    }

    ngOnInit() {
        this.addContactSheetPlateViewHotkeys();
        this.parseExpSetsToAlbums();
    }

    addContactSheetPlateViewHotkeys() {
        this.hotkeysService.add(new Hotkey('shift+i', (event: KeyboardEvent): boolean => {
            this.submitInteresting();
            return false; // Prevent bubbling
        }, undefined, 'Submit Interesting and clear from the view'));

        this.hotkeysService.add(new Hotkey('shift+a', (event: KeyboardEvent): boolean => {
            this.submitAll();
            return false; // Prevent bubbling
        }, undefined, 'Submit all and get a new batch'));
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
            Promise.all(chunk(manualScores, 20).map((manualScore) => {
                return this.submitScores(manualScore);
            }))
                .then(() => {
                    this.removeInteresting();
                    console.log('submitted scores!');
                })
                .catch((error) => {
                    console.log(error);
                    this.submissionErrors.push(error);
                    // this.errorMessage = 'There was a problem submitting all scores!';
                });
            // this.submitScores(manualScores)
            //     .then(() => {
            //         console.log('submitted the interesting scores!');
            //         this.removeInteresting();
            //     })
            //     .catch((error) => {
            //         this.submissionErrors.push(error);
            //     });
        }
    }

    submitAll() {
        console.log('SUBMITTING');
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
        Promise.all(chunk(manualScores, 20).map((manualScore) => {
            return this.submitScores(manualScore);
        }))
            .then(() => {
                this.didScore = true;
                this.expSetsScored.emit(true);
                console.log('submitted scores!');
            })
            .catch((error) => {
                // this.errorMessage = 'There was a problem submitting all scores!';
                console.error(error);
                this.submissionErrors.push(error);
            });
        // this.submitScores(manualScores)
        //     .then(() => {
        //         console.log('Submitted all the scores!');
        //         this.didScore = true;
        //         this.expSetsScored.emit(true);
        //     })
        //     .catch((error) => {
        //         this.submissionErrors.push(error);
        //     });
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
        console.log('In submitScores');
        return new Promise((resolve, reject) => {
            this.expManualScoresApi
                .submitScores(manualScores)
                .toPromise()
                .then(() => {
                    console.log('Submitted scores!');
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
        this.addBarcodeToExpGroupTypeAlbums();
    }

    /**
     * For the sake of super duper nice confirmation messages, add the about the exact plate we are scoring
     */
    addBarcodeToExpGroupTypeAlbums() {
        this.plateData = {
            treatReagentPlate: null,
            ctrlReagentPlate: null,
            ctrlNullPlate: null,
            ctrlStrainPlate: null
        };
        ['treatReagent', 'ctrlReagent', 'ctrlNull', 'ctrlStrain'].map((expGroupType: string) => {
            let plateId = this.expSets.expGroupTypeAlbums[expGroupType][0].plateId;
            if (plateId) {
                //@ts-ignore
                let expPlate: ExpPlateResultSet = find(this.expSets.expPlates, {plateId: plateId});
                this.plateData[`${expGroupType}Plate`] = {id: plateId, barcode: expPlate.barcode};
                this.expSets.expGroupTypeAlbums[expGroupType][0].barcode = expPlate.barcode;
            }
        });

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

