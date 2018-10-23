import {Component, OnInit, Output, Input, EventEmitter} from '@angular/core';
import {has, get, find, isArray} from 'lodash';
import {ExpManualScoreCodeResultSet, ExpManualScoresResultSet} from "../../../types/sdk/models";
import {ExpsetModule} from "../expset/expset.module";
import {Lightbox} from "angular2-lightbox";
import {isEqual, isEmpty} from 'lodash';
import {ExpManualScoresApi} from "../../../types/sdk/services/custom";
import {HotkeysService, HotkeysDirective, Hotkey} from "angular2-hotkeys";
import {ManualScoresModule} from "../manual-scores/manual-scores.module";

@Component({
    selector: 'app-expset-score-primary',
    templateUrl: './expset-score-primary.component.html',
    styleUrls: ['./expset-score-primary.component.css']
})
export class ExpsetScorePrimaryComponent implements OnInit {
    @Input('expSet') expSet: any;
    @Input('expSetModule') expSetModule: ExpsetModule;
    @Input('score') score: boolean;
    @Input('contactSheetResults') contactSheetResults: any = {interesting: {}};
    @Output() getMoreExpSets = new EventEmitter<boolean>();
    expSetPrimaryScoreFormResults: ExpSetPrimaryScoreFormResults;
    public userName: string;
    public userId: number;
    public error: any = null;

    constructor(public _lightbox: Lightbox, private expManualScoresApi: ExpManualScoresApi, private hotkeysService: HotkeysService) {
        //TODO Put this in a module somewhere
        const userName = document.getElementById('userName');
        const userId = document.getElementById('userId');
        if (userName) {
            this.userName = userName.innerText || 'dummyUser';
        }
        if (userId) {
            this.userId = Number(userId.innerText) || 0;
        }
        this.expSetPrimaryScoreFormResults = new ExpSetPrimaryScoreFormResults(this.hotkeysService, this.expManualScoresApi);

        this.hotkeysService.add(new Hotkey('shift+s', (event: KeyboardEvent): boolean => {
            this.checkSubmission();
            return false;
        }, undefined, 'Submit the form'))
    }

    ngOnInit() {
    }

    checkSubmission(){
        this.expSetPrimaryScoreFormResults.checkEmbSteOne();
        if(!this.expSetPrimaryScoreFormResults.mEmbErrorMessage && !this.expSetPrimaryScoreFormResults.wtEmbErrorMessage && !this.expSetPrimaryScoreFormResults.mSteErrorMessage){
            this.onSubmit();
        }
    }

    onSubmit() {
        this.expSetPrimaryScoreFormResults.submitted = true;
        const submitThese = Object.keys(this.expSetPrimaryScoreFormResults.scores).map((key) => {
            if (!has(this.expSetPrimaryScoreFormResults.scores, key)) {
                throw new Error(`Score key ${key} does not exist in manual scores table!!!`);
            }
            const value = find(this.expSetPrimaryScoreFormResults.manualScores, {formCode: key});
            if (!value) {
                throw new Error('Could not find score with code!');
            }
            //@ts-ignore
            const submitThis: ExpManualScoresResultSet = new ExpManualScoresResultSet({
                manualscoreCode: value.formCode,
                //@ts-ignore
                manualscoreGroup: value.manualGroup,
                manualscoreValue: 0,
                //@ts-ignore
                scoreCodeId: Number(value.manualscorecodeId),
                screenId: this.expSet.expScreen.screenId,
                screenName: this.expSet.expScreen.screenName,
                treatmentGroupId: this.expSet.albums.treatmentGroupId,
                userId: this.userId,
                userName: this.userName,
                expWorkflowId: String(this.expSet.expWorkflow.id),
                timestamp: new Date(Date.now()),
            });
            if (get(this.expSetPrimaryScoreFormResults.scores, key)) {
                //@ts-ignore
                submitThis.manualscoreValue = value.manualValue;
                return submitThis;
            } else {
                return submitThis;
            }
        });
        //This is just to make things consistent
        //Everything that has a 'real' score will also have a first_pass score 1
        let firstPassScore = new ExpManualScoresResultSet({
            'manualscoreGroup': 'FIRST_PASS',
            'manualscoreCode': 'FIRST_PASS_INTERESTING',
            'manualscoreValue': 1,
            'screenId': this.expSet.expScreen.screenId,
            'screenName': this.expSet.expScreen.screenName,
            'treatmentGroupId': this.expSet.albums.treatmentGroupId,
            'scoreCodeId': 66,
            'userId': this.userId,
            'userName': this.userName,
            'expWorkflowId': String(this.expSet.expWorkflow.id),
            timestamp: new Date(Date.now()),
        });
        submitThese.push(firstPassScore);
        let hasManualScoreScore = new ExpManualScoresResultSet({
            'manualscoreGroup': 'HAS_MANUAL_SCORE',
            'manualscoreCode': 'HAS_MANUAL_SCORE',
            'manualscoreValue': 1,
            'screenId': this.expSet.expScreen.screenId,
            'screenName': this.expSet.expScreen.screenName,
            'treatmentGroupId': this.expSet.albums.treatmentGroupId,
            'scoreCodeId': 65,
            'userId': this.userId,
            'userName': this.userName,
            'expWorkflowId': String(this.expSet.expWorkflow.id),
            timestamp: new Date(Date.now()),
        });
        submitThese.push(hasManualScoreScore);
        console.log('submitting!');

        this.expManualScoresApi
            .submitScores(submitThese)
            .subscribe(() => {
                this.expSetPrimaryScoreFormResults = new ExpSetPrimaryScoreFormResults(this.hotkeysService, this.expManualScoresApi);
                this.expSetModule.expSetsDeNorm.shift();
                this.checkForEmptyExpSets();
            }, (error) => {
                this.error(error);
            })

    }

