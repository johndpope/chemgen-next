"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var RnaiWormbaseXrefsResultSet = /** @class */ (function () {
    function RnaiWormbaseXrefsResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `RnaiWormbaseXrefsResultSet`.
     */
    RnaiWormbaseXrefsResultSet.getModelName = function () {
        return "RnaiWormbaseXrefs";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of RnaiWormbaseXrefsResultSet for dynamic purposes.
    **/
    RnaiWormbaseXrefsResultSet.factory = function (data) {
        return new RnaiWormbaseXrefsResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    RnaiWormbaseXrefsResultSet.getModelDefinition = function () {
        return {
            name: 'RnaiWormbaseXrefsResultSet',
            plural: 'RnaiWormbaseXrefsResultSets',
            path: 'RnaiWormbaseXrefs',
            idName: 'id',
            properties: {
                "id": {
                    name: 'id',
                    type: 'number'
                },
                "wbGeneSequenceId": {
                    name: 'wbGeneSequenceId',
                    type: 'string'
                },
                "wbGeneAccession": {
                    name: 'wbGeneAccession',
                    type: 'string'
                },
                "wbGeneCgcName": {
                    name: 'wbGeneCgcName',
                    type: 'string'
                },
                "wbTranscript": {
                    name: 'wbTranscript',
                    type: 'string'
                },
                "wbProteinAccession": {
                    name: 'wbProteinAccession',
                    type: 'string'
                },
                "insdcParentSeq": {
                    name: 'insdcParentSeq',
                    type: 'string'
                },
                "insdcLocusTag": {
                    name: 'insdcLocusTag',
                    type: 'string'
                },
                "insdcProteinId": {
                    name: 'insdcProteinId',
                    type: 'string'
                },
                "uniprotAccession": {
                    name: 'uniprotAccession',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return RnaiWormbaseXrefsResultSet;
}());
exports.RnaiWormbaseXrefsResultSet = RnaiWormbaseXrefsResultSet;
//# sourceMappingURL=RnaiWormbaseXrefsResultSet.js.map