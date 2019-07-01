/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ArrayScanPlateMirrorResultSetInterface {
  "csPlateid": number;
  "id": string;
  "name"?: string;
  "description"?: string;
  "statusid"?: number;
  "logstat"?: number;
  "creator"?: string;
  "creationdate"?: Date;
  "creationtime"?: Date;
  "protocolid"?: number;
  "detaildatapath"?: string;
  "imagepath"?: string;
  "platestarttime"?: Date;
  "platefinishtime"?: Date;
  "protocoldata"?: string;
  "wellcount"?: number;
  "wfieldcount"?: number;
  "fimagecount"?: number;
  "cellcount"?: number;
  "scanid"?: string;
  "zsystemlistid"?: string;
  "logtype"?: number;
  "platestackid"?: number;
  "savemodeid"?: number;
  "instrumentid"?: number;
  "runid"?: number;
  "platebarcode"?: string;
  "stackid"?: string;
  "intervalcount"?: number;
  "formfactordata"?: string;
  "paId"?: number;
  "paVersion"?: number;
  "parentId"?: number;
  "auxSource"?: string;
  "owner"?: string;
  "siloId"?: number;
  "guid"?: string;
}

export class ArrayScanPlateMirrorResultSet implements ArrayScanPlateMirrorResultSetInterface {
  "csPlateid": number;
  "id": string;
  "name": string;
  "description": string;
  "statusid": number;
  "logstat": number;
  "creator": string;
  "creationdate": Date;
  "creationtime": Date;
  "protocolid": number;
  "detaildatapath": string;
  "imagepath": string;
  "platestarttime": Date;
  "platefinishtime": Date;
  "protocoldata": string;
  "wellcount": number;
  "wfieldcount": number;
  "fimagecount": number;
  "cellcount": number;
  "scanid": string;
  "zsystemlistid": string;
  "logtype": number;
  "platestackid": number;
  "savemodeid": number;
  "instrumentid": number;
  "runid": number;
  "platebarcode": string;
  "stackid": string;
  "intervalcount": number;
  "formfactordata": string;
  "paId": number;
  "paVersion": number;
  "parentId": number;
  "auxSource": string;
  "owner": string;
  "siloId": number;
  "guid": string;
  constructor(data?: ArrayScanPlateMirrorResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ArrayScanPlateMirrorResultSet`.
   */
  public static getModelName() {
    return "ArrayScanPlateMirror";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ArrayScanPlateMirrorResultSet for dynamic purposes.
  **/
  public static factory(data: ArrayScanPlateMirrorResultSetInterface): ArrayScanPlateMirrorResultSet{
    return new ArrayScanPlateMirrorResultSet(data);
  }
  /**
  * @method getModelDefinition
  * @author Julien Ledun
  * @license MIT
  * This method returns an object that represents some of the model
  * definitions.
  **/
  public static getModelDefinition() {
    return {
      name: 'ArrayScanPlateMirrorResultSet',
      plural: 'ArrayScanPlateMirrorsResultSets',
      path: 'ArrayScanPlateMirrors',
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
      relations: {
      }
    }
  }
}
