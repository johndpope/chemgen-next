"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ModelsResultSet = /** @class */ (function () {
    function ModelsResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ModelsResultSet`.
     */
    ModelsResultSet.getModelName = function () {
        return "Models";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ModelsResultSet for dynamic purposes.
    **/
    ModelsResultSet.factory = function (data) {
        return new ModelsResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ModelsResultSet.getModelDefinition = function () {
        return {
            name: 'ModelsResultSet',
            plural: 'ModelsResultSets',
            path: 'Models',
            idName: 'modelId',
            properties: {
                "modelId": {
                    name: 'modelId',
                    type: 'number'
                },
                "modelName": {
                    name: 'modelName',
                    type: 'string'
                },
                "modelType": {
                    name: 'modelType',
                    type: 'string'
                },
                "location": {
                    name: 'location',
                    type: 'string'
                },
                "description": {
                    name: 'description',
                    type: 'string'
                },
                "modelMeta": {
                    name: 'modelMeta',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return ModelsResultSet;
}());
exports.ModelsResultSet = ModelsResultSet;
//# sourceMappingURL=ModelsResultSet.js.map