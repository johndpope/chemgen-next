/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ExpScreenResultSetInterface {
  "screenId"?: number;
  "screenName"?: string;
  "screenMoniker"?: string;
  "screenType"?: string;
  "screenStage"?: string;
  "screenDescription"?: string;
  "screenProtocol"?: string;
  "screenParentId"?: number;
  "screenPerformedBy"?: string;
  "screenMeta"?: string;
}

export class ExpScreenResultSet implements ExpScreenResultSetInterface {
  "screenId": number;
  "screenName": string;
  "screenMoniker": string;
  "screenType": string;
  "screenStage": string;
  "screenDescription": string;
  "screenProtocol": string;
  "screenParentId": number;
  "screenPerformedBy": string;
  "screenMeta": string;
  constructor(data?: ExpScreenResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ExpScreenResultSet`.
   */
  public static getModelName() {
    return "ExpScreen";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ExpScreenResultSet for dynamic purposes.
  **/
  public static factory(data: ExpScreenResultSetInterface): ExpScreenResultSet{
    return new ExpScreenResultSet(data);
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
      name: 'ExpScreenResultSet',
      plural: 'ExpScreensResultSets',
      path: 'ExpScreens',
      idName: 'screenId',
      properties: {
        "screenId": {
          name: 'screenId',
          type: 'number'
        },
        "screenName": {
          name: 'screenName',
          type: 'string'
        },
        "screenMoniker": {
          name: 'screenMoniker',
          type: 'string'
        },
        "screenType": {
          name: 'screenType',
          type: 'string'
        },
        "screenStage": {
          name: 'screenStage',
          type: 'string'
        },
        "screenDescription": {
          name: 'screenDescription',
          type: 'string'
        },
        "screenProtocol": {
          name: 'screenProtocol',
          type: 'string'
        },
        "screenParentId": {
          name: 'screenParentId',
          type: 'number'
        },
        "screenPerformedBy": {
          name: 'screenPerformedBy',
          type: 'string'
        },
        "screenMeta": {
          name: 'screenMeta',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