    checkForEmptyExpSets() {
        console.log(`ExpSets Len: ${this.expSetModule.expSetsDeNorm.length}`);
        if (isEqual(this.expSetModule.expSetsDeNorm.length, 0)) {
            this.getMoreExpSets.emit(true);
            console.log('get more exp sets!');
        } else if (isEmpty(this.expSetModule.expSetsDeNorm)) {
            this.getMoreExpSets.emit(true);
            console.log('get more exp sets!');
        }
    }

    open(album, index: number): void {
        // open lightbox
        this._lightbox.open(album, index);
    }
}

class ExpSetPrimaryScoreFormResults {
    manualScoresModule: ManualScoresModule = new ManualScoresModule();
    scores: any;
    manualScores: any;

    mEmbErrorMessage;
    mSteErrorMessage;
    wtEmbErrorMessage;
    wtSteErrorMessage;
    saveErrorMessage = null;
    valid: Boolean = true;
    submitted: Boolean = false;

    constructor(private hotkeysService: HotkeysService, private expManualScoresApi: ExpManualScoresApi) {
        this.scores = this.manualScoresModule.scores;
        this.manualScores =this.manualScoresModule.manualScores;
        this.addMutantHotKeys();
        this.hotkeysService.add(new Hotkey('shift+m', (event: KeyboardEvent): boolean => {
            this.addMutantHotKeys();
            return false; // Prevent bubbling
        }, undefined, 'Add hotkeys for scoring the mutant'));
        this.hotkeysService.add(new Hotkey('shift+n', (event: KeyboardEvent): boolean => {
            this.addN2Hotkeys();
            return false; // Prevent bubbling
        }, undefined, 'Add hotkeys for scoring the n2'));

    }

    addN2Hotkeys() {
        this.hotkeysService.add(new Hotkey('0', (event: KeyboardEvent): boolean => {
            this.toggleScore('WT_NO_EFFECT');
            return false; // Prevent bubbling
        }, undefined, 'Toggle N2 No Effect'));
        this.hotkeysService.add(new Hotkey('1', (event: KeyboardEvent): boolean => {
            this.toggleScore('WT_WEAK_EMB');
            this.checkEmbSteOne();
            return false; // Prevent bubbling
        }, undefined, 'Toggle N2 Weak Emb'));
        this.hotkeysService.add(new Hotkey('2', (event: KeyboardEvent): boolean => {
            this.toggleScore('WT_MED_EMB');
            this.checkEmbSteOne();
            return false; // Prevent bubbling
        }, undefined, 'Toggle N2 Medium Emb'));
        this.hotkeysService.add(new Hotkey('3', (event: KeyboardEvent): boolean => {
            this.toggleScore('WT_STRONG_EMB');
            this.checkEmbSteOne();
            return false; // Prevent bubbling
        }, undefined, 'Toggle N2 Strong Emb'));
        this.hotkeysService.add(new Hotkey('4', (event: KeyboardEvent): boolean => {
            this.toggleScore('WT_STE');
            return false; // Prevent bubbling
        }, undefined, 'Toggle N2 Ste'));
        this.hotkeysService.add(new Hotkey('5', (event: KeyboardEvent): boolean => {
            this.toggleScore('WT_LB');
            return false; // Prevent bubbling
        }, undefined, 'Toggle N2 LB'));
        this.hotkeysService.add(new Hotkey('6', (event: KeyboardEvent): boolean => {
            this.toggleScore('WT_LVA');
            return false; // Prevent bubbling
        }, undefined, 'Toggle N2 LVA'));
        this.hotkeysService.add(new Hotkey('7', (event: KeyboardEvent): boolean => {
            this.toggleScore('WT_PE');
            return false; // Prevent bubbling
        }, undefined, 'Toggle N2 PE'));
        this.hotkeysService.add(new Hotkey('8', (event: KeyboardEvent): boolean => {
            this.toggleScore('WT_UF');
            return false; // Prevent bubbling
        }, undefined, 'Toggle N2 Under feeding'));
        this.hotkeysService.add(new Hotkey('9', (event: KeyboardEvent): boolean => {
            this.toggleScore('WT_NB');
            return false; // Prevent bubbling
        }, undefined, 'Toggle N2 No Brood'));
        this.hotkeysService.add(new Hotkey('shift+1', (event: KeyboardEvent): boolean => {
            this.toggleScore('WT_NW');
            return false; // Prevent bubbling
        }, undefined, 'Toggle N2 No Worm'));
        this.hotkeysService.add(new Hotkey('shift+2', (event: KeyboardEvent): boolean => {
            this.toggleScore('WT_CONT');
            return false; // Prevent bubbling
        }, undefined, 'Toggle N2 Contamination'));
        this.hotkeysService.add(new Hotkey('shift+3', (event: KeyboardEvent): boolean => {
            this.toggleScore('WT_PROB');
            return false; // Prevent bubbling
        }, undefined, 'Toggle N2 Problem'));
    }

