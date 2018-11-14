"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ReactomeGraphResultSet = /** @class */ (function () {
    function ReactomeGraphResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ReactomeGraphResultSet`.
     */
    ReactomeGraphResultSet.getModelName = function () {
        return "ReactomeGraph";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ReactomeGraphResultSet for dynamic purposes.
    **/
    ReactomeGraphResultSet.factory = function (data) {
        return new ReactomeGraphResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ReactomeGraphResultSet.getModelDefinition = function () {
        return {
            name: 'ReactomeGraphResultSet',
            plural: 'ReactomeGraphsResultSets',
            path: 'ReactomeGraphs',
            idName: 'id',
            properties: {
                "entityName": {
                    name: 'entityName',
                    type: 'string'
                },
                "nodes": {
                    name: 'nodes',
                    type: 'Array&lt;any&gt;'
                },
                "links": {
                    name: 'links',
                    type: 'Array&lt;any&gt;'
                },
                "pathways": {
                    name: 'pathways',
                    type: 'Array&lt;any&gt;'
                },
                "entities": {
                    name: 'entities',
                    type: 'Array&lt;any&gt;'
                },
                "id": {
                    name: 'id',
                    type: 'any'
                },
            },
            relations: {}
        };
    };
    return ReactomeGraphResultSet;
}());
exports.ReactomeGraphResultSet = ReactomeGraphResultSet;
//# sourceMappingURL=ReactomeGraphResultSet.js.map