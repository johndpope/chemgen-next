import {Component, OnInit, Input, Output, EventEmitter, Renderer2, NgModule, ElementRef} from '@angular/core';
import {SearchFormExpScreenFormResults} from "../../search/search.module";
import {SearchFormRnaiFormResults} from "../../search/search.module";
import {ExpManualScoresApi, ExpSetApi} from "../../../types/sdk/services/custom";
import {NgxSpinnerService} from "ngx-spinner";
import {ExpSetSearchResults, ExpSetSearch} from "../../../types/custom/ExpSetTypes";
import {ExpsetModule} from "../../../types/custom/ExpSetTypes";
import {Lightbox} from "angular2-lightbox";
import {ContactSheetFormResults} from "../contact-sheet/contact-sheet.module";
import {isEqual, flatten, get, find, compact, isArray, remove, isUndefined, filter} from 'lodash';
import {ExpManualScoresResultSet} from "../../../types/sdk/models";
import {HotkeysService, Hotkey} from "angular2-hotkeys";
import {ContactSheetUIOptions} from "../contact-sheet/contact-sheet.module";

// /Users/alan/projects/gunsiano/dockers/chemgen-next/chemgen-next-server/common/types/custom/ExpSetTypes/index.ts

@Component({
    //Don't use selector when using a route
    selector: 'app-contact-sheet-replicate-view',
    templateUrl: './contact-sheet-replicate-view.component.html',
    styleUrls: ['./contact-sheet-replicate-view.component.css']
})

export class ContactSheetReplicateViewComponent implements OnInit {
    @Input() expSets: ExpSetSearchResults;
    @Input() expSetModule: ExpsetModule;
    @Input() byPlate: Boolean = true;
    @Output() expSetsScored = new EventEmitter<boolean>();

    public didScore: boolean;
    public errorMessage: string;
    public contactSheetResults: ContactSheetFormResults;
    //So far these are only applicable to the contact sheet plate view
    public contactSheetUiOptions: ContactSheetUIOptions;
    public userName: string;
    public userId: string | number;

    // expSetModule is the interface to which experiments are queried?
    public expSetsDeNorm: any;
    public currentExpSet: any;
    public currentExpSetIndex = 0;

    public expSetView = true;

    constructor(private expSetApi: ExpSetApi,
                private expManualScoresApi: ExpManualScoresApi,
                private spinner: NgxSpinnerService,
                private renderer: Renderer2,
                public _lightbox: Lightbox,
                public elementRef: ElementRef,
                private hotkeysService: HotkeysService) {
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
        // this.expSetModule = new ExpsetModule(this.expSets);
    }

    ngOnInit() {
        this.addReplicateContactSheetHotkeys();
        this.expSetsDeNorm = this.expSetModule.deNormalizeExpSets();
    }

