"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ExpManualScoresResultSet = /** @class */ (function () {
    function ExpManualScoresResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ExpManualScoresResultSet`.
     */
    ExpManualScoresResultSet.getModelName = function () {
        return "ExpManualScores";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ExpManualScoresResultSet for dynamic purposes.
    **/
    ExpManualScoresResultSet.factory = function (data) {
        return new ExpManualScoresResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ExpManualScoresResultSet.getModelDefinition = function () {
        return {
            name: 'ExpManualScoresResultSet',
            plural: 'ExpManualScoresResultSets',
            path: 'ExpManualScores',
            idName: 'manualscoreId',
            properties: {
                "manualscoreId": {
                    name: 'manualscoreId',
                    type: 'number'
                },
                "manualscoreGroup": {
                    name: 'manualscoreGroup',
                    type: 'string'
                },
                "manualscoreCode": {
                    name: 'manualscoreCode',
                    type: 'string'
                },
                "manualscoreValue": {
                    name: 'manualscoreValue',
                    type: 'number'
                },
                "screenId": {
                    name: 'screenId',
                    type: 'number'
                },
                "screenName": {
                    name: 'screenName',
                    type: 'string'
                },
                "assayId": {
                    name: 'assayId',
                    type: 'number'
                },
                "treatmentGroupId": {
                    name: 'treatmentGroupId',
                    type: 'number'
                },
                "scoreCodeId": {
                    name: 'scoreCodeId',
                    type: 'number'
                },
                "userId": {
                    name: 'userId',
                    type: 'number'
                },
                "userName": {
                    name: 'userName',
                    type: 'string'
                },
                "timestamp": {
                    name: 'timestamp',
                    type: 'Date'
                },
                "expWorkflowId": {
                    name: 'expWorkflowId',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return ExpManualScoresResultSet;
}());
exports.ExpManualScoresResultSet = ExpManualScoresResultSet;
//# sourceMappingURL=ExpManualScoresResultSet.js.map