"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var WpTermTaxonomyResultSet = /** @class */ (function () {
    function WpTermTaxonomyResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `WpTermTaxonomyResultSet`.
     */
    WpTermTaxonomyResultSet.getModelName = function () {
        return "WpTermTaxonomy";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of WpTermTaxonomyResultSet for dynamic purposes.
    **/
    WpTermTaxonomyResultSet.factory = function (data) {
        return new WpTermTaxonomyResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    WpTermTaxonomyResultSet.getModelDefinition = function () {
        return {
            name: 'WpTermTaxonomyResultSet',
            plural: 'WpTermTaxonomiesResultSets',
            path: 'WpTermTaxonomies',
            idName: 'termTaxonomyId',
            properties: {
                "termTaxonomyId": {
                    name: 'termTaxonomyId',
                    type: 'number'
                },
                "termId": {
                    name: 'termId',
                    type: 'number'
                },
                "taxonomy": {
                    name: 'taxonomy',
                    type: 'string'
                },
                "description": {
                    name: 'description',
                    type: 'string'
                },
                "parent": {
                    name: 'parent',
                    type: 'number'
                },
                "count": {
                    name: 'count',
                    type: 'number'
                },
            },
            relations: {}
        };
    };
    return WpTermTaxonomyResultSet;
}());
exports.WpTermTaxonomyResultSet = WpTermTaxonomyResultSet;
//# sourceMappingURL=WpTermTaxonomyResultSet.js.map