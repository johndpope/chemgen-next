"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ModelPredictedPhenoResultSet = /** @class */ (function () {
    function ModelPredictedPhenoResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ModelPredictedPhenoResultSet`.
     */
    ModelPredictedPhenoResultSet.getModelName = function () {
        return "ModelPredictedPheno";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ModelPredictedPhenoResultSet for dynamic purposes.
    **/
    ModelPredictedPhenoResultSet.factory = function (data) {
        return new ModelPredictedPhenoResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ModelPredictedPhenoResultSet.getModelDefinition = function () {
        return {
            name: 'ModelPredictedPhenoResultSet',
            plural: 'ModelPredictedPhenosResultSets',
            path: 'ModelPredictedPhenos',
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
                "reagentId": {
                    name: 'reagentId',
                    type: 'number'
                },
                "assayImagePath": {
                    name: 'assayImagePath',
                    type: 'string'
                },
                "conclusion": {
                    name: 'conclusion',
                    type: 'string'
                },
                "modelPredictedCountsMeta": {
                    name: 'modelPredictedCountsMeta',
                    type: 'string'
                },
                "expWorkflowId": {
                    name: 'expWorkflowId',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return ModelPredictedPhenoResultSet;
}());
exports.ModelPredictedPhenoResultSet = ModelPredictedPhenoResultSet;
//# sourceMappingURL=ModelPredictedPhenoResultSet.js.map