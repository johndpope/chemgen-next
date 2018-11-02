"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ChemicalLibraryResultSet = /** @class */ (function () {
    function ChemicalLibraryResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ChemicalLibraryResultSet`.
     */
    ChemicalLibraryResultSet.getModelName = function () {
        return "ChemicalLibrary";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ChemicalLibraryResultSet for dynamic purposes.
    **/
    ChemicalLibraryResultSet.factory = function (data) {
        return new ChemicalLibraryResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ChemicalLibraryResultSet.getModelDefinition = function () {
        return {
            name: 'ChemicalLibraryResultSet',
            plural: 'ChemicalLibrariesResultSets',
            path: 'ChemicalLibraries',
            idName: 'compoundId',
            properties: {
                "compoundId": {
                    name: 'compoundId',
                    type: 'number'
                },
                "libraryId": {
                    name: 'libraryId',
                    type: 'number'
                },
                "plate": {
                    name: 'plate',
                    type: 'string'
                },
                "well": {
                    name: 'well',
                    type: 'string'
                },
                "compoundLibraryId": {
                    name: 'compoundLibraryId',
                    type: 'number'
                },
                "compoundSystematicName": {
                    name: 'compoundSystematicName',
                    type: 'string'
                },
                "compoundCommonName": {
                    name: 'compoundCommonName',
                    type: 'string'
                },
                "compoundMw": {
                    name: 'compoundMw',
                    type: 'number'
                },
                "compoundFormula": {
                    name: 'compoundFormula',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return ChemicalLibraryResultSet;
}());
exports.ChemicalLibraryResultSet = ChemicalLibraryResultSet;
//# sourceMappingURL=ChemicalLibraryResultSet.js.map