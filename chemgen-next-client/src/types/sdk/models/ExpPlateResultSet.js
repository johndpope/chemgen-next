"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ExpPlateResultSet = /** @class */ (function () {
    function ExpPlateResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ExpPlateResultSet`.
     */
    ExpPlateResultSet.getModelName = function () {
        return "ExpPlate";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ExpPlateResultSet for dynamic purposes.
    **/
    ExpPlateResultSet.factory = function (data) {
        return new ExpPlateResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ExpPlateResultSet.getModelDefinition = function () {
        return {
            name: 'ExpPlateResultSet',
            plural: 'ExpPlatesResultSets',
            path: 'ExpPlates',
            idName: 'plateId',
            properties: {
                "plateId": {
                    name: 'plateId',
                    type: 'number'
                },
                "screenId": {
                    name: 'screenId',
                    type: 'number'
                },
                "screenStage": {
                    name: 'screenStage',
                    type: 'string'
                },
                "screenType": {
                    name: 'screenType',
                    type: 'string'
                },
                "plateImageDate": {
                    name: 'plateImageDate',
                    type: 'Date'
                },
                "plateTemperature": {
                    name: 'plateTemperature',
                    type: 'string'
                },
                "plateAssayDate": {
                    name: 'plateAssayDate',
                    type: 'Date'
                },
                "plateImagePath": {
                    name: 'plateImagePath',
                    type: 'string'
                },
                "plateMeta": {
                    name: 'plateMeta',
                    type: 'string'
                },
                "barcode": {
                    name: 'barcode',
                    type: 'string'
                },
                "instrumentId": {
                    name: 'instrumentId',
                    type: 'number'
                },
                "instrumentPlateId": {
                    name: 'instrumentPlateId',
                    type: 'number'
                },
                "instrumentPlateImagePath": {
                    name: 'instrumentPlateImagePath',
                    type: 'string'
                },
                "plateWpPlatePostId": {
                    name: 'plateWpPlatePostId',
                    type: 'number'
                },
                "expWorkflowId": {
                    name: 'expWorkflowId',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return ExpPlateResultSet;
}());
exports.ExpPlateResultSet = ExpPlateResultSet;
//# sourceMappingURL=ExpPlateResultSet.js.map