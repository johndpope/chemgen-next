"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ExpBiosampleResultSet = /** @class */ (function () {
    function ExpBiosampleResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ExpBiosampleResultSet`.
     */
    ExpBiosampleResultSet.getModelName = function () {
        return "ExpBiosample";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ExpBiosampleResultSet for dynamic purposes.
    **/
    ExpBiosampleResultSet.factory = function (data) {
        return new ExpBiosampleResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ExpBiosampleResultSet.getModelDefinition = function () {
        return {
            name: 'ExpBiosampleResultSet',
            plural: 'ExpBiosamplesResultSets',
            path: 'ExpBiosamples',
            idName: 'biosampleId',
            properties: {
                "biosampleId": {
                    name: 'biosampleId',
                    type: 'number'
                },
                "biosampleName": {
                    name: 'biosampleName',
                    type: 'string'
                },
                "biosampleType": {
                    name: 'biosampleType',
                    type: 'string'
                },
                "biosampleSpecies": {
                    name: 'biosampleSpecies',
                    type: 'string'
                },
                "biosampleStrain": {
                    name: 'biosampleStrain',
                    type: 'string'
                },
                "biosampleGene": {
                    name: 'biosampleGene',
                    type: 'string'
                },
                "biosampleAllele": {
                    name: 'biosampleAllele',
                    type: 'string'
                },
                "biosampleMeta": {
                    name: 'biosampleMeta',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return ExpBiosampleResultSet;
}());
exports.ExpBiosampleResultSet = ExpBiosampleResultSet;
//# sourceMappingURL=ExpBiosampleResultSet.js.map