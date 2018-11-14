/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ReactomePathwayResultSetInterface {
  "className"?: string;
  "dbId"?: string;
  "displayName"?: string;
  "hasDiagram"?: boolean;
  "isInDisease"?: boolean;
  "isInferred"?: boolean;
  "name"?: Array<any>;
  "releaseDate"?: string;
  "speciesName"?: string;
  "stdId"?: string;
  "stdIdVersion"?: string;
  "id"?: any;
}

export class ReactomePathwayResultSet implements ReactomePathwayResultSetInterface {
  "className": string;
  "dbId": string;
  "displayName": string;
  "hasDiagram": boolean;
  "isInDisease": boolean;
  "isInferred": boolean;
  "name": Array<any>;
  "releaseDate": string;
  "speciesName": string;
  "stdId": string;
  "stdIdVersion": string;
  "id": any;
  constructor(data?: ReactomePathwayResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ReactomePathwayResultSet`.
   */
  public static getModelName() {
    return "ReactomePathway";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ReactomePathwayResultSet for dynamic purposes.
  **/
  public static factory(data: ReactomePathwayResultSetInterface): ReactomePathwayResultSet{
    return new ReactomePathwayResultSet(data);
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
      name: 'ReactomePathwayResultSet',
      plural: 'ReactomePathwaysResultSets',
      path: 'ReactomePathways',
      idName: 'id',
      properties: {
        "className": {
          name: 'className',
          type: 'string'
        },
        "dbId": {
          name: 'dbId',
          type: 'string'
        },
        "displayName": {
          name: 'displayName',
          type: 'string'
        },
        "hasDiagram": {
          name: 'hasDiagram',
          type: 'boolean'
        },
        "isInDisease": {
          name: 'isInDisease',
          type: 'boolean'
        },
        "isInferred": {
          name: 'isInferred',
          type: 'boolean'
        },
        "name": {
          name: 'name',
          type: 'Array&lt;any&gt;'
        },
        "releaseDate": {
          name: 'releaseDate',
          type: 'string'
        },
        "speciesName": {
          name: 'speciesName',
          type: 'string'
        },
        "stdId": {
          name: 'stdId',
          type: 'string'
        },
        "stdIdVersion": {
          name: 'stdIdVersion',
          type: 'string'
        },
        "id": {
          name: 'id',
          type: 'any'
        },
      },
      relations: {
      }
    }
  }
}
