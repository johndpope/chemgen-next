/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface PlateSearchConfigurationResultSetInterface {
  "screenName": string;
  "screenMoniker": string;
  "screenId": number;
  "expWorkflowName"?: string;
  "barcodeSearches": any;
  "biosamples": any;
  "id"?: any;
}

export class PlateSearchConfigurationResultSet implements PlateSearchConfigurationResultSetInterface {
  "screenName": string;
  "screenMoniker": string;
  "screenId": number;
  "expWorkflowName": string;
  "barcodeSearches": any;
  "biosamples": any;
  "id": any;
  constructor(data?: PlateSearchConfigurationResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `PlateSearchConfigurationResultSet`.
   */
  public static getModelName() {
    return "PlateSearchConfiguration";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of PlateSearchConfigurationResultSet for dynamic purposes.
  **/
  public static factory(data: PlateSearchConfigurationResultSetInterface): PlateSearchConfigurationResultSet{
    return new PlateSearchConfigurationResultSet(data);
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
      name: 'PlateSearchConfigurationResultSet',
      plural: 'PlateSearchConfigurationsResultSets',
      path: 'PlateSearchConfigurations',
      idName: 'id',
      properties: {
        "screenName": {
          name: 'screenName',
          type: 'string'
        },
        "screenMoniker": {
          name: 'screenMoniker',
          type: 'string'
        },
        "screenId": {
          name: 'screenId',
          type: 'number'
        },
        "expWorkflowName": {
          name: 'expWorkflowName',
          type: 'string'
        },
        "barcodeSearches": {
          name: 'barcodeSearches',
          type: 'any'
        },
        "biosamples": {
          name: 'biosamples',
          type: 'any'
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