    addReplicateContactSheetHotkeys() {

        this.hotkeysService.add(new Hotkey('n', (event: KeyboardEvent): boolean => {
            this.currentExpSetIndex = this.currentExpSetIndex + 1;
            if (this.currentExpSetIndex >= this.expSetsDeNorm.length) {
                this.currentExpSetIndex = 0;
            }
            this.currentExpSet = this.expSetsDeNorm[this.currentExpSetIndex];
            this.setFocus();
            return false; // Prevent bubbling
        }, undefined, 'Move to next Experiment Set'));

        this.hotkeysService.add(new Hotkey('i', (event: KeyboardEvent): boolean => {
            if (get(this.contactSheetResults, ['interesting', this.currentExpSet.treatmentGroupId])) {
                this.contactSheetResults.interesting[this.currentExpSet.treatmentGroupId] = false;
            } else {
                this.contactSheetResults.interesting[this.currentExpSet.treatmentGroupId] = true;
            }
            return false; // Prevent bubbling
        }, undefined, 'Toggle Interesting Experiment Set'));

        this.hotkeysService.add(new Hotkey('1', (event: KeyboardEvent): boolean => {
            this.setTabInactive();
            this.setTabActive('ts-reagent-tab');
            return false; // Prevent bubbling
        }, undefined, 'View Treatment + Reagent'));

        this.hotkeysService.add(new Hotkey('2', (event: KeyboardEvent): boolean => {
            this.setTabInactive();
            this.setTabActive('n2-reagent-tab');
            return false; // Prevent bubbling
        }, undefined, 'View N2 + Reagent'));

        this.hotkeysService.add(new Hotkey('3', (event: KeyboardEvent): boolean => {
            this.setTabInactive();
            this.setTabActive('ts-l4440-tab');
            return false; // Prevent bubbling
        }, undefined, 'View Reagent + L4440'));

        this.hotkeysService.add(new Hotkey('4', (event: KeyboardEvent): boolean => {
            this.setTabInactive();
            this.setTabActive('n2-l4440-tab');
            return false; // Prevent bubbling
        }, undefined, 'View N2 + L4440'));

        this.hotkeysService.add(new Hotkey('5', (event: KeyboardEvent): boolean => {
            this.setTabInactive();
            this.setTabActive('reagent-data-tab');
            return false; // Prevent bubbling
        }, undefined, 'View Reagent Data'));

        this.hotkeysService.add(new Hotkey('6', (event: KeyboardEvent): boolean => {
            this.setTabInactive();
            this.setTabActive('plate-data-tab');
            return false; // Prevent bubbling
        }, undefined, 'View Reagent Data'));

        this.hotkeysService.add(new Hotkey('shift+i', (event: KeyboardEvent): boolean => {
            this.submitInteresting();
            this.currentExpSetIndex = 0;
            // this.expSetsDeNorm = this.expSetModule.deNormalizeExpSets();
            this.currentExpSet = this.expSetsDeNorm[0];
            return false; // Prevent bubbling
        }, undefined, 'Submit Interesting and clear from the view'));

        this.hotkeysService.add(new Hotkey('shift+a', (event: KeyboardEvent): boolean => {
            this.submitAll();
            return false; // Prevent bubbling
        }, undefined, 'Submit all and get a new batch'));

        this.hotkeysService.add(new Hotkey('s', (event: KeyboardEvent): boolean => {
            const treatmentGroupId = this.expSetsDeNorm[this.currentExpSetIndex].treatmentGroupId;
            this.submitSingleExpGroup(treatmentGroupId);
            return false; // Prevent bubbling
        }, undefined, 'Submit currently selected well'));
    }

    setTabInactive() {
        [`ts-reagent-tab-li`, `ts-l4440-tab-li`, `n2-reagent-tab-li`, `n2-l4440-tab-li`, `plate-data-tab-li`, `reagent-data-tab-li`].map((id: string) => {
            const elem = document.getElementById(`${id}-${this.expSetsDeNorm[this.currentExpSetIndex].treatmentGroupId}`);
            elem.className = '';
        });
        [`ts-reagent-tab-md`, `ts-l4440-tab-md`, `n2-reagent-tab-md`, `n2-l4440-tab-md`, `plate-data-tab-md`, `reagent-data-tab-md`].map((id: string) => {
            const elem = document.getElementById(`${id}-${this.expSetsDeNorm[this.currentExpSetIndex].treatmentGroupId}`);
            elem.setAttribute("aria-expanded", 'false');
        });
        [`ts-reagent`, `ts-l4440`, `n2-reagent`, `n2-l4440`, `plate-data`, `reagent-data`].map((id: string) => {
            const elem = document.getElementById(`${id}-tab-${this.expSetsDeNorm[this.currentExpSetIndex].treatmentGroupId}`);
            elem.className = 'row tab-pane fade';
        });
    }

    setTabActive(id: string) {
        const elem = document.getElementById(`${id}-li-${this.expSetsDeNorm[this.currentExpSetIndex].treatmentGroupId}`);
        if (elem) {
            elem.className = 'active';
        }
        const tabHref = document.getElementById(`${id}-md-${this.expSetsDeNorm[this.currentExpSetIndex].treatmentGroupId}`);
        tabHref.setAttribute("aria-expanded", 'true');

        const tabPane = document.getElementById(`${id}-${this.expSetsDeNorm[this.currentExpSetIndex].treatmentGroupId}`);
        if (tabPane) {
            tabPane.className = "row tab-pane fade active in";
        } else {
            console.error("Couldn't find tab id!!!");
            console.error(`Tab ID: ${id}-tab-${this.expSetsDeNorm[this.currentExpSetIndex].treatmentGroupId}`);
        }
    }

