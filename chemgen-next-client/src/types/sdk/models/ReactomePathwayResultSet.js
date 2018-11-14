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
                "className": {
                    name: 'className',
                    type: 'string'
                },
                "dbId": {
                    name: 'dbId',
                    type: 'string'
                },
                "displayName": {
                    name: 'displayName',
                    type: 'string'
                },
                "hasDiagram": {
                    name: 'hasDiagram',
                    type: 'boolean'
                },
                "isInDisease": {
                    name: 'isInDisease',
                    type: 'boolean'
                },
                "isInferred": {
                    name: 'isInferred',
                    type: 'boolean'
                },
                "name": {
                    name: 'name',
                    type: 'Array&lt;any&gt;'
                },
                "releaseDate": {
                    name: 'releaseDate',
                    type: 'string'
                },
                "speciesName": {
                    name: 'speciesName',
                    type: 'string'
                },
                "stdId": {
                    name: 'stdId',
                    type: 'string'
                },
                "stdIdVersion": {
                    name: 'stdIdVersion',
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
    return ReactomePathwayResultSet;
}());
exports.ReactomePathwayResultSet = ReactomePathwayResultSet;
//# sourceMappingURL=ReactomePathwayResultSet.js.map