    addMutantHotKeys() {
        this.hotkeysService.add(new Hotkey('0', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_NO_EFFECT');
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant No Effect'));
        this.hotkeysService.add(new Hotkey('1', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_WEAK_EMB');
            this.checkEmbSteOne();
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant Weak Emb'));
        this.hotkeysService.add(new Hotkey('2', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_MED_EMB');
            this.checkEmbSteOne();
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant Medium Emb'));
        this.hotkeysService.add(new Hotkey('3', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_STRONG_EMB');
            this.checkEmbSteOne();
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant Strong Emb'));
        this.hotkeysService.add(new Hotkey('4', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_WEAK_STE');
            this.checkEmbSteOne();
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant Weak Ste'));
        this.hotkeysService.add(new Hotkey('5', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_MED_STE');
            this.checkEmbSteOne();
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant Medium Ste'));
        this.hotkeysService.add(new Hotkey('6', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_STRONG_STE');
            this.checkEmbSteOne();
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant Strong Ste'));
        this.hotkeysService.add(new Hotkey('7', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_SUP_EMB_ENH');
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant Suppression of Emb in Enh'));
        this.hotkeysService.add(new Hotkey('8', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_SUP_STE_ENH');
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant Suppression of Ste in Enh'));
        this.hotkeysService.add(new Hotkey('9', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_SUP_PE_LVA_ENH');
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant Suppression of PE / LVA in Enh'));
        this.hotkeysService.add(new Hotkey('shift+1', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_ENH_PE_LVA_ENH');
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant Enh of PE / LVA in Enh'));
        this.hotkeysService.add(new Hotkey('shift+2', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_UF');
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant Underfeeding'));
        this.hotkeysService.add(new Hotkey('shift+3', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_NB');
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant No Brood'));
        this.hotkeysService.add(new Hotkey('shift+4', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_NW');
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant No Worm'));
        this.hotkeysService.add(new Hotkey('shift+5', (event: KeyboardEvent): boolean => {
            this.toggleScore('M_CONT');
            return false; // Prevent bubbling
        }, undefined, 'Toggle Mutant Contamination'));

    }

    toggleScore(scoreKey: string) {
        if (!this.scores[scoreKey]) {
            this.scores[scoreKey] = true;
        } else {
            this.scores[scoreKey] = false;
        }
    }

    checkEmbSteOne() {
        this.mSteErrorMessage = null;
        this.mEmbErrorMessage = null;
        this.wtEmbErrorMessage = null;
        this.wtSteErrorMessage = null;
        this.valid = true;

        const mEmb = ['M_WEAK_EMB', 'M_MED_EMB', 'M_STRONG_EMB'].filter((key) => {
            return this.scores[key];
        });
        if (isArray(mEmb) && mEmb.length > 1) {
            this.valid = false;
            this.mEmbErrorMessage = 'You must select one of Mutant Emb \'Weak\', \'Medium\' or \'Strong\'';
        }

        const mSte = ['M_WEAK_STE', 'M_MED_STE', 'M_STRONG_STE'].filter((key) => {
            return this.scores[key];
        });
        if (isArray(mSte) && mSte.length > 1) {
            this.valid = false;
            this.mSteErrorMessage = 'You must select one of Mutant Ste \'Weak\', \'Medium\' or \'Strong\'';
        }

        const wtEmb = ['WT_WEAK_EMB', 'WT_MED_EMB', 'WT_STRONG_EMB'].filter((key) => {
            return this.scores[key];
        });
        if (isArray(wtEmb) && wtEmb.length > 1) {
            this.valid = false;
            this.wtEmbErrorMessage = 'You must select one of N2 Emb \'Weak\', \'Medium\' or \'Strong\'';
        }

        const wtSte = ['WT_WEAK_STE', 'WT_MED_STE', 'WT_STRONG_STE'].filter((key) => {
            return this.scores[key];
        });
        if (isArray(wtSte) && wtSte.length > 1) {
            this.valid = false;
            this.wtSteErrorMessage = 'You must select one of N2 Ste \'Weak\', \'Medium\' or \'Strong\'';
        }
    }

}
