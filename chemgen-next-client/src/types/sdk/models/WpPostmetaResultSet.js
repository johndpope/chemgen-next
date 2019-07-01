"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var WpPostmetaResultSet = /** @class */ (function () {
    function WpPostmetaResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `WpPostmetaResultSet`.
     */
    WpPostmetaResultSet.getModelName = function () {
        return "WpPostmeta";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of WpPostmetaResultSet for dynamic purposes.
    **/
    WpPostmetaResultSet.factory = function (data) {
        return new WpPostmetaResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    WpPostmetaResultSet.getModelDefinition = function () {
        return {
            name: 'WpPostmetaResultSet',
            plural: 'WpPostmetaResultSets',
            path: 'WpPostmeta',
            idName: 'metaId',
            properties: {
                "metaId": {
                    name: 'metaId',
                    type: 'number'
                },
                "postId": {
                    name: 'postId',
                    type: 'number'
                },
                "metaKey": {
                    name: 'metaKey',
                    type: 'string'
                },
                "metaValue": {
                    name: 'metaValue',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return WpPostmetaResultSet;
}());
exports.WpPostmetaResultSet = WpPostmetaResultSet;
//# sourceMappingURL=WpPostmetaResultSet.js.map