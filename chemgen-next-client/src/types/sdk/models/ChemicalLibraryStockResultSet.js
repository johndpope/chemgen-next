"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ChemicalLibraryStockResultSet = /** @class */ (function () {
    function ChemicalLibraryStockResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ChemicalLibraryStockResultSet`.
     */
    ChemicalLibraryStockResultSet.getModelName = function () {
        return "ChemicalLibraryStock";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ChemicalLibraryStockResultSet for dynamic purposes.
    **/
    ChemicalLibraryStockResultSet.factory = function (data) {
        return new ChemicalLibraryStockResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ChemicalLibraryStockResultSet.getModelDefinition = function () {
        return {
            name: 'ChemicalLibraryStockResultSet',
            plural: 'ChemicalLibraryStocksResultSets',
            path: 'ChemicalLibraryStocks',
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
                "compoundId": {
                    name: 'compoundId',
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
                "concentration": {
                    name: 'concentration',
                    type: 'number'
                },
                "solvent": {
                    name: 'solvent',
                    type: 'string'
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
                "stockType": {
                    name: 'stockType',
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
    return ChemicalLibraryStockResultSet;
}());
exports.ChemicalLibraryStockResultSet = ChemicalLibraryStockResultSet;
//# sourceMappingURL=ChemicalLibraryStockResultSet.js.map