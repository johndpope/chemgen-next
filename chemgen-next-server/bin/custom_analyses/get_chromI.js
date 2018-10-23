#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../../server/server');
// import {WorkflowModel} from "../../common/models";
var Promise = require("bluebird");
var models_1 = require("../../common/types/sdk/models");
var Papa = require("papaparse");
var lodash_1 = require("lodash");
var lodash_2 = require("lodash");
var path = require('path');
var fs = require('fs');
var genesFile = path.resolve(__dirname, 'complete_gene_list.csv');
var chrom1 = [];
var genes = [];
var orig = [];
// TODO - This needs to be reworked
// TODO - ExpGroup no longer has reagentId (should have never had reagentId)
// TODO - Need to instead get them straight from assay2Reagent table
/***
 * WIP
 * This is a custom analysis, that is a getting turned into an interface
 * This particular analysis got a list of genes, and gets them across screens, and then ranks them (I hope).
 * Another way to do this would be to manualScoresAdvancedQuery by a screen, and say 'whats interesting' here.
 * For custom analyses like this - I want to set up a mongodb collection, where we can just stick stuff
 * Assign it an ID and stick it in a dashboard
 ***/
parseGenesFile();
function parseGenesFile() {
    Papa.parse(fs.createReadStream(genesFile), {
        header: true,
        step: function (results, parser) {
            orig.push(results.data[0]);
            if (results.data[0]['Gene name']) {
                genes.push(results.data[0]['Gene name']);
            }
        },
        complete: function () {
            genes = lodash_1.uniq(genes);
            // genes = shuffle(genes);
            // genes = slice(genes, 0, 20);
            getGeneXRefs(genes);
        },
    });
}
function getGeneXRefs(genes) {
    console.log('In getGeneXrefs');
    var or = [];
    genes.map(function (gene) {
        or.push({ wbGeneSequenceId: gene });
        or.push({ wbGeneCgcName: gene });
    });
    return new Promise(function (resolve, reject) {
        app.models.RnaiWormbaseXrefs
            .find({ where: { or: or } })
            .then(function (results) {
            console.log("RNAi XRefs Count: " + results.length);
            return getFromGeneLibrary(genes, results);
        })
            .then(function (results) {
            results = JSON.parse(JSON.stringify(results));
            // contactSheetResults = slice(contactSheetResults, 0, 5);
            // let csv = Papa.unparse(contactSheetResults);
            // fs.writeFileSync(path.resolve(__dirname,'chromI_list.csv'), csv);
            //TODO Split this manualScoresAdvancedQuery
            return getExpDesign(results);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function getBioSamples(data) {
    return new Promise(function (resolve, reject) {
        app.models.ExpBiosample.find()
            .then(function (results) {
            data.expBiosamples = results;
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function getScreens(data) {
    return new Promise(function (resolve, reject) {
        app.models.ExpScreen.find()
            .then(function (results) {
            data.expScreens = results;
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function getExpAssays(data) {
    var screens = [3, 4, 7, 8];
    var or = [];
    //TODO Include Screens here!
    // and: [
    //   {reagentId: geneRow.rnaiId},
    //   {libraryId: 1},
    //   {or: [{screenId: 3}, {screenId: 4}, {screenId: 7}, {screenId: 8}]}
    // ]
    data.expDesigns.map(function (expDesignSet) {
        if (!lodash_1.isNull(expDesignSet) && !lodash_1.isEmpty(expDesignSet)) {
            expDesignSet.map(function (expDesignRow) {
                var obj = { expGroupId: expDesignRow.treatmentGroupId };
                or.push(obj);
                obj = { expGroupId: expDesignRow.controlGroupId };
                or.push(obj);
            });
        }
    });
    return new Promise(function (resolve, reject) {
        //TODO Also get includeCounts!
        //TODO Paginate
        //TODO Include statement does not work for belongsTo - figure out correct way to manualScoresAdvancedQuery this
        app.models.ExpAssay
            .find({
            where: { or: or },
            include: ['expAssay2reagent', 'modelPredictedCounts'],
        })
            .then(function (results) {
            //TODO Randomly choose subset of ctrls
            results = JSON.parse(JSON.stringify(results));
            console.log("ExpAssay Results Count: " + results.length);
            data['expAssays'] = results;
            resolve(data);
        })
            .catch(function (error) {
            console.log('rejecting getExpAssays');
            reject(new Error(error));
        });
    });
}
/**
 * Remove null expAssays and group by reagent_type (treat_rnai, ctrl_rnai, ctrl_strain, ctrl_null)
 * @param {ExpAssayResultSet[]} expAssays
 * @returns {"../index".Dictionary<ExpAssayResultSet[]>}
 */
function trimAssays(expAssays) {
    expAssays = lodash_1.filter(expAssays, function (expAssay) {
        return !lodash_1.isNull(expAssays) && lodash_1.get(expAssay, 'expAssay2reagent[0]');
    });
    var groups = lodash_1.groupBy(expAssays, function (expAssay) {
        if (lodash_1.get(expAssay, 'expAssay2reagent[0].reagentType')) {
            //@ts-ignore
            return expAssay.expAssay2reagent[0].reagentType;
        }
    });
    groups.ctrl_null = lodash_1.slice(lodash_1.shuffle(groups.ctrl_null), 0, 4);
    groups.ctrl_strain = lodash_1.slice(lodash_1.shuffle(groups.ctrl_strain), 0, 4);
    return groups;
}
function getCountAnalytics(data) {
    console.log('In getCount!');
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        Promise.map(data.expSets, function (expSet) {
            // let treat_rnais = expSet.expAssays.treat_rnai;
            // let ctrl_rnais = expSet.expAssays.ctrl_rnai;
            var treatPercEmbLeths = [];
            try {
                treatPercEmbLeths = expSet.expAssays.treat_rnai.filter(function (treat_rnai) {
                    return lodash_1.get(treat_rnai, 'modelPredictedCounts[0].percEmbLeth');
                }).map(function (treat_rnai) {
                    //@ts-ignore
                    return treat_rnai.modelPredictedCounts[0].percEmbLeth;
                });
            }
            catch (error) {
                console.log(error);
                return new Error(error);
            }
            var ctrlPercEmbLeths = [];
            try {
                ctrlPercEmbLeths = expSet.expAssays.ctrl_rnai.filter(function (ctrl_rnai) {
                    return lodash_1.get(ctrl_rnai, 'modelPredictedCounts[0].percEmbLeth');
                }).map(function (ctrl_rnai) {
                    //@ts-ignore
                    return ctrl_rnai.modelPredictedCounts[0].percEmbLeth;
                });
            }
            catch (error) {
                console.log(error);
                console.log(JSON.stringify(expSet));
                return new Error(error);
            }
            var diffs = [];
            var rank = new models_1.ModelPredictedRankResultSet({
                treatmentGroupId: expSet.expDesigns[0].treatmentGroupId,
                modelId: 4,
                screenId: expSet.expAssays.treat_rnai[0].screenId,
                expWorkflowId: expSet.expAssays.treat_rnai[0].expWorkflowId,
            });
            treatPercEmbLeths.map(function (treatPercEmbLeth) {
                ctrlPercEmbLeths.map(function (ctrlPercEmbLeth) {
                    diffs.push(Math.abs(lodash_2.subtract(Number(treatPercEmbLeth), Number(ctrlPercEmbLeth))));
                });
            });
            diffs = diffs.filter(function (diff) {
                return !lodash_1.isNull(diff);
            });
            rank.minDifference = lodash_2.floor(lodash_2.min(diffs), 2);
            rank.maxDifference = lodash_2.floor(lodash_2.max(diffs), 2);
            rank.avgDifference = lodash_2.floor(lodash_2.mean(diffs), 2);
            expSet.analysis = rank;
            return expSet;
        })
            .then(function (expSets) {
            expSets = lodash_2.sortBy(expSets, function (expSet) {
                return expSet.analysis.maxDifference;
            });
            expSets = lodash_2.reverse(expSets);
            data.expSets = expSets;
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function makeInterfaces(data) {
    return new Promise(function (resolve, reject) {
        // let goToTheWebz: RnaiExpSetResult[] = [];
        var goToTheWebz = data.expSets.map(function (expSet) {
            return new RnaiExpSetResult({
                gene: expSet.gene,
                rank: expSet.analysis,
                treat_rnai_counts: expSet.expAssays.treat_rnai.map(function (expAssay) {
                    return lodash_1.pick(expAssay['modelPredictedCounts'][0], ['assayId', 'assayImagePath', 'wormCount', 'larvaCount', 'eggCount', 'percEmbLeth', 'percSter', 'broodSize']);
                }),
                ctrl_rnai_counts: expSet.expAssays.ctrl_rnai.map(function (expAssay) {
                    return lodash_1.pick(expAssay['modelPredictedCounts'][0], ['assayId', 'assayImagePath', 'wormCount', 'larvaCount', 'eggCount', 'percEmbLeth', 'percSter', 'broodSize']);
                }),
                ctrl_strain_counts: expSet.expAssays.ctrl_strain.map(function (expAssay) {
                    return lodash_1.pick(expAssay['modelPredictedCounts'][0], ['assayId', 'assayImagePath', 'wormCount', 'larvaCount', 'eggCount', 'percEmbLeth', 'percSter', 'broodSize']);
                    // return expAssay['modelPredictedCounts'][0];
                }),
                ctrl_null_counts: expSet.expAssays.ctrl_null.map(function (expAssay) {
                    return lodash_1.pick(expAssay['modelPredictedCounts'][0], ['assayId', 'assayImagePath', 'wormCount', 'larvaCount', 'eggCount', 'percEmbLeth', 'percSter', 'broodSize']);
                    // return expAssay['modelPredictedCounts'][0];
                }),
                treat_rnai_image_paths: expSet.expAssays.treat_rnai.map(function (expAssay) {
                    return expAssay.assayImagePath;
                }),
                ctrl_rnai_image_paths: expSet.expAssays.ctrl_rnai.map(function (expAssay) {
                    return expAssay.assayImagePath;
                }),
                ctrl_strain_image_paths: expSet.expAssays.ctrl_strain.map(function (expAssay) {
                    return expAssay.assayImagePath;
                }),
                ctrl_null_image_paths: expSet.expAssays.ctrl_null.map(function (expAssay) {
                    return expAssay.assayImagePath;
                }),
            });
        });
        lodash_1.slice(goToTheWebz, 0, 50).map(function (webz) {
            console.log(JSON.stringify(webz.rank, null, 2));
        });
        var name = 'mip-1;mip-2 chr1 proteomics downstream analysis';
        var createObj = {
            name: name,
            code: lodash_1.camelCase(name),
            description: 'This is a downstream analysis done that was then analysed in mip-1;mip-2 screens',
        };
        app.models.Analysis
            .findOrCreate({
            where: {
                and: [
                    { name: createObj.name },
                    { code: createObj.code },
                    { description: createObj.description },
                ],
            },
        }, createObj)
            .then(function (analysisResults) {
            analysisResults[0].contactSheetResults = goToTheWebz;
            analysisResults[0].dateModified = Date.now();
            if (lodash_1.isEqual(analysisResults[1], false)) {
                analysisResults[0].dateCreated = Date.now();
            }
            return app.models.Analysis
                .upsert(analysisResults[0]);
        })
            .then(function (results) {
            console.log(JSON.stringify(results));
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function prepareInterfaces(genesList, data) {
    console.log('In prepareInterfaces');
    var expSets = [];
    var screens = [3, 4, 7, 8];
    //Split by Screen
    data.expDesigns.map(function (expDesigns) {
        if (!lodash_1.isNull(expDesigns) && !lodash_1.isEmpty(expDesigns)) {
            var expAssays = lodash_1.filter(data.expAssays, function (expAssay) {
                return lodash_1.find(expDesigns, function (expDesign) {
                    return lodash_1.isEqual(Number(expAssay.expGroupId), Number(expDesign.controlGroupId)) ||
                        lodash_1.isEqual(Number(expAssay.expGroupId), Number(expDesign.treatmentGroupId));
                });
            });
            // TODO - Update this to get the gene from the ExpAssay2reagent resultSet
            //Get the gene
            var treatmentGroup_1 = expDesigns[0].treatmentGroupId;
            var expGroup_1 = lodash_1.find(data.expGroups, function (expGroup) {
                return lodash_1.isEqual(Number(expGroup.expGroupId), Number(treatmentGroup_1));
            });
            //This is only applicable for a given list of genes - if just going over an entire screen
            //We will have to fetch the screen
            // TODO - UPDATE THIS - there can also be MORE THAN 1 gene
            var gene = lodash_1.find(genesList, function (geneRow) {
                //@ts-ignore
                return lodash_1.isEqual(expGroup_1.reagentId, geneRow.rnaiId);
            });
            var trimmedAssays = trimAssays(expAssays);
            expSets.push(new RnaiExpSet({ expAssays: trimmedAssays, expDesigns: expDesigns, gene: gene }));
        }
    });
    delete data.expGroups;
    delete data.expDesigns;
    delete data.expAssays;
    data.expSets = expSets;
    return new Promise(function (resolve, reject) {
        resolve(data);
    });
}
/**
 * WIP - This will have to be reworked to reflect changes in the ExpGroup table
 * Instead of searching from the ExpGroup, we should search from ExpAssay2reagent
 * @param {RnaiLibraryResultSet} genesList
 */
function getExpDesign(genesList) {
    console.log('In getExpDesign');
    var or = [];
    // TODO This is going to have to be updated when ExpGroup
    // Is fixed to incorporate more than 1 gene
    genesList.map(function (geneRow) {
        var obj = {
            and: [
                { reagentId: geneRow.rnaiId },
                { libraryId: 1 },
                { or: [{ screenId: 3 }, { screenId: 4 }, { screenId: 7 }, { screenId: 8 }] }
            ]
        };
        or.push(obj);
    });
    //TODO This is a bit stupid - we get the ExpAssay2reagent,
    //Get the expGroups, then toss, then get them later with the expAssays
    //TODO What should be done is to get the expAssay2reagents, expAssays, and the Counts all in 1 fell swoop
    return new Promise(function (resolve, reject) {
        var data = {};
        app.models.ExpAssay2reagent
            .find({ where: { or: or }, fields: { expGroupId: true, assayId: true, reagentId: true, libraryId: true } })
            .then(function (results) {
            //This is a hack until the expAssay2reagent table update finishes
            // let expGroupIds = contactSheetResults.map((expAssay2reagent: ExpAssay2reagentResultSet) => {
            //   console.log(JSON.stringify(expAssay2reagent));
            //   return {expGroupId: expAssay2reagent.expGroupId};
            // });
            var expAssayIds = results.map(function (expAssay2reagent) {
                return { assayId: expAssay2reagent.assayId };
            });
            return app.models.ExpAssay.find({ where: { or: expAssayIds }, fields: { expGroupId: true } });
        })
            .then(function (results) {
            var expGroupIds = results.map(function (expAssay) {
                return { expGroupId: expAssay.expGroupId };
            });
            return app.models.ExpGroup.find({ where: { or: expGroupIds } });
        })
            .then(function (results) {
            return getExpSets(data, results);
        })
            .then(function (results) {
            //TODO These should be UP
            console.log('getBiosamples');
            return getBioSamples(results);
        })
            .then(function (results) {
            console.log('getScreens');
            return getScreens(results);
        })
            .then(function (results) {
            console.log('getExpAssays');
            return getExpAssays(results);
        })
            .then(function (results) {
            return prepareInterfaces(genesList, results);
        })
            .then(function (results) {
            return getCountAnalytics(results);
        })
            .then(function (results) {
            return makeInterfaces(results);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function getScreenData() {
    var data = {};
    return new Promise(function (resolve, reject) {
        getScreens(data)
            .then(function (results) {
            return getBioSamples(results);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function getExpSets(data, expGroups) {
    console.log('In getExpSets');
    var or = [];
    expGroups.map(function (expGroup) {
        var obj = { treatmentGroupId: expGroup.expGroupId };
        or.push(obj);
        obj = { controlGroupId: expGroup.expGroupId };
        or.push(obj);
    });
    return new Promise(function (resolve, reject) {
        console.log("Getting exp Sets of : " + expGroups.length);
        app.models.ExpDesign
            .find({ where: { or: or } })
            .then(function (results) {
            var groups = lodash_1.groupBy(results, 'treatmentGroupId');
            var expDesignSets = [];
            Object.keys(groups).map(function (group) {
                var t = [];
                groups[group].map(function (expDesignRow) {
                    t.push(expDesignRow);
                });
                expDesignSets.push(t);
            });
            data.expGroups = expGroups;
            data.expDesigns = expDesignSets;
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function getFromGeneLibrary(genesList, geneXrefs) {
    console.log('In getFromGeneLibrary');
    var or = [];
    geneXrefs.map(function (geneXref) {
        var obj = {
            and: [
                { geneName: geneXref.wbGeneSequenceId },
                { chrom: 'I' },
            ]
        };
        or.push(obj);
    });
    return new Promise(function (resolve, reject) {
        app.models.RnaiLibrary
            .find({ where: { or: or } })
            .then(function (results) {
            console.log('Returning from RNAi Library');
            results.map(function (result) {
                var geneXref = lodash_1.find(geneXrefs, function (geneXref) {
                    return lodash_1.isEqual(geneXref.wbGeneSequenceId, result.geneName);
                });
                result['wbGeneCgcName'] = geneXref.wbGeneCgcName;
                var origGene = lodash_1.find(orig, function (row) {
                    return lodash_1.isEqual(row['Gene name'], result.geneName) || lodash_1.isEqual(row['Gene name'], geneXref.wbGeneCgcName);
                });
                result['Annotation'] = origGene['Annotation'];
                result['Name'] = origGene['Gene name'];
            });
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
var parseGenesRow = function (row) {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};
var Object;
var RnaiExpSetResult = /** @class */ (function () {
    function RnaiExpSetResult(data) {
        //@ts-ignore
        Object.assign(this, data);
    }
    return RnaiExpSetResult;
}());
var RnaiExpSet = /** @class */ (function () {
    function RnaiExpSet(data) {
        //@ts-ignore
        Object.assign(this, data);
    }
    return RnaiExpSet;
}());
exports.RnaiExpSet = RnaiExpSet;
//# sourceMappingURL=get_chromI.js.map