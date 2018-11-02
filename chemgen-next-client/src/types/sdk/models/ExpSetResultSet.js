"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ExpSetResultSet = /** @class */ (function () {
    function ExpSetResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ExpSetResultSet`.
     */
    ExpSetResultSet.getModelName = function () {
        return "ExpSet";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ExpSetResultSet for dynamic purposes.
    **/
    ExpSetResultSet.factory = function (data) {
        return new ExpSetResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ExpSetResultSet.getModelDefinition = function () {
        return {
            name: 'ExpSetResultSet',
            plural: 'ExpSetsResultSets',
            path: 'ExpSets',
            idName: 'id',
            properties: {
                "id": {
                    name: 'id',
                    type: 'number'
                },
            },
            relations: {}
        };
    };
    return ExpSetResultSet;
}());
exports.ExpSetResultSet = ExpSetResultSet;
//# sourceMappingURL=ExpSetResultSet.js.map