    getExpSetClass(index: number) {
        if (isEqual(index, this.currentExpSetIndex)) {
            return 'current-well';
        } else {
            return 'well';
        }
    }

    //Set the view focus on the current ExpSet
    //This is only triggered by the hotkey 'n'
    setFocus() {
        setTimeout(() => {
            console.log('should be setting timeout....');
            const expSetId = get(this.expSetsDeNorm[this.currentExpSetIndex], 'treatmentGroupId');
            if (expSetId) {
                const elem = document.getElementById(`expSet-${expSetId}`);
                if (elem) {
                    elem.scrollIntoView();
                }
            } else {
                console.error('ExpSetId does not exist. Cannot scroll into view!!!!');
            }
        }, 100);
    }

    open(album, index: number): void {
        // open lightbox
        this._lightbox.open(album, index);
    }

    initializeInteresting() {
        // Loops over each type of assay ('treatReagent', 'ctrlReagent', 'ctrlNull', 'ctrlStrain')
        // and creates an expSet for each type of treatment?
        this.expSetsDeNorm.map((expSet: any) => {
            this.contactSheetResults.interesting[expSet.treatmentGroupId] = false;
        });
    }

    //TODO Refactor from here on down into contact sheet module
    submitInteresting() {
        // DAMN TYPE CASTING
        // gets an array of treatment group IDs, which I'm assuming are the values denoting the replicate groups
        const interestingTreatmentGroupIds: Array<any> = Object.keys(this.contactSheetResults.interesting).filter((treatmentGroupId: any) => {
            return this.contactSheetResults.interesting[treatmentGroupId];
        });
        // loops throught the interesting treatment group ids and applies the score code to the treatment grou
        // 1 is just a placeholder for now
        let manualScores: ExpManualScoresResultSet[] = interestingTreatmentGroupIds.map((treatmentGroupId: any) => {
            const manualScore: any = this.createManualScore(1, treatmentGroupId);
            return manualScore;
        });

        if (!isUndefined(manualScores) && isArray(manualScores)) {
            // optimizes the array of scores
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

    //Submit a single experiment Group and clear it from the view
    // This is bound to the 'Submit Exp Group' button
    submitSingleExpGroup(treatmentGroupId: number) {
        const manualScore: any = this.createManualScore(this.contactSheetResults.interesting[treatmentGroupId], treatmentGroupId);
        if (manualScore) {
            this.submitScores(manualScore)
                .then(() => {
                    this.removeByTreatmentGroupId(treatmentGroupId);
                })
                .catch((error) => {
                    console.log(error);
                    this.errorMessage = `There was an error expSet ${treatmentGroupId}`;
                });
        }
    }

    reset() {
        Object.keys(this.contactSheetResults.interesting).map((treatmentGroupId) => {
            this.contactSheetResults.interesting[treatmentGroupId] = false;
        });
    }

    removeByTreatmentGroupId(treatmentGroupId) {
        remove(this.expSetsDeNorm, {treatmentGroupId: Number(treatmentGroupId)});
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
        // optimizes the arrays of scores
        manualScores = flatten(manualScores);
        manualScores = compact(manualScores);
        console.log(manualScores);
        this.submitScores(manualScores)
            .then(() => {
                this.didScore = true;
                this.expSetsScored.emit(true);
                // this.onSubmit();
            })
            .catch((error) => {
                console.log(error);
                this.errorMessage = 'There was a problem submitting all scores!';
            });
    }

    createManualScore(manualScoreValue: number, treatmentGroupId: number) {
        const expAssay: Array<any> = filter(this.expSets.expAssay2reagents, {expGroupId: Number(treatmentGroupId)});
        if (isArray(expAssay) && expAssay.length) {
            const expScreen: any = find(this.expSets.expScreens, {screenId: Number(expAssay[0].screenId)});
            return expAssay.map((imageMeta: any) => {
                return {
                    'manualscoreGroup': 'FIRST_PASS',
                    'manualscoreCode': 'FIRST_PASS_INTERESTING',
                    'manualscoreValue': manualScoreValue,
                    'screenId': expScreen.screenId,
                    'screenName': expScreen.screenName,
                    // Since we are choosing the entire expSet, there is no assayId here
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
