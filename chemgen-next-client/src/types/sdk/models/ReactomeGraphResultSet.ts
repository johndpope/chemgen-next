/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ReactomeGraphResultSetInterface {
  "entityName": string;
  "nodes"?: Array<any>;
  "links"?: Array<any>;
  "pathways"?: Array<any>;
  "entities"?: Array<any>;
  "id"?: any;
}

export class ReactomeGraphResultSet implements ReactomeGraphResultSetInterface {
  "entityName": string;
  "nodes": Array<any>;
  "links": Array<any>;
  "pathways": Array<any>;
  "entities": Array<any>;
  "id": any;
  constructor(data?: ReactomeGraphResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ReactomeGraphResultSet`.
   */
  public static getModelName() {
    return "ReactomeGraph";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ReactomeGraphResultSet for dynamic purposes.
  **/
  public static factory(data: ReactomeGraphResultSetInterface): ReactomeGraphResultSet{
    return new ReactomeGraphResultSet(data);
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
      name: 'ReactomeGraphResultSet',
      plural: 'ReactomeGraphsResultSets',
      path: 'ReactomeGraphs',
      idName: 'id',
      properties: {
        "entityName": {
          name: 'entityName',
          type: 'string'
        },
        "nodes": {
          name: 'nodes',
          type: 'Array&lt;any&gt;'
        },
        "links": {
          name: 'links',
          type: 'Array&lt;any&gt;'
        },
        "pathways": {
          name: 'pathways',
          type: 'Array&lt;any&gt;'
        },
        "entities": {
          name: 'entities',
          type: 'Array&lt;any&gt;'
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
