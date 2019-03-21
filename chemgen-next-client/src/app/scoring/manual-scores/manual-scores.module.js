"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var ManualScoresModule = /** @class */ (function () {
    function ManualScoresModule() {
        //TODO This should really get called in from the api
        //@ts-ignore
        this.manualScores = [
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
            // {
            //     "manualscorecodeId": "60",
            //     "description": "No enhancement of sterility in the control",
            //     "shortDescription": "No ENH ste",
            //     "formName": "WT_STE_LETH",
            //     "formCode": "WT_NONE_STE",
            //     "manualValue": "0",
            //     "manualGroup": "WT_ENH_STE"
            // },
            // {
            //     "manualscorecodeId": "61",
            //     "description": "None embryonic lethality in N2 RNAi control",
            //     "shortDescription": "N2 RNAi high emb",
            //     "formName": "WT_EMB_LETH",
            //     "formCode": "WT_NONE_EMB",
            //     "manualValue": "0",
            //     "manualGroup": "WT_EMB_LETH"
            // },
            // {
            //     "manualscorecodeId": "62",
            //     "description": "No suppression in the mutant",
            //     "shortDescription": "No SUP",
            //     "formName": "M_SUP",
            //     "formCode": "M_NONE_SUP",
            //     "manualValue": "0",
            //     "manualGroup": "M_SUP"
            // },
            // {
            //     "manualscorecodeId": "63",
            //     "description": "No enhancement of embryonic lethality in the mutant",
            //     "shortDescription": "No ENH emb",
            //     "formName": "M_EMB_LETH",
            //     "formCode": "M_NONE_EMB",
            //     "manualValue": "0",
            //     "manualGroup": "M_EMB_LETH"
            // },
            // {
            //     "manualscorecodeId": "64",
            //     "description": "No enhancement of sterility in the mutant",
            //     "shortDescription": "No ENH ste",
            //     "formName": "M_ENH_STE",
            //     "formCode": "M_NONE_STE",
            //     "manualValue": "0",
            //     "manualGroup": "M_ENH_STE"
            // },
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
                "manualscorecodeId": "67",
                "description": "No suppression or enhancement in the mutant (No Effect)",
                "shortDescription": "Not a hit",
                "formName": "M_NO_EFFECT",
                "formCode": "M_NO_EFFECT",
                "manualValue": "1",
                "manualGroup": "M_NO_EFFECT"
            },
        ];
        this.scores = {
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
            'WT_WEAK_STE': 0,
            'WT_MED_STE': 0,
            'WT_STRONG_STE': 0,
        };
    }
    ManualScoresModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule
            ],
            declarations: []
        })
    ], ManualScoresModule);
    return ManualScoresModule;
}());
exports.ManualScoresModule = ManualScoresModule;
//# sourceMappingURL=manual-scores.module.js.map