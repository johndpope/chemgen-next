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
var lodash_1 = require("lodash");
var lodash_decorators_1 = require("lodash-decorators");
var ExpsetModule = /** @class */ (function () {
    function ExpsetModule(expSets) {
        var _this = this;
        this.expSetsDeNorm = [];
        this.expSets = expSets;
        if (lodash_1.isArray(this.expSets.expWorkflows)) {
            this.expSets.expWorkflows = this.expSets.expWorkflows.map(function (expWorkflow) {
                return _this.findExpWorkflow(String(expWorkflow.id));
            });
        }
    }
    ExpsetModule.prototype.findExpWorkflow = function (expWorkflowId) {
        var expWorkflow = lodash_1.find(this.expSets.expWorkflows, function (expWorkflow) {
            return lodash_1.isEqual(expWorkflowId, expWorkflow.id);
        });
        if (lodash_1.get(expWorkflow, ["temperature", "$numberDouble"])) {
            expWorkflow.temperature = expWorkflow.temperature["$numberDouble"];
        }
        return expWorkflow;
    };
    ExpsetModule.prototype.findExpManualScores = function (treatmentGroupId) {
        var objects = this.expSets.expManualScores.filter(function (expManualScore) {
            return lodash_1.isEqual(expManualScore.treatmentGroupId, treatmentGroupId);
        });
        //This should really be taken care of on the server side
        objects = lodash_1.uniqWith(objects, lodash_1.isEqual);
        return lodash_1.orderBy(objects, 'manualscoreValue', 'desc');
    };
    ExpsetModule.prototype.findExpPlates = function (expWorkflowId) {
        var expPlates = this.expSets.expPlates.filter(function (expPlate) {
            return lodash_1.isEqual(expWorkflowId, expPlate.expWorkflowId);
        });
        return lodash_1.orderBy(expPlates, 'barcode');
    };
    ExpsetModule.prototype.findExpScreen = function (screenId) {
        return lodash_1.find(this.expSets.expScreens, function (screen) {
            return lodash_1.isEqual(screenId, screen.screenId);
        });
    };
    ExpsetModule.prototype.getTreatmentGroupIdFromDesign = function (expGroupId) {
        return this.expSets.expSets.filter(function (expSet) {
            return expSet.filter(function (expDesignRow) {
                return lodash_1.isEqual(expGroupId, expDesignRow.treatmentGroupId) || lodash_1.isEqual(expGroupId, expDesignRow.controlGroupId);
            })[0];
        })[0];
    };
    ExpsetModule.prototype.findModelPredictedCounts = function (treatmentGroupId) {
        return this.expSets.modelPredictedCounts.filter(function (counts) {
            return lodash_1.isEqual(counts.treatmentGroupId, treatmentGroupId);
        });
    };
    ExpsetModule.prototype.findExpSets = function (treatmentGroupId) {
        return this.expSets.expSets.filter(function (expSet) {
            return lodash_1.isEqual(treatmentGroupId, expSet[0].treatmentGroupId);
        })[0];
    };
    ExpsetModule.prototype.findAlbums = function (treatmentGroupId) {
        return this.expSets.albums.filter(function (album) {
            return lodash_1.isEqual(treatmentGroupId, album.treatmentGroupId);
        })[0];
    };
    ExpsetModule.prototype.findExpAssay2reagents = function (expGroupId) {
        return this.expSets.expAssay2reagents.filter(function (expAssay2reagent) {
            return lodash_1.isEqual(expGroupId, expAssay2reagent.expGroupId);
        });
    };
    ExpsetModule.prototype.findReagents = function (treatmentGroupId) {
        var _this = this;
        var expAssay2reagents = this.expSets.expAssay2reagents.filter(function (expAssay2reagent) {
            return lodash_1.isEqual(Number(expAssay2reagent.treatmentGroupId), Number(treatmentGroupId));
        });
        var rnaisList = [];
        var compoundsList = [];
        expAssay2reagents.map(function (expAssay2reagent) {
            if (expAssay2reagent.reagentTable.match('Rnai')) {
                _this.expSets.rnaisList.filter(function (rnai) {
                    return lodash_1.isEqual(rnai.libraryId, expAssay2reagent.libraryId) && lodash_1.isEqual(rnai.rnaiId, expAssay2reagent.reagentId);
                }).map(function (rnai) {
                    rnaisList.push(rnai);
                });
                if (rnaisList.length) {
                    rnaisList = lodash_1.uniqBy(rnaisList, 'rnaiId');
                }
                rnaisList.map(function (rnai) {
                    rnai['xrefs'] = _this.expSets.rnaisXrefs.filter(function (rnaiXref) {
                        return lodash_1.isEqual(rnaiXref.wbGeneSequenceId, rnai.geneName);
                    });
                });
            }
            else if (expAssay2reagent.reagentTable.match('Chem')) {
                _this.expSets.compoundsList.filter(function (compound) {
                    return lodash_1.isEqual(compound.compoundId, expAssay2reagent.reagentId);
                }).map(function (compound) {
                    compoundsList.push(compound);
                });
                if (compoundsList.length) {
                    compoundsList = lodash_1.uniqBy(compoundsList, 'compoundId');
                    compoundsList.map(function (compound) {
                        //For now we don't have any xrefs - so this is just a placeholder
                        compound['xref'] = [];
                    });
                }
            }
        });
        return { rnaisList: rnaisList, compoundsList: compoundsList };
    };
    /**
     * The data structure that is returned from the server is very flattened and normalized to save on size
     * We denormalize it here
     */
    ExpsetModule.prototype.deNormalizeExpSets = function () {
        var _this = this;
        this.expSetsDeNorm = this.expSets.albums.map(function (album) {
            return _this.deNormalizeAlbum(album);
        });
        return this.expSetsDeNorm;
    };
    //TO DO This is basically the same thing as the getExpSet function - fix that
    ExpsetModule.prototype.deNormalizeAlbum = function (album) {
        var expWorkflow = this.findExpWorkflow(album.expWorkflowId);
        var expScreen = this.findExpScreen(expWorkflow.screenId);
        var expPlates = this.findExpPlates(album.expWorkflowId);
        var reagentsList = this.findReagents(album.treatmentGroupId);
        var expManualScores = this.findExpManualScores(album.treatmentGroupId);
        album.expWorkflow = expWorkflow;
        album.expSet = this.findExpSets(album.treatmentGroupId);
        //I cannot figure out why this isn't taken care of on the backend
        ['ctrlNullImages', 'ctrlStrainImages'].map(function (ctrlKey) {
            if (lodash_1.get(album, ctrlKey)) {
                album[ctrlKey] = lodash_1.shuffle(album[ctrlKey]).slice(0, 4);
            }
        });
        return {
            treatmentGroupId: album.treatmentGroupId,
            albums: album,
            expWorkflow: expWorkflow,
            expSet: album.expSet,
            expScreen: expScreen,
            rnaisList: reagentsList.rnaisList,
            compoundsList: reagentsList.compoundsList,
            expPlates: expPlates,
            expManualScores: expManualScores,
        };
    };
    // TODO Fix this - it assumes there are counts
    ExpsetModule.prototype.getExpSet = function (wellCounts) {
        var o = {};
        o.expWorkflow = this.findExpWorkflow(wellCounts.expWorkflowId);
        o.expScreen = this.findExpScreen(wellCounts.screenId);
        var treatmentGroupId = wellCounts.treatmentGroupId;
        if (!treatmentGroupId) {
            var expSet = this.getTreatmentGroupIdFromDesign(wellCounts.expGroupId);
            if (expSet) {
                treatmentGroupId = expSet[0].treatmentGroupId;
                wellCounts.treatmentGroupId = treatmentGroupId;
            }
        }
        if (treatmentGroupId) {
            o.modelPredictedCounts = this.findModelPredictedCounts(treatmentGroupId);
            o.expSets = this.findExpSets(treatmentGroupId);
            o.albums = this.findAlbums(treatmentGroupId);
            o.expPlates = this.findExpPlates(o.expWorkflow.id);
            o.expManualScores = this.findExpManualScores(treatmentGroupId);
            o.treatmentGroupId = treatmentGroupId;
            var reagentsList = this.findReagents(treatmentGroupId);
            o.rnaisList = reagentsList.rnaisList;
            o.compoundsList = reagentsList.compoundsList;
        }
        else {
            o.modelPredictedCounts = [];
            o.expSets = [];
            o.albums = {};
        }
        ['ctrlNullImages', 'ctrlStrainImages'].map(function (ctrlKey) {
            if (lodash_1.get(o.albums, ctrlKey)) {
                o.albums[ctrlKey] = lodash_1.shuffle(o.albums[ctrlKey]).slice(0, 4);
            }
        });
        return o;
    };
    ExpsetModule.prototype.createAlbum = function (expSetAlbums, albumName, images) {
        expSetAlbums[albumName] = images.map(function (image) {
            if (image) {
                return {
                    src: "http://onyx.abudhabi.nyu.edu/images/" + image + "-autolevel.jpeg",
                    caption: "Image " + image + " caption here",
                    thumb: "http://onyx.abudhabi.nyu.edu/images/" + image + "-autolevel.jpeg",
                };
            }
        }).filter(function (t) {
            return t;
        });
        return expSetAlbums;
    };
    __decorate([
        lodash_decorators_1.Memoize()
    ], ExpsetModule.prototype, "findExpWorkflow", null);
    __decorate([
        lodash_decorators_1.Memoize()
    ], ExpsetModule.prototype, "findExpManualScores", null);
    __decorate([
        lodash_decorators_1.Memoize()
    ], ExpsetModule.prototype, "findExpPlates", null);
    __decorate([
        lodash_decorators_1.Memoize()
    ], ExpsetModule.prototype, "findExpScreen", null);
    __decorate([
        lodash_decorators_1.Memoize()
    ], ExpsetModule.prototype, "getTreatmentGroupIdFromDesign", null);
    __decorate([
        lodash_decorators_1.Memoize()
    ], ExpsetModule.prototype, "findModelPredictedCounts", null);
    __decorate([
        lodash_decorators_1.Memoize()
    ], ExpsetModule.prototype, "findExpSets", null);
    __decorate([
        lodash_decorators_1.Memoize()
    ], ExpsetModule.prototype, "findAlbums", null);
    __decorate([
        lodash_decorators_1.Memoize()
    ], ExpsetModule.prototype, "findExpAssay2reagents", null);
    __decorate([
        lodash_decorators_1.Memoize()
    ], ExpsetModule.prototype, "findReagents", null);
    ExpsetModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule
            ],
            declarations: []
        })
        //TODO GET RID OF THIS ITS IN THE custom types now!!
    ], ExpsetModule);
    return ExpsetModule;
}());
exports.ExpsetModule = ExpsetModule;
//# sourceMappingURL=expset.module.js.map