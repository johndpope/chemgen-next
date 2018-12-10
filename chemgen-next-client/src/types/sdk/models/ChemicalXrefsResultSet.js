"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ChemicalXrefsResultSet = /** @class */ (function () {
    function ChemicalXrefsResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ChemicalXrefsResultSet`.
     */
    ChemicalXrefsResultSet.getModelName = function () {
        return "ChemicalXrefs";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ChemicalXrefsResultSet for dynamic purposes.
    **/
    ChemicalXrefsResultSet.factory = function (data) {
        return new ChemicalXrefsResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ChemicalXrefsResultSet.getModelDefinition = function () {
        return {
            name: 'ChemicalXrefsResultSet',
            plural: 'ChemicalXrefsResultSets',
            path: 'ChemicalXrefs',
            idName: 'id',
            properties: {
                "id": {
                    name: 'id',
                    type: 'number'
                },
                "chemicalLibraryId": {
                    name: 'chemicalLibraryId',
                    type: 'number'
                },
                "libraryId": {
                    name: 'libraryId',
                    type: 'number'
                },
                "cidId": {
                    name: 'cidId',
                    type: 'number'
                },
                "smiles": {
                    name: 'smiles',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return ChemicalXrefsResultSet;
}());
exports.ChemicalXrefsResultSet = ChemicalXrefsResultSet;
//# sourceMappingURL=ChemicalXrefsResultSet.js.map