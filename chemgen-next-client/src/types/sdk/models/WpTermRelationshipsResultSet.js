"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var WpTermRelationshipsResultSet = /** @class */ (function () {
    function WpTermRelationshipsResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `WpTermRelationshipsResultSet`.
     */
    WpTermRelationshipsResultSet.getModelName = function () {
        return "WpTermRelationships";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of WpTermRelationshipsResultSet for dynamic purposes.
    **/
    WpTermRelationshipsResultSet.factory = function (data) {
        return new WpTermRelationshipsResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    WpTermRelationshipsResultSet.getModelDefinition = function () {
        return {
            name: 'WpTermRelationshipsResultSet',
            plural: 'WpTermRelationshipsResultSets',
            path: 'WpTermRelationships',
            idName: 'objectId',
            properties: {
                "objectId": {
                    name: 'objectId',
                    type: 'number'
                },
                "termTaxonomyId": {
                    name: 'termTaxonomyId',
                    type: 'number'
                },
                "termOrder": {
                    name: 'termOrder',
                    type: 'number'
                },
            },
            relations: {}
        };
    };
    return WpTermRelationshipsResultSet;
}());
exports.WpTermRelationshipsResultSet = WpTermRelationshipsResultSet;
//# sourceMappingURL=WpTermRelationshipsResultSet.js.map