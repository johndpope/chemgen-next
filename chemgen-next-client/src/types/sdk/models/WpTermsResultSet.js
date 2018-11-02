"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var WpTermsResultSet = /** @class */ (function () {
    function WpTermsResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `WpTermsResultSet`.
     */
    WpTermsResultSet.getModelName = function () {
        return "WpTerms";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of WpTermsResultSet for dynamic purposes.
    **/
    WpTermsResultSet.factory = function (data) {
        return new WpTermsResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    WpTermsResultSet.getModelDefinition = function () {
        return {
            name: 'WpTermsResultSet',
            plural: 'WpTermsResultSets',
            path: 'WpTerms',
            idName: 'termId',
            properties: {
                "termId": {
                    name: 'termId',
                    type: 'number'
                },
                "name": {
                    name: 'name',
                    type: 'string'
                },
                "slug": {
                    name: 'slug',
                    type: 'string'
                },
                "termGroup": {
                    name: 'termGroup',
                    type: 'number'
                },
            },
            relations: {}
        };
    };
    return WpTermsResultSet;
}());
exports.WpTermsResultSet = WpTermsResultSet;
//# sourceMappingURL=WpTermsResultSet.js.map