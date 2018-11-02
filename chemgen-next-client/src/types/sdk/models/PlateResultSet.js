"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var PlateResultSet = /** @class */ (function () {
    function PlateResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `PlateResultSet`.
     */
    PlateResultSet.getModelName = function () {
        return "Plate";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of PlateResultSet for dynamic purposes.
    **/
    PlateResultSet.factory = function (data) {
        return new PlateResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    PlateResultSet.getModelDefinition = function () {
        return {
            name: 'PlateResultSet',
            plural: 'PlatesResultSets',
            path: 'Plates',
            idName: 'id',
            properties: {
                "csPlateid": {
                    name: 'csPlateid',
                    type: 'number'
                },
                "id": {
                    name: 'id',
                    type: 'string'
                },
                "name": {
                    name: 'name',
                    type: 'string'
                },
                "description": {
                    name: 'description',
                    type: 'string'
                },
                "statusid": {
                    name: 'statusid',
                    type: 'number'
                },
                "logstat": {
                    name: 'logstat',
                    type: 'number'
                },
                "creator": {
                    name: 'creator',
                    type: 'string'
                },
                "creationdate": {
                    name: 'creationdate',
                    type: 'Date'
                },
                "creationtime": {
                    name: 'creationtime',
                    type: 'Date'
                },
                "protocolid": {
                    name: 'protocolid',
                    type: 'number'
                },
                "detaildatapath": {
                    name: 'detaildatapath',
                    type: 'string'
                },
                "imagepath": {
                    name: 'imagepath',
                    type: 'string'
                },
                "platestarttime": {
                    name: 'platestarttime',
                    type: 'Date'
                },
                "platefinishtime": {
                    name: 'platefinishtime',
                    type: 'Date'
                },
                "protocoldata": {
                    name: 'protocoldata',
                    type: 'string'
                },
                "wellcount": {
                    name: 'wellcount',
                    type: 'number'
                },
                "wfieldcount": {
                    name: 'wfieldcount',
                    type: 'number'
                },
                "fimagecount": {
                    name: 'fimagecount',
                    type: 'number'
                },
                "cellcount": {
                    name: 'cellcount',
                    type: 'number'
                },
                "scanid": {
                    name: 'scanid',
                    type: 'string'
                },
                "zsystemlistid": {
                    name: 'zsystemlistid',
                    type: 'string'
                },
                "logtype": {
                    name: 'logtype',
                    type: 'number'
                },
                "platestackid": {
                    name: 'platestackid',
                    type: 'number'
                },
                "savemodeid": {
                    name: 'savemodeid',
                    type: 'number'
                },
                "instrumentid": {
                    name: 'instrumentid',
                    type: 'number'
                },
                "runid": {
                    name: 'runid',
                    type: 'number'
                },
                "platebarcode": {
                    name: 'platebarcode',
                    type: 'string'
                },
                "stackid": {
                    name: 'stackid',
                    type: 'string'
                },
                "intervalcount": {
                    name: 'intervalcount',
                    type: 'number'
                },
                "formfactordata": {
                    name: 'formfactordata',
                    type: 'string'
                },
                "paId": {
                    name: 'paId',
                    type: 'number'
                },
                "paVersion": {
                    name: 'paVersion',
                    type: 'number'
                },
                "parentId": {
                    name: 'parentId',
                    type: 'number'
                },
                "auxSource": {
                    name: 'auxSource',
                    type: 'string'
                },
                "owner": {
                    name: 'owner',
                    type: 'string'
                },
                "siloId": {
                    name: 'siloId',
                    type: 'number'
                },
                "guid": {
                    name: 'guid',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return PlateResultSet;
}());
exports.PlateResultSet = PlateResultSet;
//# sourceMappingURL=PlateResultSet.js.map