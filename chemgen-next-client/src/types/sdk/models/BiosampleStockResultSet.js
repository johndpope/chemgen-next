"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var BiosampleStockResultSet = /** @class */ (function () {
    function BiosampleStockResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `BiosampleStockResultSet`.
     */
    BiosampleStockResultSet.getModelName = function () {
        return "BiosampleStock";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of BiosampleStockResultSet for dynamic purposes.
    **/
    BiosampleStockResultSet.factory = function (data) {
        return new BiosampleStockResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    BiosampleStockResultSet.getModelDefinition = function () {
        return {
            name: 'BiosampleStockResultSet',
            plural: 'BiosampleStocksResultSets',
            path: 'BiosampleStocks',
            idName: 'biosampleStockId',
            properties: {
                "biosampleStockId": {
                    name: 'biosampleStockId',
                    type: 'number'
                },
                "biosampleId": {
                    name: 'biosampleId',
                    type: 'number'
                },
                "containerId": {
                    name: 'containerId',
                    type: 'number'
                },
                "containerType": {
                    name: 'containerType',
                    type: 'string'
                },
                "location": {
                    name: 'location',
                    type: 'string'
                },
                "datePrepared": {
                    name: 'datePrepared',
                    type: 'Date'
                },
                "preparedBy": {
                    name: 'preparedBy',
                    type: 'string'
                },
                "biosampleStockMeta": {
                    name: 'biosampleStockMeta',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return BiosampleStockResultSet;
}());
exports.BiosampleStockResultSet = BiosampleStockResultSet;
//# sourceMappingURL=BiosampleStockResultSet.js.map