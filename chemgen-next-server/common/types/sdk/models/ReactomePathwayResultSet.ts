/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ReactomePathwayResultSetInterface {
  "id"?: any;
}

export class ReactomePathwayResultSet implements ReactomePathwayResultSetInterface {
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
