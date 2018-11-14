"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ReactomeEntityResultSet = /** @class */ (function () {
    function ReactomeEntityResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ReactomeEntityResultSet`.
     */
    ReactomeEntityResultSet.getModelName = function () {
        return "ReactomeEntity";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ReactomeEntityResultSet for dynamic purposes.
    **/
    ReactomeEntityResultSet.factory = function (data) {
        return new ReactomeEntityResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ReactomeEntityResultSet.getModelDefinition = function () {
        return {
            name: 'ReactomeEntityResultSet',
            plural: 'ReactomeEntitiesResultSets',
            path: 'ReactomeEntities',
            idName: 'id',
            properties: {
                "dbId": {
                    name: 'dbId',
                    type: 'string'
                },
                "databaseName": {
                    name: 'databaseName',
                    type: 'string'
                },
                "compartmentAccession": {
                    name: 'compartmentAccession',
                    type: 'Array&lt;any&gt;'
                },
                "compartmentNames": {
                    name: 'compartmentNames',
                    type: 'Array&lt;any&gt;'
                },
                "exactType": {
                    name: 'exactType',
                    type: 'string'
                },
                "id": {
                    name: 'id',
                    type: 'any'
                },
                "isDisease": {
                    name: 'isDisease',
                    type: 'boolean'
                },
                "name": {
                    name: 'name',
                    type: 'string'
                },
                "referenceIdentifier": {
                    name: 'referenceIdentifier',
                    type: 'string'
                },
                "referenceUrl": {
                    name: 'referenceUrl',
                    type: 'string'
                },
                "stId": {
                    name: 'stId',
                    type: 'string'
                },
                "species": {
                    name: 'species',
                    type: 'Array&lt;any&gt;'
                },
            },
            relations: {}
        };
    };
    return ReactomeEntityResultSet;
}());
exports.ReactomeEntityResultSet = ReactomeEntityResultSet;
//# sourceMappingURL=ReactomeEntityResultSet.js.map