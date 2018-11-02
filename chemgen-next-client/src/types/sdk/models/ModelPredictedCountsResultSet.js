"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ModelPredictedCountsResultSet = /** @class */ (function () {
    function ModelPredictedCountsResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ModelPredictedCountsResultSet`.
     */
    ModelPredictedCountsResultSet.getModelName = function () {
        return "ModelPredictedCounts";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ModelPredictedCountsResultSet for dynamic purposes.
    **/
    ModelPredictedCountsResultSet.factory = function (data) {
        return new ModelPredictedCountsResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ModelPredictedCountsResultSet.getModelDefinition = function () {
        return {
            name: 'ModelPredictedCountsResultSet',
            plural: 'ModelPredictedCountsResultSets',
            path: 'ModelPredictedCounts',
            idName: 'id',
            properties: {
                "id": {
                    name: 'id',
                    type: 'number'
                },
                "modelId": {
                    name: 'modelId',
                    type: 'number'
                },
                "screenId": {
                    name: 'screenId',
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
                "assayImagePath": {
                    name: 'assayImagePath',
                    type: 'string'
                },
                "expGroupId": {
                    name: 'expGroupId',
                    type: 'number'
                },
                "expGroupType": {
                    name: 'expGroupType',
                    type: 'string'
                },
                "treatmentGroupId": {
                    name: 'treatmentGroupId',
                    type: 'number'
                },
                "wormCount": {
                    name: 'wormCount',
                    type: 'number'
                },
                "larvaCount": {
                    name: 'larvaCount',
                    type: 'number'
                },
                "eggCount": {
                    name: 'eggCount',
                    type: 'number'
                },
                "percEmbLeth": {
                    name: 'percEmbLeth',
                    type: 'number'
                },
                "percSter": {
                    name: 'percSter',
                    type: 'number'
                },
                "broodSize": {
                    name: 'broodSize',
                    type: 'number'
                },
                "expWorkflowId": {
                    name: 'expWorkflowId',
                    type: 'string'
                },
            },
            relations: {
                expPlates: {
                    name: 'expPlates',
                    type: 'ExpPlateResultSet[]',
                    model: 'ExpPlate',
                    relationType: 'hasMany',
                    keyFrom: 'plateId',
                    keyTo: 'plateId'
                },
                expAssay2reagents: {
                    name: 'expAssay2reagents',
                    type: 'ExpAssay2reagentResultSet[]',
                    model: 'ExpAssay2reagent',
                    relationType: 'hasMany',
                    keyFrom: 'treatmentGroupId',
                    keyTo: 'treatmentGroupId'
                },
                expScreens: {
                    name: 'expScreens',
                    type: 'ExpScreenResultSet[]',
                    model: 'ExpScreen',
                    relationType: 'hasMany',
                    keyFrom: 'screenId',
                    keyTo: 'screenId'
                },
                expAssays: {
                    name: 'expAssays',
                    type: 'ExpAssayResultSet[]',
                    model: 'ExpAssay',
                    relationType: 'hasMany',
                    keyFrom: 'assayId',
                    keyTo: 'assayId'
                },
                models: {
                    name: 'models',
                    type: 'ModelsResultSet[]',
                    model: 'Models',
                    relationType: 'hasMany',
                    keyFrom: 'modelId',
                    keyTo: 'modelId'
                },
            }
        };
    };
    return ModelPredictedCountsResultSet;
}());
exports.ModelPredictedCountsResultSet = ModelPredictedCountsResultSet;
//# sourceMappingURL=ModelPredictedCountsResultSet.js.map