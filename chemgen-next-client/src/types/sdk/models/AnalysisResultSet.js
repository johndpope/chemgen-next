"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var AnalysisResultSet = /** @class */ (function () {
    function AnalysisResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `AnalysisResultSet`.
     */
    AnalysisResultSet.getModelName = function () {
        return "Analysis";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of AnalysisResultSet for dynamic purposes.
    **/
    AnalysisResultSet.factory = function (data) {
        return new AnalysisResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    AnalysisResultSet.getModelDefinition = function () {
        return {
            name: 'AnalysisResultSet',
            plural: 'AnalysesResultSets',
            path: 'Analyses',
            idName: 'id',
            properties: {
                "name": {
                    name: 'name',
                    type: 'string'
                },
                "code": {
                    name: 'code',
                    type: 'string'
                },
                "description": {
                    name: 'description',
                    type: 'string'
                },
                "dateCreated": {
                    name: 'dateCreated',
                    type: 'Date'
                },
                "dateModified": {
                    name: 'dateModified',
                    type: 'Date'
                },
                "results": {
                    name: 'results',
                    type: 'any'
                },
                "id": {
                    name: 'id',
                    type: 'any'
                },
            },
            relations: {}
        };
    };
    return AnalysisResultSet;
}());
exports.AnalysisResultSet = AnalysisResultSet;
//# sourceMappingURL=AnalysisResultSet.js.map