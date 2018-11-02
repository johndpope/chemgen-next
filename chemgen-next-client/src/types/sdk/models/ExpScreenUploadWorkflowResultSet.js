"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ExpScreenUploadWorkflowResultSet = /** @class */ (function () {
    function ExpScreenUploadWorkflowResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ExpScreenUploadWorkflowResultSet`.
     */
    ExpScreenUploadWorkflowResultSet.getModelName = function () {
        return "ExpScreenUploadWorkflow";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ExpScreenUploadWorkflowResultSet for dynamic purposes.
    **/
    ExpScreenUploadWorkflowResultSet.factory = function (data) {
        return new ExpScreenUploadWorkflowResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ExpScreenUploadWorkflowResultSet.getModelDefinition = function () {
        return {
            name: 'ExpScreenUploadWorkflowResultSet',
            plural: 'ExpScreenUploadWorkflowsResultSets',
            path: 'ExpScreenUploadWorkflows',
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
                "site": {
                    name: 'site',
                    type: 'string'
                },
                "platePlan": {
                    name: 'platePlan',
                    type: 'any'
                },
                "platePlanId": {
                    name: 'platePlanId',
                    type: 'any'
                },
                "assayViewType": {
                    name: 'assayViewType',
                    type: 'string'
                },
                "plateViewType": {
                    name: 'plateViewType',
                    type: 'string'
                },
                "instrumentPlateIdLookup": {
                    name: 'instrumentPlateIdLookup',
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
                "biosamples": {
                    name: 'biosamples',
                    type: 'any'
                },
                "libraryModel": {
                    name: 'libraryModel',
                    type: 'string'
                },
                "libraryStockModel": {
                    name: 'libraryStockModel',
                    type: 'string'
                },
                "reagentLookUp": {
                    name: 'reagentLookUp',
                    type: 'string'
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
                    type: 'Array&lt;any&gt;'
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
                    type: 'Array&lt;any&gt;'
                },
                "controlConditions": {
                    name: 'controlConditions',
                    type: 'Array&lt;any&gt;'
                },
                "experimentConditions": {
                    name: 'experimentConditions',
                    type: 'Array&lt;any&gt;'
                },
                "biosampleMatchConditions": {
                    name: 'biosampleMatchConditions',
                    type: 'any'
                },
                "experimentMatchConditions": {
                    name: 'experimentMatchConditions',
                    type: 'any'
                },
                "experimentDesign": {
                    name: 'experimentDesign',
                    type: 'any'
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
                "id": {
                    name: 'id',
                    type: 'any'
                },
            },
            relations: {}
        };
    };
    return ExpScreenUploadWorkflowResultSet;
}());
exports.ExpScreenUploadWorkflowResultSet = ExpScreenUploadWorkflowResultSet;
//# sourceMappingURL=ExpScreenUploadWorkflowResultSet.js.map