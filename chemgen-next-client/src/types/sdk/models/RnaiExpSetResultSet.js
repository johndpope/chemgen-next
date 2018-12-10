"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var RnaiExpSetResultSet = /** @class */ (function () {
    function RnaiExpSetResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `RnaiExpSetResultSet`.
     */
    RnaiExpSetResultSet.getModelName = function () {
        return "RnaiExpSet";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of RnaiExpSetResultSet for dynamic purposes.
    **/
    RnaiExpSetResultSet.factory = function (data) {
        return new RnaiExpSetResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    RnaiExpSetResultSet.getModelDefinition = function () {
        return {
            name: 'RnaiExpSetResultSet',
            plural: 'RnaiExpSetsResultSets',
            path: 'RnaiExpSets',
            idName: 'id',
            properties: {
                "treat_rnai": {
                    name: 'treat_rnai',
                    type: 'any'
                },
                "ctrl_strain": {
                    name: 'ctrl_strain',
                    type: 'Array&lt;any&gt;'
                },
                "ctrl_null": {
                    name: 'ctrl_null',
                    type: 'Array&lt;any&gt;'
                },
                "ctrl_rnai": {
                    name: 'ctrl_rnai',
                    type: 'Array&lt;any&gt;'
                },
                "id": {
                    name: 'id',
                    type: 'number'
                },
            },
            relations: {}
        };
    };
    return RnaiExpSetResultSet;
}());
exports.RnaiExpSetResultSet = RnaiExpSetResultSet;
//# sourceMappingURL=RnaiExpSetResultSet.js.map