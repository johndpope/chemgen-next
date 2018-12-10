"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExpAssay2reagentResultSet = /** @class */ (function () {
    function ExpAssay2reagentResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ExpAssay2reagentResultSet`.
     */
    ExpAssay2reagentResultSet.getModelName = function () {
        return "ExpAssay2reagent";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ExpAssay2reagentResultSet for dynamic purposes.
    **/
    ExpAssay2reagentResultSet.factory = function (data) {
        return new ExpAssay2reagentResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ExpAssay2reagentResultSet.getModelDefinition = function () {
        return {
            name: 'ExpAssay2reagentResultSet',
            plural: 'ExpAssay2reagentsResultSets',
            path: 'ExpAssay2reagents',
            idName: 'assay2reagentId',
            properties: {
                "assay2reagentId": {
                    name: 'assay2reagentId',
                    type: 'number'
                },
                "screenId": {
                    name: 'screenId',
                    type: 'number'
                },
                "libraryId": {
                    name: 'libraryId',
                    type: 'number'
                },
                "plateId": {
                    name: 'plateId',
                    type: 'number'
                },
                "assayId": {
                    name: 'assayId',
                    type: 'number'
                },
                "stockId": {
                    name: 'stockId',
                    type: 'number'
                },
                "reagentId": {
                    name: 'reagentId',
                    type: 'number'
                },
                "parentLibraryPlate": {
                    name: 'parentLibraryPlate',
                    type: 'string'
                },
                "parentLibraryWell": {
                    name: 'parentLibraryWell',
                    type: 'string'
                },
                "stockLibraryWell": {
                    name: 'stockLibraryWell',
                    type: 'string'
                },
                "reagentName": {
                    name: 'reagentName',
                    type: 'string'
                },
                "reagentType": {
                    name: 'reagentType',
                    type: 'string'
                },
                "expGroupId": {
                    name: 'expGroupId',
                    type: 'number'
                },
                "treatmentGroupId": {
                    name: 'treatmentGroupId',
                    type: 'number'
                },
                "reagentTable": {
                    name: 'reagentTable',
                    type: 'string'
                },
                "assay2reagentMeta": {
                    name: 'assay2reagentMeta',
                    type: 'string'
                },
                "expWorkflowId": {
                    name: 'expWorkflowId',
                    type: 'string'
                },
            },
            relations: {
                expManualScores: {
                    name: 'expManualScores',
                    type: 'ExpManualScoresResultSet[]',
                    model: 'ExpManualScores',
                    relationType: 'hasMany',
                    keyFrom: 'assayId',
                    keyTo: 'assayId'
                },
            }
        };
    };
    return ExpAssay2reagentResultSet;
}());
exports.ExpAssay2reagentResultSet = ExpAssay2reagentResultSet;
//# sourceMappingURL=ExpAssay2reagentResultSet.js.map