"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var app = require('../server/server.js');
/**
 * This is a script that creates a default barcode search schema
 * experiment biosample needs to be changed per screen
 * I don't think the N2 is ever changed, but of course that means it will get changed at some point
 */
//Default RNAI barcode
var barcodeSearchPattern = 'RNAi(\\w+).(\\d+)(\\w{2})';
var experimentBiosamples = [
    {
        name: "mip-1;mip-2",
        id: 6
    },
    {
        name: "mel-28",
        id: 5
    },
    {
        name: "crb",
        id: 8
    },
    {
        name: "lgl-1",
        id: 7
    },
];
//Screen moniker is the new way to refer to screens kris implemented
//they are in the database, but haven't been pulled into the codebase yet
//Also what is in the database doesn't match the spreadsheet
//Values from the spreadsheet are her
var screens = [
    {
        screenId: 1,
        screenName: "mel-28 Primary RNAi Genome Wide Permissive Screen",
        screenMoniker: "mel-28_1E",
        screenType: "Permissive"
    },
    {
        screenId: 2,
        screenName: "mel-28 Primary RNAi Genome Wide Restrictive Screen",
        screenMoniker: "mel-28_1S",
        screenType: "Restrictive"
    },
    {
        screenId: 3,
        screenName: "mip-1;mip-2 Primary RNAi Restrictive Screen",
        screenMoniker: "mips_1S",
        screenType: "Restrictive"
    },
    {
        screenId: 4,
        screenName: "mip-1;mip-2 Primary RNAi Permissive Screen",
        screenMoniker: "mips_1E",
        screenType: "Permissive"
    },
    {
        screenId: 12,
        screenName: "lgl-1 Primary RNAi Permissive Screen",
        screenMoniker: "lgl_1E",
        screenType: "Permissive"
    },
    {
        screenId: 13,
        screenName: "crb Primary RNAi Permissive Screen",
        screenMoniker: "crb_1E",
        screenType: "Permissive"
    }
];
/**
 * ScreenType should be E (Permissive) or S (Restrictive)
 * Mutant code is normally M, but could be anything
 * @param screenType
 * @param mutantCode
 */
var createBarcodeConfigurations = function (screenType, mutantCode, experimentBiosampleId, experimentBiosampleName) {
    var defaultSearchConfigurations = {
        "barcodeSearchPattern": barcodeSearchPattern,
        "barcodeSearches": {
            "ctrlReagentBarcodePattern": {
                "and": [
                    {
                        "name": {
                            "like": "RNA%" + screenType + "%"
                        }
                    },
                    {
                        "name": {
                            "nlike": "%" + mutantCode + "%"
                        }
                    }
                ]
            },
            "treatReagentBarcodePattern": {
                "and": [
                    {
                        "name": {
                            "like": "RNA%" + screenType + "%"
                        }
                    },
                    {
                        "name": {
                            "like": "%" + mutantCode + "%"
                        }
                    }
                ]
            },
            "ctrlNullBarcodePattern": {
                "and": [
                    {
                        "name": {
                            "like": "L4440%" + screenType + "%"
                        }
                    },
                    {
                        "name": {
                            "nlike": "%" + mutantCode + "%"
                        }
                    }
                ]
            },
            "ctrlStrainBarcodePattern": {
                "and": [
                    {
                        "name": {
                            "like": "L4440%" + screenType + "%"
                        }
                    },
                    {
                        "name": {
                            "like": "%" + mutantCode + "%"
                        }
                    }
                ]
            }
        },
        "biosamples": {
            "experimentBiosample": {
                "id": experimentBiosampleId,
                "name": experimentBiosampleName,
            },
            "ctrlBiosample": {
                "id": "4",
                "name": "N2"
            }
        }
    };
    return defaultSearchConfigurations;
};
// Default permissive search configuration
var defaultPermissiveSearchConfigurations = {
    "barcodeSearches": {
        "ctrlReagentBarcodePattern": {
            "and": [
                {
                    "name": {
                        "like": "RNA%E%"
                    }
                },
                {
                    "name": {
                        "nlike": "%M%"
                    }
                }
            ]
        },
        "treatReagentBarcodePattern": {
            "and": [
                {
                    "name": {
                        "like": "RNA%E%"
                    }
                },
                {
                    "name": {
                        "like": "%M%"
                    }
                }
            ]
        },
        "ctrlNullBarcodePattern": {
            "and": [
                {
                    "name": {
                        "like": "L4440%E%"
                    }
                },
                {
                    "name": {
                        "nlike": "%M%"
                    }
                }
            ]
        },
        "ctrlStrainBarcodePattern": {
            "and": [
                {
                    "name": {
                        "like": "L4440%E%"
                    }
                },
                {
                    "name": {
                        "like": "%M%"
                    }
                }
            ]
        }
    },
    "biosamples": {
        "experimentBiosample": {
            "id": "5",
            "name": "mel-28"
        },
        "ctrlBiosample": {
            "id": "4",
            "name": "N2"
        }
    }
};
// Default restrictive search configuration
var defaultRestrictiveSearchConfigurations = {
    "barcodeSearches": {
        "ctrlReagentBarcodePattern": {
            "and": [
                {
                    "name": {
                        "like": "RNA%S%"
                    }
                },
                {
                    "name": {
                        "nlike": "%M%"
                    }
                }
            ]
        },
        "treatReagentBarcodePattern": {
            "and": [
                {
                    "name": {
                        "like": "RNA%S%"
                    }
                },
                {
                    "name": {
                        "like": "%M%"
                    }
                }
            ]
        },
        "ctrlNullBarcodePattern": {
            "and": [
                {
                    "name": {
                        "like": "L4440%S%"
                    }
                },
                {
                    "name": {
                        "nlike": "%M%"
                    }
                }
            ]
        },
        "ctrlStrainBarcodePattern": {
            "and": [
                {
                    "name": {
                        "like": "L4440%S%"
                    }
                },
                {
                    "name": {
                        "like": "%M%"
                    }
                }
            ]
        }
    },
    "biosamples": {
        "experimentBiosample": {
            "id": "5",
            "name": "mel-28"
        },
        "ctrlBiosample": {
            "id": "4",
            "name": "N2"
        }
    }
};
/**
 * The mel-28 screens were the first set of screens that were done
 * There are a lot of inconsistencies with barcodes
 * So there is quite a bit of customization to this template per batch, which wasn't explicitly recorded
 * The plates per batch are always recorded both in the chemgen mysql db and in the mongodb under the expWorkflow collection
 */
