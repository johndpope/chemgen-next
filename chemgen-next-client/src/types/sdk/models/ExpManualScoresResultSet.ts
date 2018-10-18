/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ExpManualScoresResultSetInterface {
  "manualscoreId"?: number;
  "manualscoreGroup": string;
  "manualscoreCode": string;
  "manualscoreValue": number;
  "screenId": number;
  "screenName": string;
  "assayId"?: number;
  "treatmentGroupId"?: number;
  "scoreCodeId": number;
  "userId": number;
  "userName": string;
  "timestamp": Date;
  "expWorkflowId"?: string;
}

export class ExpManualScoresResultSet implements ExpManualScoresResultSetInterface {
  "manualscoreId": number;
  "manualscoreGroup": string;
  "manualscoreCode": string;
  "manualscoreValue": number;
  "screenId": number;
  "screenName": string;
  "assayId": number;
  "treatmentGroupId": number;
  "scoreCodeId": number;
  "userId": number;
  "userName": string;
  "timestamp": Date;
  "expWorkflowId": string;
  constructor(data?: ExpManualScoresResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ExpManualScoresResultSet`.
   */
  public static getModelName() {
    return "ExpManualScores";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ExpManualScoresResultSet for dynamic purposes.
  **/
  public static factory(data: ExpManualScoresResultSetInterface): ExpManualScoresResultSet{
    return new ExpManualScoresResultSet(data);
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
      name: 'ExpManualScoresResultSet',
      plural: 'ExpManualScoresResultSets',
      path: 'ExpManualScores',
      idName: 'manualscoreId',
      properties: {
        "manualscoreId": {
          name: 'manualscoreId',
          type: 'number'
        },
        "manualscoreGroup": {
          name: 'manualscoreGroup',
          type: 'string'
        },
        "manualscoreCode": {
          name: 'manualscoreCode',
          type: 'string'
        },
        "manualscoreValue": {
          name: 'manualscoreValue',
          type: 'number'
        },
        "screenId": {
          name: 'screenId',
          type: 'number'
        },
        "screenName": {
          name: 'screenName',
          type: 'string'
        },
        "assayId": {
          name: 'assayId',
          type: 'number'
        },
        "treatmentGroupId": {
          name: 'treatmentGroupId',
          type: 'number'
        },
        "scoreCodeId": {
          name: 'scoreCodeId',
          type: 'number'
        },
        "userId": {
          name: 'userId',
          type: 'number'
        },
        "userName": {
          name: 'userName',
          type: 'string'
        },
        "timestamp": {
          name: 'timestamp',
          type: 'Date'
        },
        "expWorkflowId": {
          name: 'expWorkflowId',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
