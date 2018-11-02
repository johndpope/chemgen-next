"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ModelPredictedRankResultSet = /** @class */ (function () {
    function ModelPredictedRankResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ModelPredictedRankResultSet`.
     */
    ModelPredictedRankResultSet.getModelName = function () {
        return "ModelPredictedRank";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ModelPredictedRankResultSet for dynamic purposes.
    **/
    ModelPredictedRankResultSet.factory = function (data) {
        return new ModelPredictedRankResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ModelPredictedRankResultSet.getModelDefinition = function () {
        return {
            name: 'ModelPredictedRankResultSet',
            plural: 'ModelPredictedRanksResultSets',
            path: 'ModelPredictedRanks',
            idName: 'modelPredictedRankId',
            properties: {
                "modelPredictedRankId": {
                    name: 'modelPredictedRankId',
                    type: 'number'
                },
                "screenId": {
                    name: 'screenId',
                    type: 'number'
                },
                "expWorkflowId": {
                    name: 'expWorkflowId',
                    type: 'string'
                },
                "modelId": {
                    name: 'modelId',
                    type: 'number'
                },
                "treatmentGroupId": {
                    name: 'treatmentGroupId',
                    type: 'number'
                },
                "minDifference": {
                    name: 'minDifference',
                    type: 'number'
                },
                "maxDifference": {
                    name: 'maxDifference',
                    type: 'number'
                },
                "avgDifference": {
                    name: 'avgDifference',
                    type: 'number'
                },
                "modelPredictedRankMeta": {
                    name: 'modelPredictedRankMeta',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return ModelPredictedRankResultSet;
}());
exports.ModelPredictedRankResultSet = ModelPredictedRankResultSet;
//# sourceMappingURL=ModelPredictedRankResultSet.js.map