// let melPP = cloneDeep(defaultPermissiveSearchConfigurations);
var melPPScreen = lodash_1.find(screens, { screenId: 1 });
var melPP = createBarcodeConfigurations('E', 'M', 5, 'mel-28');
melPP['screenName'] = melPPScreen['screenName'];
melPP['screenId'] = melPPScreen['screenId'];
melPP['screenMoniker'] = melPPScreen['screenMoniker'];
melPP['screenType'] = melPPScreen['screenType'];
// let melPR = cloneDeep(defaultRestrictiveSearchConfigurations);
var melPRScreen = lodash_1.find(screens, { screenId: 2 });
var melPR = createBarcodeConfigurations('S', 'M', 5, 'mel-28');
melPR['screenName'] = melPRScreen['screenName'];
melPR['screenId'] = melPRScreen['screenId'];
melPR['screenMoniker'] = melPRScreen['screenMoniker'];
melPR['screenType'] = melPRScreen['screenType'];
var mipBiosample = lodash_1.find(experimentBiosamples, { id: 6 });
// mipPR['biosamples']['experimentBiosample']['id'] = mipBiosample['id'];
// mipPR['biosamples']['experimentBiosample']['name'] = mipBiosample['name'];
var mipPRScreen = lodash_1.find(screens, { screenId: 3 });
var mipPR = createBarcodeConfigurations('S', 'M', mipBiosample['id'], mipBiosample['name']);
mipPR['screenName'] = mipPRScreen['screenName'];
mipPR['screenId'] = mipPRScreen['screenId'];
mipPR['screenMoniker'] = mipPRScreen['screenMoniker'];
mipPR['screenType'] = mipPRScreen['screenType'];
// let mipPP: any = cloneDeep(defaultRestrictiveSearchConfigurations);
var mipPPScreen = lodash_1.find(screens, { screenId: 4 });
var mipPP = createBarcodeConfigurations('E', 'M', mipBiosample['id'], mipBiosample['name']);
mipPP['screenName'] = mipPPScreen['screenName'];
mipPP['screenId'] = mipPPScreen['screenId'];
mipPP['screenMoniker'] = mipPPScreen['screenMoniker'];
mipPP['screenType'] = mipPPScreen['screenType'];
var crbBiosample = lodash_1.find(experimentBiosamples, { id: 8 });
// let crbPP: any = cloneDeep(defaultRestrictiveSearchConfigurations);
var crbPP = createBarcodeConfigurations('', 'vi', crbBiosample['id'], crbBiosample['name']);
var crbPPScreen = lodash_1.find(screens, { screenId: 13 });
crbPP['screenName'] = crbPPScreen['screenName'];
crbPP['screenId'] = crbPPScreen['screenId'];
crbPP['screenMoniker'] = crbPPScreen['screenMoniker'];
crbPP['screenType'] = crbPPScreen['screenType'];
// let lglPP: any = cloneDeep(defaultRestrictiveSearchConfigurations);
var lglBiosample = lodash_1.find(experimentBiosamples, { id: 7 });
var lglPP = createBarcodeConfigurations('', 'am', lglBiosample['id'], lglBiosample['name']);
var lglPPScreen = lodash_1.find(screens, { screenId: 12 });
lglPP['screenName'] = lglPPScreen['screenName'];
lglPP['screenId'] = lglPPScreen['screenId'];
lglPP['screenMoniker'] = lglPPScreen['screenMoniker'];
lglPP['screenType'] = lglPPScreen['screenType'];
console.log('hello');
var configs = [mipPP, mipPR, melPP, melPR, crbPP, lglPP];
// let configs = [melPR];
Promise.map(configs, function (config) {
    //for now we only have one search config per screenId
    return app.models.PlateSearchConfiguration
        .findOrCreate({ where: { screenMoniker: config.screenMoniker } }, config)
        .then(function (results) {
        return results[0];
    })
        .catch(function (error) {
        return new Error(error);
    });
})
    .then(function (results) {
    console.log(results);
})
    .catch(function (error) {
    console.log(error);
});
//# sourceMappingURL=create_plate_search_configs.js.map