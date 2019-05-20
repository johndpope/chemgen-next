import {ExpSetSearchResults} from "../../chemgen-next-server/common/types/custom/types/custom/ExpSetTypes";

const data : any = {
    "expAssays": [
        {
            "assayId": 1444,
            "screenId": 9,
            "plateId": 1038,
            "expGroupId": 30456,
            "assayImagePath": "2015Nov02/3551/M281M282M283M2842DQ3_H03",
            "expWorkflowId": "5b0a2679ebd09f0f91a2194a"
        },
        {
            "assayId": 1096,
            "screenId": 9,
            "plateId": 563,
            "expGroupId": 6,
            "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_G01",
            "expWorkflowId": "5b0a2679ebd09f0f91a218fa"
        },
        {
            "assayId": 1071,
            "screenId": 9,
            "plateId": 563,
            "expGroupId": 6,
            "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_D01",
            "expWorkflowId": "5b0a2679ebd09f0f91a218fa"
        },
        {
            "assayId": 1070,
            "screenId": 9,
            "plateId": 563,
            "expGroupId": 6,
            "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_C01",
            "expWorkflowId": "5b0a2679ebd09f0f91a218fa"
        },
        {
            "assayId": 1088,
            "screenId": 9,
            "plateId": 563,
            "expGroupId": 6,
            "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_G12",
            "expWorkflowId": "5b0a2679ebd09f0f91a218fa"
        },
        {
            "assayId": 53898,
            "screenId": 9,
            "plateId": 639,
            "expGroupId": 42143,
            "assayImagePath": "2015Nov09/3903/M281M282M283M2842DQ3_H03",
            "expWorkflowId": "5b0a2679ebd09f0f91a2194a"
        },
        {
            "assayId": 771,
            "screenId": 9,
            "plateId": 1470,
            "expGroupId": 45,
            "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_H01",
            "expWorkflowId": "5b0a267aebd09f0f91a219c1"
        },
        {
            "assayId": 804,
            "screenId": 9,
            "plateId": 1470,
            "expGroupId": 45,
            "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_C01",
            "expWorkflowId": "5b0a267aebd09f0f91a219c1"
        },
        {
            "assayId": 794,
            "screenId": 9,
            "plateId": 1470,
            "expGroupId": 45,
            "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_A12",
            "expWorkflowId": "5b0a267aebd09f0f91a219c1"
        },
        {
            "assayId": 785,
            "screenId": 9,
            "plateId": 1470,
            "expGroupId": 45,
            "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_E01",
            "expWorkflowId": "5b0a267aebd09f0f91a219c1"
        },
        {
            "assayId": 79794,
            "screenId": 9,
            "plateId": 245,
            "biosampleId": 7,
            "assayCodeName": "M281M282M283M2842DQ3_H03",
            "assayWell": "H03",
            "expGroupId": 30456,
            "assayReplicateNum": null,
            "assayImagePath": "2015Nov02/3395/M281M282M283M2842DQ3_H03",
            "assayWpAssayPostId": null,
            "assayMeta": null,
            "expWorkflowId": "5b0a2679ebd09f0f91a2194a"
        }
    ],
    "expAssay2reagents": [
        {
            "screenId": 9,
            "libraryId": 2,
            "plateId": 1038,
            "assayId": 1444,
            "stockId": 1445,
            "reagentId": 27400,
            "parentLibraryPlate": "283",
            "parentLibraryWell": "H03",
            "stockLibraryWell": "H03",
            "reagentName": "27400",
            "reagentType": "treat_chemical",
            "expGroupId": 30456,
            "treatmentGroupId": null,
            "reagentTable": "ChemicalLibraryStock",
            "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
            "assay2ReagentId": 1442,
            "assay2ReagentMeta": null
        },
        {
            "assay2reagentId": 1442,
            "libraryId": 2,
            "plateId": 1038,
            "assayId": 1444,
            "reagentId": 27400,
            "reagentType": "treat_chemical",
            "expGroupId": 30456,
            "treatmentGroupId": null
        },
        {
            "assay2reagentId": 53901,
            "libraryId": 2,
            "plateId": 639,
            "assayId": 53898,
            "reagentId": 27400,
            "reagentType": "ctrl_chemical",
            "expGroupId": 42143,
            "treatmentGroupId": null
        },
        {
            "assay2reagentId": 79795,
            "libraryId": 2,
            "plateId": 245,
            "assayId": 79794,
            "reagentId": 27400,
            "reagentType": "treat_chemical",
            "expGroupId": 30456,
            "treatmentGroupId": null
        }
    ],
    "modelPredictedCounts": [],
    "expPlates": [
        {
            "plateId": 245,
            "screenId": 9,
            "barcode": "M281M282M283M2842DQ3",
            "instrumentPlateId": 3395,
            "expWorkflowId": "5b0a2679ebd09f0f91a2194a"
        },
        {
            "plateId": 563,
            "screenId": 9,
            "barcode": "M273M274M275M2762DQ3",
            "instrumentPlateId": 3895,
            "expWorkflowId": "5b0a2679ebd09f0f91a218fa"
        },
        {
            "plateId": 639,
            "screenId": 9,
            "barcode": "M281M282M283M2842DQ3",
            "instrumentPlateId": 3903,
            "expWorkflowId": "5b0a2679ebd09f0f91a2194a"
        },
        {
            "plateId": 1038,
            "screenId": 9,
            "barcode": "M281M282M283M2842DQ3",
            "instrumentPlateId": 3551,
            "expWorkflowId": "5b0a2679ebd09f0f91a2194a"
        },
        {
            "plateId": 1470,
            "screenId": 9,
            "barcode": "M393M394M395M3961DQ4",
            "instrumentPlateId": 3460,
            "expWorkflowId": "5b0a267aebd09f0f91a219c1"
        }
    ],
    "expScreens": [
        {
            "screenId": 9,
            "screenName": "Pristionchus pacificus + N2 Primary Chembridge Whole Library Screen",
            "screenType": "chemical",
            "screenStage": "primary",
            "screenDescription": "Chembridge all chemicals, imaged in 2016.",
            "screenProtocol": null,
            "screenParentId": null,
            "screenPerformedBy": null,
            "screenMeta": null
        }
    ],
    "expWorkflows": [
        {
            "name": "CHEM Primary 275 2015-10-27",
            "screenId": 9,
            "screenStage": "primary",
            "screenType": "permissive",
            "biosamples": {
                "experimentBiosample": {
                    "id": 7,
                    "name": "Pristionchus pacificus"
                },
                "ctrlBiosample": {
                    "id": 4,
                    "name": "N2"
                }
            },
            "assayDates": [
                "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)"
            ],
            "temperature": 20,
            "id": "5b0a2679ebd09f0f91a218fa"
        },
        {
            "name": "CHEM Primary 283 2015-10-27",
            "screenId": 9,
            "screenStage": "primary",
            "screenType": "permissive",
            "biosamples": {
                "experimentBiosample": {
                    "id": 7,
                    "name": "Pristionchus pacificus"
                },
                "ctrlBiosample": {
                    "id": 4,
                    "name": "N2"
                }
            },
            "assayDates": [
                "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)"
            ],
            "temperature": 20,
            "id": "5b0a2679ebd09f0f91a2194a"
        },
        {
            "name": "CHEM Primary 396 2015-08-05",
            "screenId": 9,
            "screenStage": "primary",
            "screenType": "permissive",
            "biosamples": {
                "experimentBiosample": {
                    "id": 7,
                    "name": "Pristionchus pacificus"
                },
                "ctrlBiosample": {
                    "id": 4,
                    "name": "N2"
                }
            },
            "assayDates": [
                "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)"
            ],
            "temperature": 20,
            "id": "5b0a267aebd09f0f91a219c1"
        }
    ],
    "expManualScores": [],
    "currentPage": 1,
    "skip": 1,
    "totalPages": 81032,
    "pageSize": 1,
    "albums": [
        {
            "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
            "treatmentReagentId": 30456,
            "treatmentGroupId": 30456,
            "ctrlReagentId": 42143,
            "ctrlStrainId": 45,
            "ctrlNullId": 6,
            "treatmentReagentImages": [
                {
                    "assayImagePath": "2015Nov02/3551/M281M282M283M2842DQ3_H03",
                    "src": "http://10.230.9.227/microscope/2015Nov02/3551/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                    "caption": "Image 2015Nov02/3551/M281M282M283M2842DQ3_H03 caption here",
                    "thumb": "http://10.230.9.227/microscope/2015Nov02/3551/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                },
                {
                    "assayImagePath": "2015Nov02/3395/M281M282M283M2842DQ3_H03",
                    "src": "http://10.230.9.227/microscope/2015Nov02/3395/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                    "caption": "Image 2015Nov02/3395/M281M282M283M2842DQ3_H03 caption here",
                    "thumb": "http://10.230.9.227/microscope/2015Nov02/3395/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                }
            ],
            "ctrlReagentImages": [
                {
                    "assayImagePath": "2015Nov09/3903/M281M282M283M2842DQ3_H03",
                    "src": "http://10.230.9.227/microscope/2015Nov09/3903/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                    "caption": "Image 2015Nov09/3903/M281M282M283M2842DQ3_H03 caption here",
                    "thumb": "http://10.230.9.227/microscope/2015Nov09/3903/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                }
            ],
            "ctrlStrainImages": [
                {
                    "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_A12",
                    "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_A12-autolevel.jpeg",
                    "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_A12 caption here",
                    "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_A12-autolevel.jpeg"
                },
                {
                    "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_E01",
                    "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_E01-autolevel.jpeg",
                    "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_E01 caption here",
                    "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_E01-autolevel.jpeg"
                },
                {
                    "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_C01",
                    "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_C01-autolevel.jpeg",
                    "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_C01 caption here",
                    "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_C01-autolevel.jpeg"
                },
                {
                    "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_H01",
                    "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_H01-autolevel.jpeg",
                    "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_H01 caption here",
                    "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_H01-autolevel.jpeg"
                }
            ],
            "ctrlNullImages": [
                {
                    "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_G01",
                    "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G01-autolevel.jpeg",
                    "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_G01 caption here",
                    "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G01-autolevel.jpeg"
                },
                {
                    "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_G12",
                    "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G12-autolevel.jpeg",
                    "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_G12 caption here",
                    "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G12-autolevel.jpeg"
                },
                {
                    "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_D01",
                    "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_D01-autolevel.jpeg",
                    "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_D01 caption here",
                    "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_D01-autolevel.jpeg"
                },
                {
                    "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_C01",
                    "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_C01-autolevel.jpeg",
                    "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_C01 caption here",
                    "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_C01-autolevel.jpeg"
                }
            ]
        }
    ],
    "expGroupTypeAlbums": {
        "treatReagent": [
            {
                "screenId": 9,
                "src": "http://10.230.9.227/microscope/2015Nov02/3551/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                "thumb": "http://10.230.9.227/microscope/2015Nov02/3551/M281M282M283M2842DQ3_H03-autolevel-300x300.jpeg",
                "caption": "Image 2015Nov02/3551/M281M282M283M2842DQ3_H03 caption here",
                "imagePath": "2015Nov02/3551/M281M282M283M2842DQ3_H03",
                "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                "expGroupType": "treat_chemical",
                "expSet": {
                    "treatmentGroupId": 30456,
                    "expWorkflow": {
                        "name": "CHEM Primary 283 2015-10-27",
                        "screenId": 9,
                        "screenStage": "primary",
                        "screenType": "permissive",
                        "biosamples": {
                            "experimentBiosample": {
                                "id": 7,
                                "name": "Pristionchus pacificus"
                            },
                            "ctrlBiosample": {
                                "id": 4,
                                "name": "N2"
                            }
                        },
                        "assayDates": [
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)"
                        ],
                        "temperature": 20,
                        "id": "5b0a2679ebd09f0f91a2194a"
                    },
                    "expScreen": {
                        "screenId": 9,
                        "screenName": "Pristionchus pacificus + N2 Primary Chembridge Whole Library Screen",
                        "screenType": "chemical",
                        "screenStage": "primary",
                        "screenDescription": "Chembridge all chemicals, imaged in 2016.",
                        "screenProtocol": null,
                        "screenParentId": null,
                        "screenPerformedBy": null,
                        "screenMeta": null
                    },
                    "modelPredictedCounts": [],
                    "expSets": [
                        {
                            "expDesignId": 2239,
                            "screenId": 9,
                            "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                            "treatmentGroupId": 30456,
                            "controlGroupId": 6,
                            "controlGroupReagentType": "ctrl_null"
                        },
                        {
                            "expDesignId": 2314,
                            "screenId": 9,
                            "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                            "treatmentGroupId": 30456,
                            "controlGroupId": 45,
                            "controlGroupReagentType": "ctrl_strain"
                        },
                        {
                            "expDesignId": 2401,
                            "screenId": 9,
                            "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                            "treatmentGroupId": 30456,
                            "controlGroupId": 42143,
                            "controlGroupReagentType": "ctrl_chemical"
                        }
                    ],
                    "albums": {
                        "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                        "treatmentReagentId": 30456,
                        "treatmentGroupId": 30456,
                        "ctrlReagentId": 42143,
                        "ctrlStrainId": 45,
                        "ctrlNullId": 6,
                        "treatmentReagentImages": [
                            {
                                "assayImagePath": "2015Nov02/3551/M281M282M283M2842DQ3_H03",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3551/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3551/M281M282M283M2842DQ3_H03 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3551/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3395/M281M282M283M2842DQ3_H03",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3395/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3395/M281M282M283M2842DQ3_H03 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3395/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                            }
                        ],
                        "ctrlReagentImages": [
                            {
                                "assayImagePath": "2015Nov09/3903/M281M282M283M2842DQ3_H03",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3903/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3903/M281M282M283M2842DQ3_H03 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3903/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                            }
                        ],
                        "ctrlStrainImages": [
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_A12",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_A12-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_A12 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_A12-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_E01",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_E01-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_E01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_E01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_C01",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_C01-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_C01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_C01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_H01",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_H01-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_H01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_H01-autolevel.jpeg"
                            }
                        ],
                        "ctrlNullImages": [
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_G01",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G01-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_G01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_G12",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G12-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_G12 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G12-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_D01",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_D01-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_D01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_D01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_C01",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_C01-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_C01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_C01-autolevel.jpeg"
                            }
                        ]
                    }
                },
                "treatmentGroupId": 30456,
                "plateId": 1038,
                "assayId": 1444,
                "counts": {},
                "percEmbLeth": null,
                "broodSize": null,
                "percSter": null,
                "wormCount": null,
                "larvaCount": null,
                "eggCount": null,
                "percEmbLethColor": null,
                "percSteColor": null,
                "percSurvivalColor": null,
                "manualScoreByAssay": null,
                "manualScoreByTreatment": []
            },
            {
                "screenId": 9,
                "src": "http://10.230.9.227/microscope/2015Nov02/3551/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                "thumb": "http://10.230.9.227/microscope/2015Nov02/3551/M281M282M283M2842DQ3_H03-autolevel-300x300.jpeg",
                "caption": "Image 2015Nov02/3551/M281M282M283M2842DQ3_H03 caption here",
                "imagePath": "2015Nov02/3551/M281M282M283M2842DQ3_H03",
                "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                "expGroupType": "treat_chemical",
                "expSet": {
                    "treatmentGroupId": 30456,
                    "expWorkflow": {
                        "name": "CHEM Primary 283 2015-10-27",
                        "screenId": 9,
                        "screenStage": "primary",
                        "screenType": "permissive",
                        "biosamples": {
                            "experimentBiosample": {
                                "id": 7,
                                "name": "Pristionchus pacificus"
                            },
                            "ctrlBiosample": {
                                "id": 4,
                                "name": "N2"
                            }
                        },
                        "assayDates": [
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)"
                        ],
                        "temperature": 20,
                        "id": "5b0a2679ebd09f0f91a2194a"
                    },
                    "expScreen": {
                        "screenId": 9,
                        "screenName": "Pristionchus pacificus + N2 Primary Chembridge Whole Library Screen",
                        "screenType": "chemical",
                        "screenStage": "primary",
                        "screenDescription": "Chembridge all chemicals, imaged in 2016.",
                        "screenProtocol": null,
                        "screenParentId": null,
                        "screenPerformedBy": null,
                        "screenMeta": null
                    },
                    "modelPredictedCounts": [],
                    "expSets": [
                        {
                            "expDesignId": 2239,
                            "screenId": 9,
                            "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                            "treatmentGroupId": 30456,
                            "controlGroupId": 6,
                            "controlGroupReagentType": "ctrl_null"
                        },
                        {
                            "expDesignId": 2314,
                            "screenId": 9,
                            "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                            "treatmentGroupId": 30456,
                            "controlGroupId": 45,
                            "controlGroupReagentType": "ctrl_strain"
                        },
                        {
                            "expDesignId": 2401,
                            "screenId": 9,
                            "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                            "treatmentGroupId": 30456,
                            "controlGroupId": 42143,
                            "controlGroupReagentType": "ctrl_chemical"
                        }
                    ],
                    "albums": {
                        "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                        "treatmentReagentId": 30456,
                        "treatmentGroupId": 30456,
                        "ctrlReagentId": 42143,
                        "ctrlStrainId": 45,
                        "ctrlNullId": 6,
                        "treatmentReagentImages": [
                            {
                                "assayImagePath": "2015Nov02/3551/M281M282M283M2842DQ3_H03",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3551/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3551/M281M282M283M2842DQ3_H03 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3551/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3395/M281M282M283M2842DQ3_H03",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3395/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3395/M281M282M283M2842DQ3_H03 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3395/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                            }
                        ],
                        "ctrlReagentImages": [
                            {
                                "assayImagePath": "2015Nov09/3903/M281M282M283M2842DQ3_H03",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3903/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3903/M281M282M283M2842DQ3_H03 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3903/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                            }
                        ],
                        "ctrlStrainImages": [
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_A12",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_A12-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_A12 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_A12-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_E01",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_E01-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_E01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_E01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_C01",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_C01-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_C01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_C01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_H01",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_H01-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_H01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_H01-autolevel.jpeg"
                            }
                        ],
                        "ctrlNullImages": [
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_G01",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G01-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_G01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_G12",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G12-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_G12 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G12-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_D01",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_D01-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_D01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_D01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_C01",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_C01-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_C01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_C01-autolevel.jpeg"
                            }
                        ]
                    }
                },
                "treatmentGroupId": 30456,
                "plateId": 1038,
                "assayId": 1444,
                "counts": {},
                "percEmbLeth": null,
                "broodSize": null,
                "percSter": null,
                "wormCount": null,
                "larvaCount": null,
                "eggCount": null,
                "percEmbLethColor": null,
                "percSteColor": null,
                "percSurvivalColor": null,
                "manualScoreByAssay": null,
                "manualScoreByTreatment": []
            },
            {
                "screenId": 9,
                "well": "H03",
                "src": "http://10.230.9.227/microscope/2015Nov02/3395/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                "thumb": "http://10.230.9.227/microscope/2015Nov02/3395/M281M282M283M2842DQ3_H03-autolevel-300x300.jpeg",
                "caption": "Image 2015Nov02/3395/M281M282M283M2842DQ3_H03 caption here",
                "imagePath": "2015Nov02/3395/M281M282M283M2842DQ3_H03",
                "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                "expGroupType": "treat_chemical",
                "expSet": {
                    "treatmentGroupId": 30456,
                    "expWorkflow": {
                        "name": "CHEM Primary 283 2015-10-27",
                        "screenId": 9,
                        "screenStage": "primary",
                        "screenType": "permissive",
                        "biosamples": {
                            "experimentBiosample": {
                                "id": 7,
                                "name": "Pristionchus pacificus"
                            },
                            "ctrlBiosample": {
                                "id": 4,
                                "name": "N2"
                            }
                        },
                        "assayDates": [
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)"
                        ],
                        "temperature": 20,
                        "id": "5b0a2679ebd09f0f91a2194a"
                    },
                    "expScreen": {
                        "screenId": 9,
                        "screenName": "Pristionchus pacificus + N2 Primary Chembridge Whole Library Screen",
                        "screenType": "chemical",
                        "screenStage": "primary",
                        "screenDescription": "Chembridge all chemicals, imaged in 2016.",
                        "screenProtocol": null,
                        "screenParentId": null,
                        "screenPerformedBy": null,
                        "screenMeta": null
                    },
                    "modelPredictedCounts": [],
                    "expSets": [
                        {
                            "expDesignId": 2239,
                            "screenId": 9,
                            "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                            "treatmentGroupId": 30456,
                            "controlGroupId": 6,
                            "controlGroupReagentType": "ctrl_null"
                        },
                        {
                            "expDesignId": 2314,
                            "screenId": 9,
                            "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                            "treatmentGroupId": 30456,
                            "controlGroupId": 45,
                            "controlGroupReagentType": "ctrl_strain"
                        },
                        {
                            "expDesignId": 2401,
                            "screenId": 9,
                            "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                            "treatmentGroupId": 30456,
                            "controlGroupId": 42143,
                            "controlGroupReagentType": "ctrl_chemical"
                        }
                    ],
                    "albums": {
                        "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                        "treatmentReagentId": 30456,
                        "treatmentGroupId": 30456,
                        "ctrlReagentId": 42143,
                        "ctrlStrainId": 45,
                        "ctrlNullId": 6,
                        "treatmentReagentImages": [
                            {
                                "assayImagePath": "2015Nov02/3551/M281M282M283M2842DQ3_H03",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3551/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3551/M281M282M283M2842DQ3_H03 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3551/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3395/M281M282M283M2842DQ3_H03",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3395/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3395/M281M282M283M2842DQ3_H03 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3395/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                            }
                        ],
                        "ctrlReagentImages": [
                            {
                                "assayImagePath": "2015Nov09/3903/M281M282M283M2842DQ3_H03",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3903/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3903/M281M282M283M2842DQ3_H03 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3903/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                            }
                        ],
                        "ctrlStrainImages": [
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_A12",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_A12-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_A12 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_A12-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_E01",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_E01-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_E01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_E01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_C01",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_C01-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_C01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_C01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_H01",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_H01-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_H01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_H01-autolevel.jpeg"
                            }
                        ],
                        "ctrlNullImages": [
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_G01",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G01-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_G01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_G12",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G12-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_G12 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G12-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_D01",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_D01-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_D01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_D01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_C01",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_C01-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_C01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_C01-autolevel.jpeg"
                            }
                        ]
                    }
                },
                "treatmentGroupId": 30456,
                "plateId": 245,
                "assayId": 79794,
                "counts": {},
                "percEmbLeth": null,
                "broodSize": null,
                "percSter": null,
                "wormCount": null,
                "larvaCount": null,
                "eggCount": null,
                "percEmbLethColor": null,
                "percSteColor": null,
                "percSurvivalColor": null,
                "manualScoreByAssay": null,
                "manualScoreByTreatment": []
            }
        ],
        "ctrlReagent": [
            {
                "screenId": 9,
                "src": "http://10.230.9.227/microscope/2015Nov09/3903/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                "thumb": "http://10.230.9.227/microscope/2015Nov09/3903/M281M282M283M2842DQ3_H03-autolevel-300x300.jpeg",
                "caption": "Image 2015Nov09/3903/M281M282M283M2842DQ3_H03 caption here",
                "imagePath": "2015Nov09/3903/M281M282M283M2842DQ3_H03",
                "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                "expGroupType": "ctrl_chemical",
                "expSet": {
                    "treatmentGroupId": 30456,
                    "expWorkflow": {
                        "name": "CHEM Primary 283 2015-10-27",
                        "screenId": 9,
                        "screenStage": "primary",
                        "screenType": "permissive",
                        "biosamples": {
                            "experimentBiosample": {
                                "id": 7,
                                "name": "Pristionchus pacificus"
                            },
                            "ctrlBiosample": {
                                "id": 4,
                                "name": "N2"
                            }
                        },
                        "assayDates": [
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)",
                            "Fri Sep 28 2018 08:06:07 GMT+0400 (+04)"
                        ],
                        "temperature": 20,
                        "id": "5b0a2679ebd09f0f91a2194a"
                    },
                    "expScreen": {
                        "screenId": 9,
                        "screenName": "Pristionchus pacificus + N2 Primary Chembridge Whole Library Screen",
                        "screenType": "chemical",
                        "screenStage": "primary",
                        "screenDescription": "Chembridge all chemicals, imaged in 2016.",
                        "screenProtocol": null,
                        "screenParentId": null,
                        "screenPerformedBy": null,
                        "screenMeta": null
                    },
                    "modelPredictedCounts": [],
                    "expSets": [
                        {
                            "expDesignId": 2239,
                            "screenId": 9,
                            "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                            "treatmentGroupId": 30456,
                            "controlGroupId": 6,
                            "controlGroupReagentType": "ctrl_null"
                        },
                        {
                            "expDesignId": 2314,
                            "screenId": 9,
                            "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                            "treatmentGroupId": 30456,
                            "controlGroupId": 45,
                            "controlGroupReagentType": "ctrl_strain"
                        },
                        {
                            "expDesignId": 2401,
                            "screenId": 9,
                            "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                            "treatmentGroupId": 30456,
                            "controlGroupId": 42143,
                            "controlGroupReagentType": "ctrl_chemical"
                        }
                    ],
                    "albums": {
                        "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                        "treatmentReagentId": 30456,
                        "treatmentGroupId": 30456,
                        "ctrlReagentId": 42143,
                        "ctrlStrainId": 45,
                        "ctrlNullId": 6,
                        "treatmentReagentImages": [
                            {
                                "assayImagePath": "2015Nov02/3551/M281M282M283M2842DQ3_H03",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3551/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3551/M281M282M283M2842DQ3_H03 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3551/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3395/M281M282M283M2842DQ3_H03",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3395/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3395/M281M282M283M2842DQ3_H03 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3395/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                            }
                        ],
                        "ctrlReagentImages": [
                            {
                                "assayImagePath": "2015Nov09/3903/M281M282M283M2842DQ3_H03",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3903/M281M282M283M2842DQ3_H03-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3903/M281M282M283M2842DQ3_H03 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3903/M281M282M283M2842DQ3_H03-autolevel.jpeg"
                            }
                        ],
                        "ctrlStrainImages": [
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_A12",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_A12-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_A12 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_A12-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_E01",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_E01-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_E01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_E01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_C01",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_C01-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_C01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_C01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov02/3460/M393M394M395M3961DQ4_H01",
                                "src": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_H01-autolevel.jpeg",
                                "caption": "Image 2015Nov02/3460/M393M394M395M3961DQ4_H01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov02/3460/M393M394M395M3961DQ4_H01-autolevel.jpeg"
                            }
                        ],
                        "ctrlNullImages": [
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_G01",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G01-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_G01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_G12",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G12-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_G12 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_G12-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_D01",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_D01-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_D01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_D01-autolevel.jpeg"
                            },
                            {
                                "assayImagePath": "2015Nov09/3895/M273M274M275M2762DQ3_C01",
                                "src": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_C01-autolevel.jpeg",
                                "caption": "Image 2015Nov09/3895/M273M274M275M2762DQ3_C01 caption here",
                                "thumb": "http://10.230.9.227/microscope/2015Nov09/3895/M273M274M275M2762DQ3_C01-autolevel.jpeg"
                            }
                        ]
                    }
                },
                "treatmentGroupId": 30456,
                "plateId": 639,
                "assayId": 53898,
                "counts": {},
                "percEmbLeth": null,
                "broodSize": null,
                "percSter": null,
                "wormCount": null,
                "larvaCount": null,
                "eggCount": null,
                "percEmbLethColor": null,
                "percSteColor": null,
                "percSurvivalColor": null
            }
        ]
    },
    "fetchedFromCache": false,
    "expSets": [
        [
            {
                "expDesignId": 2239,
                "screenId": 9,
                "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                "treatmentGroupId": 30456,
                "controlGroupId": 6,
                "controlGroupReagentType": "ctrl_null"
            },
            {
                "expDesignId": 2314,
                "screenId": 9,
                "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                "treatmentGroupId": 30456,
                "controlGroupId": 45,
                "controlGroupReagentType": "ctrl_strain"
            },
            {
                "expDesignId": 2401,
                "screenId": 9,
                "expWorkflowId": "5b0a2679ebd09f0f91a2194a",
                "treatmentGroupId": 30456,
                "controlGroupId": 42143,
                "controlGroupReagentType": "ctrl_chemical"
            }
        ]
    ]
};
// const expSetMockData: ExpSetSearchResults = new ExpSetSearchResults(data);
const expSetMockData : ExpSetSearchResults = new ExpSetSearchResults(data);
export {expSetMockData};
