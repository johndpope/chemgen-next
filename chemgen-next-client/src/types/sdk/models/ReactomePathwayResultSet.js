"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ReactomePathwayResultSet = /** @class */ (function () {
    function ReactomePathwayResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ReactomePathwayResultSet`.
     */
    ReactomePathwayResultSet.getModelName = function () {
        return "ReactomePathway";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ReactomePathwayResultSet for dynamic purposes.
    **/
    ReactomePathwayResultSet.factory = function (data) {
        return new ReactomePathwayResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ReactomePathwayResultSet.getModelDefinition = function () {
        return {
            name: 'ReactomePathwayResultSet',
            plural: 'ReactomePathwaysResultSets',
            path: 'ReactomePathways',
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
    return ReactomePathwayResultSet;
}());
exports.ReactomePathwayResultSet = ReactomePathwayResultSet;
//# sourceMappingURL=ReactomePathwayResultSet.js.map