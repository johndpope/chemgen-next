"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var RnaiLibraryResultSet = /** @class */ (function () {
    function RnaiLibraryResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `RnaiLibraryResultSet`.
     */
    RnaiLibraryResultSet.getModelName = function () {
        return "RnaiLibrary";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of RnaiLibraryResultSet for dynamic purposes.
    **/
    RnaiLibraryResultSet.factory = function (data) {
        return new RnaiLibraryResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    RnaiLibraryResultSet.getModelDefinition = function () {
        return {
            name: 'RnaiLibraryResultSet',
            plural: 'RnaiLibrariesResultSets',
            path: 'RnaiLibraries',
            idName: 'rnaiId',
            properties: {
                "rnaiId": {
                    name: 'rnaiId',
                    type: 'number'
                },
                "libraryId": {
                    name: 'libraryId',
                    type: 'number'
                },
                "rnaiType": {
                    name: 'rnaiType',
                    type: 'string'
                },
                "plate": {
                    name: 'plate',
                    type: 'string'
                },
                "well": {
                    name: 'well',
                    type: 'string'
                },
                "chrom": {
                    name: 'chrom',
                    type: 'string'
                },
                "geneName": {
                    name: 'geneName',
                    type: 'string'
                },
                "fwdPrimer": {
                    name: 'fwdPrimer',
                    type: 'string'
                },
                "revPrimer": {
                    name: 'revPrimer',
                    type: 'string'
                },
                "bioloc": {
                    name: 'bioloc',
                    type: 'string'
                },
                "stocktitle": {
                    name: 'stocktitle',
                    type: 'string'
                },
                "stockloc": {
                    name: 'stockloc',
                    type: 'string'
                },
                "reagentType": {
                    name: 'reagentType',
                    type: 'string'
                },
                "reagentName": {
                    name: 'reagentName',
                    type: 'string'
                },
                "masterPlateWell": {
                    name: 'masterPlateWell',
                    type: 'string'
                },
                "masterPlate": {
                    name: 'masterPlate',
                    type: 'string'
                },
                "masterWell": {
                    name: 'masterWell',
                    type: 'string'
                },
                "stockPlateWell": {
                    name: 'stockPlateWell',
                    type: 'string'
                },
                "stockPlate": {
                    name: 'stockPlate',
                    type: 'string'
                },
                "stockWell": {
                    name: 'stockWell',
                    type: 'string'
                },
                "primaryTargetGeneId": {
                    name: 'primaryTargetGeneId',
                    type: 'string'
                },
                "primaryTargetGeneSystematicName": {
                    name: 'primaryTargetGeneSystematicName',
                    type: 'string'
                },
                "primaryTargetGeneCommonName": {
                    name: 'primaryTargetGeneCommonName',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return RnaiLibraryResultSet;
}());
exports.RnaiLibraryResultSet = RnaiLibraryResultSet;
//# sourceMappingURL=RnaiLibraryResultSet.js.map