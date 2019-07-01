"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var models_1 = require("../../../types/sdk/models");
var lodash_1 = require("lodash");
/**
 * This has some helper classes and utilities for uploading screens
 * All screens have a primary id, an associated library, 1 or more biosamples, 1 or more assay dates
 * Along with some plates
 */
/**
 * This is just a helper class to expSetSearch for biosamples, mostly to return them to the screen upload form
 */
var SearchExpBiosamples = /** @class */ (function () {
    function SearchExpBiosamples(expBiosampleApi) {
        this.expBiosampleApi = expBiosampleApi;
        this.allBiosamples = [];
    }
    SearchExpBiosamples.prototype.searchSamples = function () {
        var _this = this;
        this.expBiosampleApi
            .find()
            .toPromise()
            .then(function (expBiosamples) {
            _this.allBiosamples = expBiosamples;
            _this.ctrlBiosample = lodash_1.find(_this.allBiosamples, { biosampleName: 'N2' });
        })
            .catch(function (error) {
            console.log(JSON.stringify(error));
        });
    };
    SearchExpBiosamples.prototype.setDefaultCtrlBiosample = function () {
    };
    return SearchExpBiosamples;
}());
exports.SearchExpBiosamples = SearchExpBiosamples;
var ExperimentData = /** @class */ (function () {
    function ExperimentData(reagentLibraryApi, expScreenApi, libraryType) {
        this.reagentLibraryApi = reagentLibraryApi;
        this.expScreenApi = expScreenApi;
        this.libraryType = libraryType;
        this.comment = '';
        this.expScreens = [];
        this.libraries = [];
        this.assayDates = [new Date()];
        this.searchLibraries();
        this.searchScreens();
    }
    ExperimentData.prototype.searchLibraries = function () {
        var _this = this;
        this.reagentLibraryApi
            .find({ where: { libraryType: this.libraryType } })
            .toPromise()
            .then(function (results) {
            _this.libraries = results;
        })
            .catch(function (error) {
            return new Error(error);
        });
    };
    ExperimentData.prototype.searchScreens = function () {
        var _this = this;
        this.expScreenApi
            .find()
            .toPromise()
            .then(function (results) {
            _this.expScreens = results;
        })
            .catch(function (error) {
            return new Error(error);
        });
    };
    // Transform
    ExperimentData.prototype.addEmptyDate = function () {
        this.assayDates.push(this.assayDates[this.assayDates.length - 1]);
    };
    // Transform
    ExperimentData.prototype.removeDate = function (index) {
        if (index > -1) {
            this.assayDates.splice(index, 1);
        }
    };
    return ExperimentData;
}());
exports.ExperimentData = ExperimentData;
var ScreenDesign = /** @class */ (function () {
    function ScreenDesign(plateApi) {
        this.plateApi = plateApi;
        /* Search for Plates */
        this.creationDates = [new Date()];
        // The name expSetSearch parameter is created with these
        this.conditionCode = '';
        this.libraryPlate = '';
        this.collapse = false;
        this.searchNamePatterns = [];
        /* Place plates in appropriate conditions */
        /* This is mostly done in the screen specific logic, but there are a few placeholders here to grab the plates */
        this.plates = [];
        this.replicates = {};
        this.submitted = false;
    }
    ScreenDesign.prototype.pushReplicate = function (plate, index) {
        if (!this.replicates.hasOwnProperty(index + 1)) {
            this.replicates[index + 1] = [];
        }
        this.replicates[index + 1].push(plate.csPlateid);
    };
    // Shared logic among screens
    // Load
    ScreenDesign.prototype.getPlates = function () {
        var _this = this;
        var dates = [];
        this.creationDates.map(function (date) {
            var month;
            month = date.getMonth() + 1;
            month = lodash_1.padStart(String(month), 2, '0');
            var day;
            day = date.getDate();
            day = lodash_1.padStart(String(day), 2, '0');
            dates.push({ creationdate: date.getFullYear() + "-" + month + "-" + day });
        });
        var searchNames = this.searchNamePatterns.map(function (name) {
            return { name: { like: name } };
        });
        var where = {
            and: [
                {
                    or: searchNames,
                },
                {
                    or: dates,
                }
            ]
        };
        this.plateApi.find({
            where: where,
            limit: 100,
            fields: {
                csPlateid: true,
                id: true,
                name: true,
                platebarcode: true,
                creationdate: true,
                imagepath: true
            }
        })
            .toPromise()
            .then(function (plates) {
            // this.plates = plates;
            _this.plates = JSON.parse(JSON.stringify(plates));
            plates.map(function (plate) {
                plate['instrumentPlateId'] = plate.csPlateid;
            });
            _this.plates = _this.sortPlates();
        })
            .catch(function (error) {
            console.log(JSON.stringify(error));
        });
    };
    // This is only a placeholder
    // It should be filled in by the logic per screen
    ScreenDesign.prototype.sortPlates = function () {
        return this.plates;
    };
    /* Transform */
    ScreenDesign.prototype.addEmptyDate = function () {
        this.creationDates.push(this.creationDates[this.creationDates.length - 1]);
    };
    /* Transform */
    ScreenDesign.prototype.removeDate = function (index) {
        if (index > -1) {
            this.creationDates.splice(index, 1);
        }
    };
    /* Transform */
    ScreenDesign.prototype.removeSearchTerm = function (index) {
        if (index > -1) {
            this.searchNamePatterns.splice(index, 1);
        }
    };
    return ScreenDesign;
}());
exports.ScreenDesign = ScreenDesign;
var RnaiScreenDesign = /** @class */ (function (_super) {
    __extends(RnaiScreenDesign, _super);
    function RnaiScreenDesign() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.treat_rnai_plates = [];
        _this.ctrl_rnai_plates = [];
        _this.ctrl_strain_plates = [];
        _this.ctrl_null_plates = [];
        _this.libraryQuadrant = '';
        _this.chromosome = '';
        _this.conditions = [{ code: 'E', condition: 'Permissive' }, { code: 'S', condition: 'Restrictive' }];
        return _this;
    }
    RnaiScreenDesign.prototype.clearForm = function () {
        this.plates = [];
        this.creationDates = [new Date()];
        this.conditionCode = '';
        this.libraryPlate = '';
        this.chromosome = '';
    };
    /**
     * This is pretty hacky. what should be done is to give each biosample a code, and then to check for that in the barcode
     * @returns {any[]}
     */
    RnaiScreenDesign.prototype.sortPlates = function () {
        var _this = this;
        this.clearPlates();
        var unSortedPlates = [];
        this.plates.map(function (plate) {
            console.log(plate.name);
            if (plate.name.match(/Rnai/gi) && plate.name.match('M')) {
                _this.treat_rnai_plates.push(plate);
            }
            else if (plate.name.match(/Rnai/gi) && plate.name.match('mel')) {
                _this.treat_rnai_plates.push(plate);
            }
            else if (plate.name.match(/Rnai/gi) && plate.name.match('mip')) {
                _this.treat_rnai_plates.push(plate);
            }
            else if (plate.name.match(/Rnai/gi) && plate.name.match('_am')) {
                _this.treat_rnai_plates.push(plate);
            }
            else if (plate.name.match(/Rnai/gi) && plate.name.match('_vi')) {
                _this.treat_rnai_plates.push(plate);
            }
            else if (plate.name.match(/Rnai/gi)) {
                _this.ctrl_rnai_plates.push(plate);
            }
            else if (plate.name.match('L4440') && plate.name.match('M')) {
                _this.ctrl_strain_plates.push(plate);
            }
            else if (plate.name.match('L4440')) {
                _this.ctrl_null_plates.push(plate);
            }
            else {
                unSortedPlates.push(plate);
            }
        });
        // Treat Plates are usually named L4440E_M, L4440_E_D_M
        // Null are Named L4440E, L4440E_D
        // Want first the L4440E, then the duplicate
        // TODO Will have to define different schemas for different barcode naming conventions
        // Now the team uses D to indicate a replicate, but at some point this will change to named replicates (1,2,..,8)
        this.ctrl_strain_plates = lodash_1.orderBy(this.ctrl_strain_plates, ['name'], ['desc']);
        this.ctrl_null_plates = lodash_1.orderBy(this.ctrl_null_plates, ['name'], ['asc']);
        this.splitIntoReplicates();
        return unSortedPlates;
    };
    RnaiScreenDesign.prototype.splitIntoReplicates = function () {
        var _this = this;
        this.treat_rnai_plates.map(function (plate, index) {
            _this.pushReplicate(plate, index);
        });
        this.ctrl_rnai_plates.map(function (plate, index) {
            _this.pushReplicate(plate, index);
        });
        // Sometimes there is 1 L4440 per replicate, and sometimes 2
        // If its two we want the first half in the R1 replicates, and the second in the R2
        // Chunk each l4440 plate array into bins size of l4440_index
        var chunkSize = Math.ceil(this.ctrl_strain_plates.length / this.treat_rnai_plates.length);
        var chunked_treat_l4440 = lodash_1.chunk(this.ctrl_strain_plates, chunkSize);
        var chunked_null_l4440 = lodash_1.chunk(this.ctrl_null_plates, chunkSize);
        chunked_treat_l4440.map(function (chunk, index) {
            chunk.map(function (plate) {
                _this.pushReplicate(plate, index);
            });
        });
        chunked_null_l4440.map(function (chunk, index) {
            chunk.map(function (plate) {
                _this.pushReplicate(plate, index);
            });
        });
    };
    RnaiScreenDesign.prototype.clearPlates = function () {
        this.treat_rnai_plates = [];
        this.ctrl_rnai_plates = [];
        this.ctrl_strain_plates = [];
        this.ctrl_null_plates = [];
        this.replicates = {};
    };
    RnaiScreenDesign.prototype.buildSearchNames = function () {
        this.searchNamePatterns = ["RNAi" + this.chromosome + "." + this.libraryPlate + this.libraryQuadrant + "%" + this.conditionCode + "%",
            "RNAi" + this.chromosome + this.libraryPlate + this.libraryQuadrant + "%" + this.conditionCode + "%", "L4440" + this.conditionCode + "%"];
    };
    return RnaiScreenDesign;
}(ScreenDesign));
exports.RnaiScreenDesign = RnaiScreenDesign;
var RNAiExpUpload = /** @class */ (function () {
    function RNAiExpUpload() {
    }
    RNAiExpUpload.prototype.setDefaults = function (plateModel, expDataModel, expBiosampleModel) {
        var model = new models_1.ExpScreenUploadWorkflowResultSet();
        // These are just general model things
        model.name = expDataModel.name;
        model.comment = expDataModel.comment;
        model.screenId = expDataModel.expScreen.screenId;
        model.screenName = expDataModel.expScreen.screenName;
        model.screenType = expDataModel.expScreen.screenType;
        model.libraryId = expDataModel.library.libraryId;
        var biosamples = {
            'experimentBiosample': {
                'id': expBiosampleModel.expBiosample.biosampleId,
                'name': expBiosampleModel.expBiosample.biosampleName
            },
            'ctrlBiosample': {
                'id': expBiosampleModel.ctrlBiosample.biosampleId,
                'name': expBiosampleModel.ctrlBiosample.biosampleName
            },
        };
        // model.stockPrepDate = expDataModel.assayDates[0];
        // model.assayDates = expDataModel.assayDates;
        model.stockPrepDate = expDataModel.assayDates[0].toISOString();
        model.assayDates = [];
        expDataModel.assayDates.map(function (date) {
            model.assayDates.push(date.toISOString());
        });
        model.biosamples = biosamples;
        model.temperature = expDataModel.temperature;
        model.replicates = plateModel.replicates;
        // NY Specific ArrayScan
        model.instrumentId = 1;
        model.instrumentLookUp = 'arrayScan';
        model.instrumentPlateIdLookup = 'csPlateid';
        model.libraryModel = 'RnaiLibrary';
        model.libraryStockModel = 'RnaiLibraryStock';
        model.librarycode = 'ahringer2';
        model.biosampleType = 'worm';
        model.reagentLookUp = 'rnaiId';
        model.assayViewType = 'exp_assay_ahringer2';
        model.plateViewType = 'exp_plate_ahringer2';
        model.conditions = [
            'treat_rnai',
            'ctrl_rnai',
            'ctrl_null',
            'ctrl_strain'
        ];
        model.controlConditions = [
            'ctrl_strain',
            'ctrl_null'
        ];
        model.experimentConditions = [
            'treat_rnai',
            'ctrl_rnai'
        ];
        model.experimentMatchConditions = {
            'treat_rnai': 'ctrl_rnai'
        };
        model.biosampleMatchConditions = {
            'treat_rnai': 'ctrl_strain',
            'ctrl_rnai': 'ctrl_null'
        };
        model.experimentDesign = {
            'treat_rnai': [
                'ctrl_rnai',
                'ctrl_strain',
                'ctrl_null'
            ]
        };
        // TODO Make Naming Consistent
        model.experimentGroups = {};
        model.experimentGroups.treat_rnai = {};
        model.experimentGroups.ctrl_rnai = {};
        model.experimentGroups.ctrl_strain = {};
        model.experimentGroups.ctrl_null = {};
        model.experimentGroups.treat_rnai.plates = plateModel.treat_rnai_plates;
        model.experimentGroups.treat_rnai.biosampleId = expBiosampleModel.expBiosample.biosampleId;
        model.experimentGroups.ctrl_rnai['plates'] = plateModel.ctrl_rnai_plates;
        model.experimentGroups.ctrl_rnai['biosampleId'] = expBiosampleModel.ctrlBiosample.biosampleId;
        model.experimentGroups.ctrl_strain.plates = plateModel.ctrl_strain_plates;
        model.experimentGroups.ctrl_strain.biosampleId = expBiosampleModel.expBiosample.biosampleId;
        model.experimentGroups.ctrl_null.plates = plateModel.ctrl_null_plates;
        model.experimentGroups.ctrl_null.biosampleId = expBiosampleModel.ctrlBiosample.biosampleId;
        return model;
    };
    RNAiExpUpload.prototype.validateWorkflowData = function (model, errorMessages) {
        if (lodash_1.isEmpty(model.name)) {
            errorMessages.push('You must enter a screen name!');
        }
        if (lodash_1.isEmpty(model.temperature)) {
            errorMessages.push('You must enter a temperature!');
        }
        if (lodash_1.isNull(model.screenId)) {
            errorMessages.push('You must choose a screen!');
        }
        if (lodash_1.isNull(model.libraryId)) {
            errorMessages.push('You must choose a library!');
        }
        if (lodash_1.isEmpty(model.experimentGroups.treat_rnai.plates)) {
            errorMessages.push('There must be one or more Mutant + RNAi plates!');
        }
        if (lodash_1.isEmpty(model.experimentGroups.ctrl_rnai.plates)) {
            errorMessages.push('There must be one or more N2 + RNAi plates!');
        }
        return errorMessages;
    };
    return RNAiExpUpload;
}());
exports.RNAiExpUpload = RNAiExpUpload;
/**
 * Secondary screens have an explicitly defined plate plan
 * The plate plan must exist for the screen to be valid
 * TODO libraryId should go in the constructor!!!
 */
var SearchPlatePlans = /** @class */ (function () {
    function SearchPlatePlans(platePlan96Api, libraryId) {
        this.platePlan96Api = platePlan96Api;
        this.libraryId = libraryId;
        this.findPlatePlans();
    }
    SearchPlatePlans.prototype.findPlatePlans = function () {
        var _this = this;
        this.platePlan96Api.find({ where: { libraryId: this.libraryId } })
            .toPromise()
            .then(function (results) {
            _this.platePlans = results;
        })
            .catch(function (error) {
            return new Error(error);
        });
    };
    return SearchPlatePlans;
}());
exports.SearchPlatePlans = SearchPlatePlans;
//# sourceMappingURL=helpers.js.map