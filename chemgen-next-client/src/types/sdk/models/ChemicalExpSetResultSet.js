"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ChemicalExpSetResultSet = /** @class */ (function () {
    function ChemicalExpSetResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ChemicalExpSetResultSet`.
     */
    ChemicalExpSetResultSet.getModelName = function () {
        return "ChemicalExpSet";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ChemicalExpSetResultSet for dynamic purposes.
    **/
    ChemicalExpSetResultSet.factory = function (data) {
        return new ChemicalExpSetResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ChemicalExpSetResultSet.getModelDefinition = function () {
        return {
            name: 'ChemicalExpSetResultSet',
            plural: 'ChemicalExpSetsResultSets',
            path: 'ChemicalExpSets',
            idName: 'id',
            properties: {
                "treat_chemical": {
                    name: 'treat_chemical',
                    type: 'Array&lt;any&gt;'
                },
                "ctrl_chemical": {
                    name: 'ctrl_chemical',
                    type: 'Array&lt;any&gt;'
                },
                "ctrl_strain": {
                    name: 'ctrl_strain',
                    type: 'Array&lt;any&gt;'
                },
                "ctrl_null": {
                    name: 'ctrl_null',
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
    return ChemicalExpSetResultSet;
}());
exports.ChemicalExpSetResultSet = ChemicalExpSetResultSet;
//# sourceMappingURL=ChemicalExpSetResultSet.js.map