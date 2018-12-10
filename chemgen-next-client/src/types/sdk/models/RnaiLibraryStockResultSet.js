"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var RnaiLibraryStockResultSet = /** @class */ (function () {
    function RnaiLibraryStockResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `RnaiLibraryStockResultSet`.
     */
    RnaiLibraryStockResultSet.getModelName = function () {
        return "RnaiLibraryStock";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of RnaiLibraryStockResultSet for dynamic purposes.
    **/
    RnaiLibraryStockResultSet.factory = function (data) {
        return new RnaiLibraryStockResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    RnaiLibraryStockResultSet.getModelDefinition = function () {
        return {
            name: 'RnaiLibraryStockResultSet',
            plural: 'RnaiLibraryStocksResultSets',
            path: 'RnaiLibraryStocks',
            idName: 'stockId',
            properties: {
                "stockId": {
                    name: 'stockId',
                    type: 'number'
                },
                "libraryId": {
                    name: 'libraryId',
                    type: 'number'
                },
                "rnaiId": {
                    name: 'rnaiId',
                    type: 'number'
                },
                "plateId": {
                    name: 'plateId',
                    type: 'number'
                },
                "assayId": {
                    name: 'assayId',
                    type: 'number'
                },
                "datePrepared": {
                    name: 'datePrepared',
                    type: 'Date'
                },
                "location": {
                    name: 'location',
                    type: 'string'
                },
                "preparedBy": {
                    name: 'preparedBy',
                    type: 'string'
                },
                "stockMeta": {
                    name: 'stockMeta',
                    type: 'string'
                },
                "well": {
                    name: 'well',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return RnaiLibraryStockResultSet;
}());
exports.RnaiLibraryStockResultSet = RnaiLibraryStockResultSet;
//# sourceMappingURL=RnaiLibraryStockResultSet.js.map