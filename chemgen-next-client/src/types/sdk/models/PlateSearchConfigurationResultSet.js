"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var PlateSearchConfigurationResultSet = /** @class */ (function () {
    function PlateSearchConfigurationResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `PlateSearchConfigurationResultSet`.
     */
    PlateSearchConfigurationResultSet.getModelName = function () {
        return "PlateSearchConfiguration";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of PlateSearchConfigurationResultSet for dynamic purposes.
    **/
    PlateSearchConfigurationResultSet.factory = function (data) {
        return new PlateSearchConfigurationResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    PlateSearchConfigurationResultSet.getModelDefinition = function () {
        return {
            name: 'PlateSearchConfigurationResultSet',
            plural: 'PlateSearchConfigurationsResultSets',
            path: 'PlateSearchConfigurations',
            idName: 'id',
            properties: {
                "screenName": {
                    name: 'screenName',
                    type: 'string'
                },
                "screenMoniker": {
                    name: 'screenMoniker',
                    type: 'string'
                },
                "screenId": {
                    name: 'screenId',
                    type: 'number'
                },
                "expWorkflowName": {
                    name: 'expWorkflowName',
                    type: 'string'
                },
                "barcodeSearches": {
                    name: 'barcodeSearches',
                    type: 'any'
                },
                "biosamples": {
                    name: 'biosamples',
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
    return PlateSearchConfigurationResultSet;
}());
exports.PlateSearchConfigurationResultSet = PlateSearchConfigurationResultSet;
//# sourceMappingURL=PlateSearchConfigurationResultSet.js.map