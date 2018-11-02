"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ReactomeEnityResultSet = /** @class */ (function () {
    function ReactomeEnityResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ReactomeEnityResultSet`.
     */
    ReactomeEnityResultSet.getModelName = function () {
        return "ReactomeEnity";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ReactomeEnityResultSet for dynamic purposes.
    **/
    ReactomeEnityResultSet.factory = function (data) {
        return new ReactomeEnityResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ReactomeEnityResultSet.getModelDefinition = function () {
        return {
            name: 'ReactomeEnityResultSet',
            plural: 'ReactomeEnitiesResultSets',
            path: 'ReactomeEnities',
            idName: 'id',
            properties: {
                "id": {
                    name: 'id',
                    type: 'any'
                },
            },
            relations: {}
        };
    };
    return ReactomeEnityResultSet;
}());
exports.ReactomeEnityResultSet = ReactomeEnityResultSet;
//# sourceMappingURL=ReactomeEnityResultSet.js.map