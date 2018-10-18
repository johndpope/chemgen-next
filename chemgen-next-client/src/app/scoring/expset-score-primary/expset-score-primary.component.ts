import {Component, OnInit, Output, Input, EventEmitter} from '@angular/core';
import {has, get, find, isArray} from 'lodash';
import {ExpManualScoreCodeResultSet, ExpManualScoresResultSet} from "../../../types/sdk/models";
import {ExpsetModule} from "../expset/expset.module";
import {Lightbox} from "angular2-lightbox";
import {isEqual, isEmpty} from 'lodash';
import {ExpManualScoresApi} from "../../../types/sdk/services/custom";
import {HotkeysService, HotkeysDirective, Hotkey} from "angular2-hotkeys";

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
    scores: any = {
        'M_NO_EFFECT': 0,
        'M_WEAK_EMB': 0,
        'M_WEAK_STE': 0,
        'M_MED_EMB': 0,
        'M_MED_STE': 0,
        'M_STRONG_EMB': 0,
        'M_STRONG_STE': 0,
        'M_SUP_EMB_ENH': 0,
        'M_SUP_STE_ENH': 0,
        'M_SUP_PE_LVA_ENH': 0,
        'M_ENH_PE_LVA_ENH': 0,
        'M_UF': 0,
        'M_CONT': 0,
        'M_NW': 0,
        'M_NB': 0,
        'WT_NO_EFFECT': 0,
        'WT_WEAK_EMB': 0,
        'WT_MED_EMB': 0,
        'WT_STRONG_EMB': 0,
        'WT_UF': 0,
        'WT_CONT': 0,
        'WT_NW': 0,
        'WT_NB': 0,
        'WT_PROB': 0,
        'WT_LB': 0,
        'WT_LVA': 0,
        'WT_PE': 0,
        'WT_STE': 0,
    };
    //TODO This should go in its own module
    //TODO This should be in its own api call
    //@ts-ignore
    manualScores: ExpManualScoreCodeResultSet[] = [
        {
            //@ts-ignore
            "manualscorecodeId": -14,
            "description": "Image problem in the control",
            "shortDescription": "N2 RNAi problem",
            "formName": "WT_PROB",
            "formCode": "WT_PROB",
            "manualValue": "1",
            "manualGroup": "WT_PROB"
        },
        {
            //@ts-ignore
            "manualscorecodeId": -13,
            "description": "Bacterial or fungal contamination in the control",
            "shortDescription": "N2 RNAi contamination",
            "formName": "WT_PROB",
            "formCode": "WT_CONT",
            "manualValue": "1",
            "manualGroup": "WT_CONT"
        },
        {
            //@ts-ignore
            "manualscorecodeId": "-12",
            "description": "No worm in the control",
            "shortDescription": "N2 RNAi NW",
            "formName": "WT_PROB",
            "formCode": "WT_NW",
            "manualValue": "1",
            "manualGroup": "WT_NW"
        },
        {
            //@ts-ignore
            "manualscorecodeId": "-11",
            "description": "No bacteria in the control",
            "shortDescription": "N2 RNAi NB",
            "formName": "WT_PROB",
            "formCode": "WT_NB",
            "manualValue": "1",
            "manualGroup": "WT_NB"
        },
        {
            "manualscorecodeId": "-10",
            "description": "Underfeeding in the control",
            "shortDescription": "N2 RNAi UF",
            "formName": "WT_PROB",
            "formCode": "WT_UF",
            "manualValue": "1",
            "manualGroup": "WT_UF"
        },
        {
            "manualscorecodeId": "-9",
            "description": "Underfeeding in the mutant",
            "shortDescription": "UF",
            "formName": "M_PROB",
            "formCode": "M_UF",
            "manualValue": "1",
            "manualGroup": "M_UF"
        },
        {
            "manualscorecodeId": "-7",
            "description": "Image problem prone to affect DevStaR output mutant",
            "shortDescription": "Image problem",
            "formName": "WT_PROB",
            "formCode": "WT_DEVSTAR_PROB",
            "manualValue": "1",
            "manualGroup": "WT_DEVSTAR_PROB"
        },
        {
            "manualscorecodeId": "-5",
            "description": "Known DevStaR labelling error in the mutant",
            "shortDescription": "IA Error",
            "formName": "WT_PROB",
            "formCode": "WT_DEVSTAR_LABEL",
            "manualValue": "1",
            "manualGroup": "WT_DEVSTAR_LABEL"
        },
        {
            "manualscorecodeId": "-4",
            "description": "Bacterial or fungal contamination in the mutant",
            "shortDescription": "Contamination",
            "formName": "M_PROB",
            "formCode": "M_CONT",
            "manualValue": "1",
            "manualGroup": "M_CONT"
        },
        {
            "manualscorecodeId": "-3",
            "description": "No worms in the mutant",
            "shortDescription": "NW",
            "formName": "M_PROB",
            "formCode": "M_NW",
            "manualValue": "1",
            "manualGroup": "M_NW"
        },
        {
            "manualscorecodeId": "-2",
            "description": "No bacteria in the mutant",
            "shortDescription": "NB",
            "formName": "M_PROB",
            "formCode": "M_NB",
            "manualValue": "1",
            "manualGroup": "M_NB"
        },
        {
            "manualscorecodeId": "1",
            "description": "Weak suppression in the mutant",
            "shortDescription": "Weak SUP",
            "formName": "M_SUP",
            "formCode": "M_WEAK_SUP",
            "manualValue": "1",
            "manualGroup": "M_SUP"
        },
        {
            "manualscorecodeId": "2",
            "description": "Medium suppression in the mutant",
            "shortDescription": "Medium SUP",
            "formName": "M_SUP",
            "formCode": "M_MED_SUP",
            "manualValue": "2",
            "manualGroup": "M_SUP"
        },
        {
            "manualscorecodeId": "3",
            "description": "Strong suppression in the mutant",
            "shortDescription": "Strong SUP",
            "formName": "M_SUP",
            "formCode": "M_STRONG_SUP",
            "manualValue": "3",
            "manualGroup": "M_SUP"
        },
        {
            "manualscorecodeId": "7",
            "description": "Sterile in the mutant",
            "shortDescription": "STE",
            "formName": "M_SEC_PHENO",
            "formCode": "M_STE",
            "manualValue": "1",
            "manualGroup": "M_STE"
        },
        {
            "manualscorecodeId": "8",
            "description": "Larval arrest or larval lethality in the mutant",
            "shortDescription": "LVA",
            "formName": "M_SEC_PHENO",
            "formCode": "M_LVA",
            "manualValue": "1",
            "manualGroup": "M_LVA"
        },
        {
            "manualscorecodeId": "10",
            "description": "Low brood size in the mutant",
            "shortDescription": "LB",
            "formName": "M_SEC_PHENO",
            "formCode": "M_LB",
            "manualValue": "1",
            "manualGroup": "M_LB"
        },
        {
            "manualscorecodeId": "11",
            "description": "Post-embryonic phenotype in the mutant",
            "shortDescription": "PE",
            "formName": "M_SEC_PHENO",
            "formCode": "M_PE",
            "manualValue": "1",
            "manualGroup": "M_PE"
        },
        {
            "manualscorecodeId": "12",
            "description": "Weak enhancement of embryonic lethality in the mutant",
            "shortDescription": "Weak ENH emb",
            "formName": "M_EMB_LETH",
            "formCode": "M_WEAK_EMB",
            "manualValue": "1",
            "manualGroup": "M_EMB_LETH"
        },
        {
            "manualscorecodeId": "13",
            "description": "Medium enhancement of embryonic lethality in the mutant",
            "shortDescription": "Medium ENH emb",
            "formName": "M_EMB_LETH",
            "formCode": "M_MED_EMB",
            "manualValue": "2",
            "manualGroup": "M_EMB_LETH"
        },
        {
            "manualscorecodeId": "14",
            "description": "Strong enhancement of embryonic lethality in the mutant",
            "shortDescription": "Strong ENH emb",
            "formName": "M_EMB_LETH",
            "formCode": "M_STRONG_EMB",
            "manualValue": "3",
            "manualGroup": "M_EMB_LETH"
        },
        {
            "manualscorecodeId": "15",
            "description": "Suppression of embryonic lethality observed in enhancer screen",
            "shortDescription": "SUP of emb in ENH screen",
            "formName": "M_SUP_ENH",
            "formCode": "M_SUP_EMB_ENH",
            "manualValue": "1",
            "manualGroup": "M_SUP_EMB_ENH"
        },
        {
            "manualscorecodeId": "16",
            "description": "Weak enhancement of sterility in the mutant",
            "shortDescription": "Weak ENH ste",
            "formName": "M_ENH_STE",
            "formCode": "M_WEAK_STE",
            "manualValue": "1",
            "manualGroup": "M_ENH_STE"
        },
        {
            "manualscorecodeId": "17",
            "description": "Medium enhancement of sterility in the mutant",
            "shortDescription": "Medium ENH ste",
            "formName": "M_ENH_STE",
            "formCode": "M_MED_STE",
            "manualValue": "2",
            "manualGroup": "M_ENH_STE"
        },
        {
            "manualscorecodeId": "18",
            "description": "Strong enhancement of sterility in the mutant",
            "shortDescription": "Strong ENH ste",
            "formName": "M_STE_LETH",
            "formCode": "M_STRONG_STE",
            "manualValue": "3",
            "manualGroup": "M_ENH_STE"
        },
        {
            "manualscorecodeId": "19",
            "description": "Suppression of sterility observed in enhancer screen in the mutant",
            "shortDescription": "SUP of ste in ENH screen",
            "formName": "M_SUP_ENH",
            "formCode": "M_SUP_STE_ENH",
            "manualValue": "1",
            "manualGroup": "M_SUP_STE_ENH"
        },
        {
            "manualscorecodeId": "20",
            "description": " Control is wildtype or (No Effect)",
            "shortDescription": "N2 RNAi WT",
            "formName": "WT_NO_EFFECT",
            "formCode": "WT_NO_EFFECT",
            "manualValue": "1",
            "manualGroup": "WT_NO_EFFECT"
        },
        {
            "manualscorecodeId": "21",
            "description": "Low embryonic lethality in control strain",
            "shortDescription": "N2 RNAi low emb",
            "formName": "WT_EMB_LETH",
            "formCode": "WT_WEAK_EMB",
            "manualValue": "1",
            "manualGroup": "WT_EMB_LETH"
        },
        {
            "manualscorecodeId": "22",
            "description": "Medium embryonic lethality in control strain",
            "shortDescription": "N2 RNAi medium emb",
            "formName": "WT_EMB_LETH",
            "formCode": "WT_MED_EMB",
            "manualValue": "2",
            "manualGroup": "WT_EMB_LETH"
        },
        {
            "manualscorecodeId": "23",
            "description": "Strong embryonic lethality in N2 RNAi control",
            "shortDescription": "N2 RNAi high emb",
            "formName": "WT_EMB_LETH",
            "formCode": "WT_STRONG_EMB",
            "manualValue": "3",
            "manualGroup": "WT_EMB_LETH"
        },
        {
            "manualscorecodeId": "24",
            "description": "Sterility in N2 RNAi control",
            "shortDescription": "N2 RNAi STE",
            "formName": "WT_SEC_PHENO",
            "formCode": "WT_STE",
            "manualValue": "1",
            "manualGroup": "WT_STE"
        },
        {
            "manualscorecodeId": "25",
            "description": "Low brood size in N2 RNAi control",
            "shortDescription": "N2 RNAi LB",
            "formName": "WT_SEC_PHENO",
            "formCode": "WT_LB",
            "manualValue": "1",
            "manualGroup": "WT_LB"
        },
        {
            "manualscorecodeId": "26",
            "description": "Larval arrest of larval lethality in N2 RNAi control",
            "shortDescription": "N2 RNAi LVA",
            "formName": "WT_SEC_PHENO",
            "formCode": "WT_LVA",
            "manualValue": "1",
            "manualGroup": "WT_LVA"
        },
        {
            "manualscorecodeId": "27",
            "description": "Post-embryonic phenotype in N2 RNAi control",
            "shortDescription": "N2 RNAi PE",
            "formName": "WT_SEC_PHENO",
            "formCode": "WT_PE",
            "manualValue": "1",
            "manualGroup": "WT_PE"
        },
        {
            "manualscorecodeId": "28",
            "description": "Suppression of post-embryonic phenotype or larval arrest\/lethality observed in enhancer screen",
            "shortDescription": "SUP of PE\/LVA in ENH screen",
            "formName": "M_PE_LVA_ENH",
            "formCode": "M_SUP_PE_LVA_ENH",
            "manualValue": "1",
            "manualGroup": "M_SUP_PE_LVA_ENH"
        },
        {
            "manualscorecodeId": "29",
            "description": "Enhancement of post-embryonic phenotype or larval arrest\/lethality observed in enhancer screen",
            "shortDescription": "ENH of PE\/LVA in ENH screen",
            "formName": "M_PE_LVA_ENH",
            "formCode": "M_ENH_PE_LVA_ENH",
            "manualValue": "1",
            "manualGroup": "M_ENH_PE_LVA_ENH"
        },
        {
            "manualscorecodeId": "30",
            "description": "0-9% embryonic lethal",
            "shortDescription": "",
            "formName": "EMB_0_10",
            "formCode": "EMB_SEC",
            "manualValue": "0",
            "manualGroup": "EMB_SEC"
        },
        {
            "manualscorecodeId": "31",
            "description": "10-19% embryonic lethal",
            "shortDescription": "",
            "formName": "EMB_1_10",
            "formCode": "EMB_SEC",
            "manualValue": "1",
            "manualGroup": "EMB_SEC"
        },
        {
            "manualscorecodeId": "32",
            "description": "20-29% embryonic lethal",
            "shortDescription": "",
            "formName": "EMB_2_10",
            "formCode": "EMB_SEC",
            "manualValue": "2",
            "manualGroup": "EMB_SEC"
        },
        {
            "manualscorecodeId": "33",
            "description": "30-39% embryonic lethal",
            "shortDescription": "",
            "formName": "EMB_3_10",
            "formCode": "EMB_SEC",
            "manualValue": "3",
            "manualGroup": "EMB_SEC"
        },
        {
            "manualscorecodeId": "34",
            "description": "40-49% embryonic lethal",
            "shortDescription": "",
            "formName": "EMB_4_10",
            "formCode": "EMB_SEC",
            "manualValue": "4",
            "manualGroup": "EMB_SEC"
        },
        {
            "manualscorecodeId": "35",
            "description": "50-59% embryonic lethal",
            "shortDescription": "",
            "formName": "EMB_5_10",
            "formCode": "EMB_SEC",
            "manualValue": "5",
            "manualGroup": "EMB_SEC"
        },
        {
            "manualscorecodeId": "36",
            "description": "60-69% embryonic lethal",
            "shortDescription": "",
            "formName": "EMB_6_10",
            "formCode": "EMB_SEC",
            "manualValue": "6",
            "manualGroup": "EMB_SEC"
        },
        {
            "manualscorecodeId": "37",
            "description": "70-79% embryonic lethal",
            "shortDescription": "",
            "formName": "EMB_7_10",
            "formCode": "EMB_SEC",
            "manualValue": "7",
            "manualGroup": "EMB_SEC"
        },
        {
            "manualscorecodeId": "38",
            "description": "80-89% embryonic lethal",
            "shortDescription": "",
            "formName": "EMB_8_10",
            "formCode": "EMB_SEC",
            "manualValue": "8",
            "manualGroup": "EMB_SEC"
        },
        {
            "manualscorecodeId": "39",
            "description": "90-99% embryonic lethal",
            "shortDescription": "",
            "formName": "EMB_9_10",
            "formCode": "EMB_SEC",
            "manualValue": "9",
            "manualGroup": "EMB_SEC"
        },
        {
            "manualscorecodeId": "40",
            "description": "100% embryonic lethal (or fewer than one larva per adult)",
            "shortDescription": "",
            "formName": "EMB_10_10",
            "formCode": "EMB_SEC",
            "manualValue": "10",
            "manualGroup": "EMB_SEC"
        },
        {
            "manualscorecodeId": "41",
            "description": "Normal-sized brood (compared to N2 as its fullest)",
            "shortDescription": "",
            "formName": "STE_0_5",
            "formCode": "STE_SEC",
            "manualValue": "0",
            "manualGroup": "STE_SEC"
        },
        {
            "manualscorecodeId": "42",
            "description": "1-24% reduction in brood size (compared to N2 at its fullest)",
            "shortDescription": "",
            "formName": "STE_1_5",
            "formCode": "STE_SEC",
            "manualValue": "1",
            "manualGroup": "STE_SEC"
        },
        {
            "manualscorecodeId": "43",
            "description": "25-49% reduction in brood size (compared to N2 at its fullest)",
            "shortDescription": "",
            "formName": "STE_2_5",
            "formCode": "STE_SEC",
            "manualValue": "2",
            "manualGroup": "STE_SEC"
        },
        {
            "manualscorecodeId": "44",
            "description": "50-74% reduction in brood size (compared to N2 at its fullest)",
            "shortDescription": "",
            "formName": "STE_3_5",
            "formCode": "STE_SEC",
            "manualValue": "3",
            "manualGroup": "STE_SEC"
        },
        {
            "manualscorecodeId": "45",
            "description": "75-99% reduction in brood size (compared to N2 at its fullest)",
            "shortDescription": "",
            "formName": "STE_4_5",
            "formCode": "STE_SEC",
            "manualValue": "4",
            "manualGroup": "STE_SEC"
        },
        {
            "manualscorecodeId": "46",
            "description": "100% sterile (or fewer than one larva\/egg per adult)",
            "shortDescription": "",
            "formName": "STE_5_5",
            "formCode": "STE_SEC",
            "manualValue": "5",
            "manualGroup": "STE_SEC"
        },
        {
            "manualscorecodeId": "47",
            "description": "Embryonic Lethality Unknown or Impossible to judge",
            "shortDescription": "EMB_UNKNOWN",
            "formName": "EMB_UNKNOWN",
            "formCode": "EMB_UNKNOWN",
            "manualValue": "1",
            "manualGroup": "EMB_UNKNOWN"
        },
        {
            "manualscorecodeId": "49",
            "description": "Sterility Lethality Unknown or Impossible to judge",
            "shortDescription": "STE_UNKNOWN",
            "formName": "STE_UNKNOWN",
            "formCode": "STE_UNKNOWN",
            "manualValue": "1",
            "manualGroup": "STE_UNKNOWN"
        },
        {
            "manualscorecodeId": "50",
            "description": "Weak enhancement of sterility in the control",
            "shortDescription": "Weak ENH ste",
            "formName": "WT_STE_LETH",
            "formCode": "WT_WEAK_STE",
            "manualValue": "1",
            "manualGroup": "WT_ENH_STE"
        },
        {
            "manualscorecodeId": "51",
            "description": "Medium enhancement of sterility in the control",
            "shortDescription": "Medium ENH ste",
            "formName": "WT_STE_LETH",
            "formCode": "WT_MED_STE",
            "manualValue": "2",
            "manualGroup": "WT_ENH_STE"
        },
        {
            "manualscorecodeId": "52",
            "description": "Strong enhancement of sterility in the control",
            "shortDescription": "Strong ENH ste",
            "formName": "WT_STE_LETH",
            "formCode": "WT_STRONG_STE",
            "manualValue": "3",
            "manualGroup": "WT_ENH_STE"
        },
        {
            "manualscorecodeId": "53",
            "description": "Image problem in the mutant",
            "shortDescription": "Mutant problem",
            "formName": "M_PROB",
            "formCode": "M_PROB",
            "manualValue": "1",
            "manualGroup": "M_PROB"
        },
        {
            "manualscorecodeId": "54",
            "description": "Suppression of embryonic lethality observed in enhancer screen in the control ",
            "shortDescription": "SUP of emb in ENH screen in the control",
            "formName": "WT_SUP_ENH",
            "formCode": "WT_SUP_EMB_ENH",
            "manualValue": "1",
            "manualGroup": "WT_SUP_EMB_ENH"
        },
        {
            "manualscorecodeId": "55",
            "description": "Suppression of sterility observed in enhancer screen in the control",
            "shortDescription": "SUP of ste in ENH screen in the control",
            "formName": "WT_SUP_ENH",
            "formCode": "WT_SUP_STE_ENH",
            "manualValue": "1",
            "manualGroup": "WT_SUP_STE_ENH"
        },
        {
            "manualscorecodeId": "60",
            "description": "No enhancement of sterility in the control",
            "shortDescription": "No ENH ste",
            "formName": "WT_STE_LETH",
            "formCode": "WT_NONE_STE",
            "manualValue": "0",
            "manualGroup": "WT_ENH_STE"
        },
        {
            "manualscorecodeId": "61",
            "description": "None embryonic lethality in N2 RNAi control",
            "shortDescription": "N2 RNAi high emb",
            "formName": "WT_EMB_LETH",
            "formCode": "WT_NONE_EMB",
            "manualValue": "0",
            "manualGroup": "WT_EMB_LETH"
        },
        {
            "manualscorecodeId": "62",
            "description": "No suppression in the mutant",
            "shortDescription": "No SUP",
            "formName": "M_SUP",
            "formCode": "M_NONE_SUP",
            "manualValue": "0",
            "manualGroup": "M_SUP"
        },
        {
            "manualscorecodeId": "63",
            "description": "No enhancement of embryonic lethality in the mutant",
            "shortDescription": "No ENH emb",
            "formName": "M_EMB_LETH",
            "formCode": "M_NONE_EMB",
            "manualValue": "0",
            "manualGroup": "M_EMB_LETH"
        },
        {
            "manualscorecodeId": "64",
            "description": "No enhancement of sterility in the mutant",
            "shortDescription": "No ENH ste",
            "formName": "M_ENH_STE",
            "formCode": "M_NONE_STE",
            "manualValue": "0",
            "manualGroup": "M_ENH_STE"
        },
        {
            "manualscorecodeId": "65",
            "description": "This field is a boolean value for a manual score. If it is zero or absent, then this expGroup has not been scored (either with the first pass scoring protocol or the full scoring protocol), by a person.",
            "shortDescription": "",
            "formName": "HAS_MANUAL_SCORE",
            "formCode": "HAS_MANUAL_SCORE",
            "manualValue": "1",
            "manualGroup": "HAS_MANUAL_SCORE"
        },
        {
            "manualscorecodeId": "66",
            "description": "Does not fulfill the criteria for first pass \/ contact sheet is_interesting",
            "shortDescription": "Not Interesting from first pass scoring protocol",
            "formName": "FIRST_PASS_NOT_INTERESTING",
            "formCode": "FIRST_PASS_NOT_INTER",
            "manualValue": "0",
            "manualGroup": "FIRST_PASS"
        },
        {
            "manualscorecodeId": "67",
            "description": "No suppression or enhancement in the mutant (No Effect)",
            "shortDescription": "Not a hit",
            "formName": "M_NO_EFFECT",
            "formCode": "M_NO_EFFECT",
            "manualValue": "1",
            "manualGroup": "M_NO_EFFECT"
        },
        {
            "manualscorecodeId": "68",
            "description": "description",
            "shortDescription": "shortDescription",
            "formName": "formName",
            "formCode": "formCode",
            "manualValue": "0",
            "manualGroup": "manualscore_group"
        }
    ];
    mEmbErrorMessage;
    mSteErrorMessage;
    wtEmbErrorMessage;
    saveErrorMessage = null;
    valid: Boolean = true;
    submitted: Boolean = false;

    constructor(private hotkeysService: HotkeysService, private expManualScoresApi: ExpManualScoresApi) {
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
    }

}
