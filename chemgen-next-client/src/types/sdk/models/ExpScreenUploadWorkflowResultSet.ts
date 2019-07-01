/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ExpScreenUploadWorkflowResultSetInterface {
  "name"?: string;
  "comment"?: string;
  "site"?: string;
  "platePlan"?: any;
  "platePlanId"?: any;
  "platePlanHash"?: any;
  "assayViewType"?: string;
  "plateViewType"?: string;
  "instrumentPlateIdLookup"?: string;
  "wells"?: Array<any>;
  "screenId"?: number;
  "screenName"?: string;
  "instrumentId"?: number;
  "libraryId"?: number;
  "screenStage"?: string;
  "screenType"?: string;
  "biosamples"?: any;
  "libraryModel"?: string;
  "libraryStockModel"?: string;
  "reagentLookUp"?: string;
  "instrumentLookUp"?: string;
  "biosampleType"?: string;
  "stockPrepDate"?: Date;
  "cultureDate"?: Date;
  "assayDates"?: Array<any>;
  "search"?: any;
  "replicates"?: any;
  "conditions"?: Array<any>;
  "controlConditions"?: Array<any>;
  "experimentConditions"?: Array<any>;
  "biosampleMatchConditions"?: any;
  "experimentMatchConditions"?: any;
  "experimentDesign"?: any;
  "experimentGroups"?: any;
  "temperature"?: any;
  "librarycode"?: string;
  "id"?: any;
}

export class ExpScreenUploadWorkflowResultSet implements ExpScreenUploadWorkflowResultSetInterface {
  "name": string;
  "comment": string;
  "site": string;
  "platePlan": any;
  "platePlanId": any;
  "platePlanHash": any;
  "assayViewType": string;
  "plateViewType": string;
  "instrumentPlateIdLookup": string;
  "wells": Array<any>;
  "screenId": number;
  "screenName": string;
  "instrumentId": number;
  "libraryId": number;
  "screenStage": string;
  "screenType": string;
  "biosamples": any;
  "libraryModel": string;
  "libraryStockModel": string;
  "reagentLookUp": string;
  "instrumentLookUp": string;
  "biosampleType": string;
  "stockPrepDate": Date;
  "cultureDate": Date;
  "assayDates": Array<any>;
  "search": any;
  "replicates": any;
  "conditions": Array<any>;
  "controlConditions": Array<any>;
  "experimentConditions": Array<any>;
  "biosampleMatchConditions": any;
  "experimentMatchConditions": any;
  "experimentDesign": any;
  "experimentGroups": any;
  "temperature": any;
  "librarycode": string;
  "id": any;
  constructor(data?: ExpScreenUploadWorkflowResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ExpScreenUploadWorkflowResultSet`.
   */
  public static getModelName() {
    return "ExpScreenUploadWorkflow";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ExpScreenUploadWorkflowResultSet for dynamic purposes.
  **/
  public static factory(data: ExpScreenUploadWorkflowResultSetInterface): ExpScreenUploadWorkflowResultSet{
    return new ExpScreenUploadWorkflowResultSet(data);
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
      name: 'ExpScreenUploadWorkflowResultSet',
      plural: 'ExpScreenUploadWorkflowsResultSets',
      path: 'ExpScreenUploadWorkflows',
      idName: 'id',
      properties: {
        "name": {
          name: 'name',
          type: 'string'
        },
        "comment": {
          name: 'comment',
          type: 'string'
        },
        "site": {
          name: 'site',
          type: 'string'
        },
        "platePlan": {
          name: 'platePlan',
          type: 'any'
        },
        "platePlanId": {
          name: 'platePlanId',
          type: 'any'
        },
        "platePlanHash": {
          name: 'platePlanHash',
          type: 'any'
        },
        "assayViewType": {
          name: 'assayViewType',
          type: 'string'
        },
        "plateViewType": {
          name: 'plateViewType',
          type: 'string'
        },
        "instrumentPlateIdLookup": {
          name: 'instrumentPlateIdLookup',
          type: 'string'
        },
        "wells": {
          name: 'wells',
          type: 'Array&lt;any&gt;',
          default: <any>[]
        },
        "screenId": {
          name: 'screenId',
          type: 'number'
        },
        "screenName": {
          name: 'screenName',
          type: 'string'
        },
        "instrumentId": {
          name: 'instrumentId',
          type: 'number'
        },
        "libraryId": {
          name: 'libraryId',
          type: 'number'
        },
        "screenStage": {
          name: 'screenStage',
          type: 'string'
        },
        "screenType": {
          name: 'screenType',
          type: 'string'
        },
        "biosamples": {
          name: 'biosamples',
          type: 'any'
        },
        "libraryModel": {
          name: 'libraryModel',
          type: 'string'
        },
        "libraryStockModel": {
          name: 'libraryStockModel',
          type: 'string'
        },
        "reagentLookUp": {
          name: 'reagentLookUp',
          type: 'string'
        },
        "instrumentLookUp": {
          name: 'instrumentLookUp',
          type: 'string'
        },
        "biosampleType": {
          name: 'biosampleType',
          type: 'string'
        },
        "stockPrepDate": {
          name: 'stockPrepDate',
          type: 'Date'
        },
        "cultureDate": {
          name: 'cultureDate',
          type: 'Date'
        },
        "assayDates": {
          name: 'assayDates',
          type: 'Array&lt;any&gt;'
        },
        "search": {
          name: 'search',
          type: 'any'
        },
        "replicates": {
          name: 'replicates',
          type: 'any'
        },
        "conditions": {
          name: 'conditions',
          type: 'Array&lt;any&gt;'
        },
        "controlConditions": {
          name: 'controlConditions',
          type: 'Array&lt;any&gt;'
        },
        "experimentConditions": {
          name: 'experimentConditions',
          type: 'Array&lt;any&gt;'
        },
        "biosampleMatchConditions": {
          name: 'biosampleMatchConditions',
          type: 'any'
        },
        "experimentMatchConditions": {
          name: 'experimentMatchConditions',
          type: 'any'
        },
        "experimentDesign": {
          name: 'experimentDesign',
          type: 'any'
        },
        "experimentGroups": {
          name: 'experimentGroups',
          type: 'any'
        },
        "temperature": {
          name: 'temperature',
          type: 'any'
        },
        "librarycode": {
          name: 'librarycode',
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
