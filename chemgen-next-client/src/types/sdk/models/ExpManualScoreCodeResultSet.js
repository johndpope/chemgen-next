"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ExpManualScoreCodeResultSet = /** @class */ (function () {
    function ExpManualScoreCodeResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ExpManualScoreCodeResultSet`.
     */
    ExpManualScoreCodeResultSet.getModelName = function () {
        return "ExpManualScoreCode";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ExpManualScoreCodeResultSet for dynamic purposes.
    **/
    ExpManualScoreCodeResultSet.factory = function (data) {
        return new ExpManualScoreCodeResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ExpManualScoreCodeResultSet.getModelDefinition = function () {
        return {
            name: 'ExpManualScoreCodeResultSet',
            plural: 'ExpManualScoreCodesResultSets',
            path: 'ExpManualScoreCodes',
            idName: 'manualscorecodeId',
            properties: {
                "manualscorecodeId": {
                    name: 'manualscorecodeId',
                    type: 'number'
                },
                "description": {
                    name: 'description',
                    type: 'string'
                },
                "shortDescription": {
                    name: 'shortDescription',
                    type: 'string'
                },
                "formName": {
                    name: 'formName',
                    type: 'string'
                },
                "formCode": {
                    name: 'formCode',
                    type: 'string'
                },
                "manualValue": {
                    name: 'manualValue',
                    type: 'number'
                },
                "manualGroup": {
                    name: 'manualGroup',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return ExpManualScoreCodeResultSet;
}());
exports.ExpManualScoreCodeResultSet = ExpManualScoreCodeResultSet;
//# sourceMappingURL=ExpManualScoreCodeResultSet.js.map