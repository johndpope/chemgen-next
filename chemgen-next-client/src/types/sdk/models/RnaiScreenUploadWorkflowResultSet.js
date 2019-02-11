"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var RnaiScreenUploadWorkflowResultSet = /** @class */ (function () {
    function RnaiScreenUploadWorkflowResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `RnaiScreenUploadWorkflowResultSet`.
     */
    RnaiScreenUploadWorkflowResultSet.getModelName = function () {
        return "RnaiScreenUploadWorkflow";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of RnaiScreenUploadWorkflowResultSet for dynamic purposes.
    **/
    RnaiScreenUploadWorkflowResultSet.factory = function (data) {
        return new RnaiScreenUploadWorkflowResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    RnaiScreenUploadWorkflowResultSet.getModelDefinition = function () {
        return {
            name: 'RnaiScreenUploadWorkflowResultSet',
            plural: 'RnaiScreenUploadWorkflowsResultSets',
            path: 'RnaiScreenUploadWorkflows',
            idName: 'id',
            properties: {
                "name": {
                    name: 'name',
                    type: 'string'
                },
                "comment": {
                    name: 'comment',
                    type: 'string'
                },
                "platePlan": {
                    name: 'platePlan',
                    type: 'any'
                },
                "platePlanId": {
                    name: 'platePlanId',
                    type: 'string'
                },
                "assayViewType": {
                    name: 'assayViewType',
                    type: 'string'
                },
                "plateViewType": {
                    name: 'plateViewType',
                    type: 'string'
                },
                "wells": {
                    name: 'wells',
                    type: 'Array&lt;any&gt;',
                    default: []
                },
                "screenId": {
                    name: 'screenId',
                    type: 'number'
                },
                "screenName": {
                    name: 'screenName',
                    type: 'string'
                },
                "instrumentId": {
                    name: 'instrumentId',
                    type: 'number'
                },
                "libraryId": {
                    name: 'libraryId',
                    type: 'number',
                    default: 1
                },
                "screenStage": {
                    name: 'screenStage',
                    type: 'string'
                },
                "screenType": {
                    name: 'screenType',
                    type: 'string'
                },
                "biosamples": {
                    name: 'biosamples',
                    type: 'any'
                },
                "libraryModel": {
                    name: 'libraryModel',
                    type: 'string',
                    default: 'RnaiLibrary'
                },
                "libraryStockModel": {
                    name: 'libraryStockModel',
                    type: 'string',
                    default: 'RnaiLibraryStock'
                },
                "reagentLookUp": {
                    name: 'reagentLookUp',
                    type: 'string',
                    default: 'rnaiId'
                },
                "instrumentLookUp": {
                    name: 'instrumentLookUp',
                    type: 'string'
                },
                "biosampleType": {
                    name: 'biosampleType',
                    type: 'string'
                },
                "stockPrepDate": {
                    name: 'stockPrepDate',
                    type: 'Date'
                },
                "assayDates": {
                    name: 'assayDates',
                    type: 'any'
                },
                "search": {
                    name: 'search',
                    type: 'any'
                },
                "replicates": {
                    name: 'replicates',
                    type: 'any'
                },
                "conditions": {
                    name: 'conditions',
                    type: 'Array&lt;any&gt;',
                    default: []
                },
                "controlConditions": {
                    name: 'controlConditions',
                    type: 'Array&lt;any&gt;',
                    default: []
                },
                "experimentConditions": {
                    name: 'experimentConditions',
                    type: 'Array&lt;any&gt;',
                    default: []
                },
                "biosampleMatchConditions": {
                    name: 'biosampleMatchConditions',
                    type: 'any',
                    default: null
                },
                "experimentMatchConditions": {
                    name: 'experimentMatchConditions',
                    type: 'any',
                    default: null
                },
                "experimentDesign": {
                    name: 'experimentDesign',
                    type: 'any',
                    default: null
                },
                "experimentGroups": {
                    name: 'experimentGroups',
                    type: 'any'
                },
                "temperature": {
                    name: 'temperature',
                    type: 'any'
                },
                "librarycode": {
                    name: 'librarycode',
                    type: 'string'
                },
                "site": {
                    name: 'site',
                    type: 'string'
                },
                "platePlanHash": {
                    name: 'platePlanHash',
                    type: 'any'
                },
                "instrumentPlateIdLookup": {
                    name: 'instrumentPlateIdLookup',
                    type: 'string'
                },
                "id": {
                    name: 'id',
                    type: 'any'
                },
            },
            relations: {}
        };
    };
    return RnaiScreenUploadWorkflowResultSet;
}());
exports.RnaiScreenUploadWorkflowResultSet = RnaiScreenUploadWorkflowResultSet;
//# sourceMappingURL=RnaiScreenUploadWorkflowResultSet.js.map