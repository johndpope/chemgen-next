/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ReactomeEntityResultSetInterface {
  "dbId"?: string;
  "databaseName"?: string;
  "compartmentAccession"?: Array<any>;
  "compartmentNames"?: Array<any>;
  "exactType"?: string;
  "id"?: any;
  "isDisease"?: boolean;
  "name"?: string;
  "referenceIdentifier"?: string;
  "referenceUrl"?: string;
  "stId"?: string;
  "species"?: Array<any>;
}

export class ReactomeEntityResultSet implements ReactomeEntityResultSetInterface {
  "dbId": string;
  "databaseName": string;
  "compartmentAccession": Array<any>;
  "compartmentNames": Array<any>;
  "exactType": string;
  "id": any;
  "isDisease": boolean;
  "name": string;
  "referenceIdentifier": string;
  "referenceUrl": string;
  "stId": string;
  "species": Array<any>;
  constructor(data?: ReactomeEntityResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ReactomeEntityResultSet`.
   */
  public static getModelName() {
    return "ReactomeEntity";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ReactomeEntityResultSet for dynamic purposes.
  **/
  public static factory(data: ReactomeEntityResultSetInterface): ReactomeEntityResultSet{
    return new ReactomeEntityResultSet(data);
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
      name: 'ReactomeEntityResultSet',
      plural: 'ReactomeEntitiesResultSets',
      path: 'ReactomeEntities',
      idName: 'id',
      properties: {
        "dbId": {
          name: 'dbId',
          type: 'string'
        },
        "databaseName": {
          name: 'databaseName',
          type: 'string'
        },
        "compartmentAccession": {
          name: 'compartmentAccession',
          type: 'Array&lt;any&gt;'
        },
        "compartmentNames": {
          name: 'compartmentNames',
          type: 'Array&lt;any&gt;'
        },
        "exactType": {
          name: 'exactType',
          type: 'string'
        },
        "id": {
          name: 'id',
          type: 'any'
        },
        "isDisease": {
          name: 'isDisease',
          type: 'boolean'
        },
        "name": {
          name: 'name',
          type: 'string'
        },
        "referenceIdentifier": {
          name: 'referenceIdentifier',
          type: 'string'
        },
        "referenceUrl": {
          name: 'referenceUrl',
          type: 'string'
        },
        "stId": {
          name: 'stId',
          type: 'string'
        },
        "species": {
          name: 'species',
          type: 'Array&lt;any&gt;'
        },
      },
      relations: {
      }
    }
  }
}
