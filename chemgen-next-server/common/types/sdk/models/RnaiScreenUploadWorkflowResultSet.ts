/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface RnaiScreenUploadWorkflowResultSetInterface {
  "name"?: string;
  "comment"?: string;
  "platePlan"?: any;
  "platePlanId"?: string;
  "assayViewType"?: string;
  "plateViewType"?: string;
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
  "assayDates"?: any;
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
  "site"?: string;
  "platePlanHash"?: any;
  "instrumentPlateIdLookup"?: string;
  "cultureDate"?: Date;
  "id"?: any;
}

export class RnaiScreenUploadWorkflowResultSet implements RnaiScreenUploadWorkflowResultSetInterface {
  "name": string;
  "comment": string;
  "platePlan": any;
  "platePlanId": string;
  "assayViewType": string;
  "plateViewType": string;
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
  "assayDates": any;
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
  "site": string;
  "platePlanHash": any;
  "instrumentPlateIdLookup": string;
  "cultureDate": Date;
  "id": any;
  constructor(data?: RnaiScreenUploadWorkflowResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `RnaiScreenUploadWorkflowResultSet`.
   */
  public static getModelName() {
    return "RnaiScreenUploadWorkflow";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of RnaiScreenUploadWorkflowResultSet for dynamic purposes.
  **/
  public static factory(data: RnaiScreenUploadWorkflowResultSetInterface): RnaiScreenUploadWorkflowResultSet{
    return new RnaiScreenUploadWorkflowResultSet(data);
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
      name: 'RnaiScreenUploadWorkflowResultSet',
      plural: 'RnaiScreenUploadWorkflowsResultSets',
      path: 'RnaiScreenUploadWorkflows',
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
        "platePlan": {
          name: 'platePlan',
          type: 'any'
        },
        "platePlanId": {
          name: 'platePlanId',
          type: 'string'
        },
        "assayViewType": {
          name: 'assayViewType',
          type: 'string'
        },
        "plateViewType": {
          name: 'plateViewType',
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
          type: 'number',
          default: 1
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
          type: 'string',
          default: 'RnaiLibrary'
        },
        "libraryStockModel": {
          name: 'libraryStockModel',
          type: 'string',
          default: 'RnaiLibraryStock'
        },
        "reagentLookUp": {
          name: 'reagentLookUp',
          type: 'string',
          default: 'rnaiId'
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
        "assayDates": {
          name: 'assayDates',
          type: 'any'
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
          type: 'Array&lt;any&gt;',
          default: <any>[]
        },
        "controlConditions": {
          name: 'controlConditions',
          type: 'Array&lt;any&gt;',
          default: <any>[]
        },
        "experimentConditions": {
          name: 'experimentConditions',
          type: 'Array&lt;any&gt;',
          default: <any>[]
        },
        "biosampleMatchConditions": {
          name: 'biosampleMatchConditions',
          type: 'any',
          default: <any>null
        },
        "experimentMatchConditions": {
          name: 'experimentMatchConditions',
          type: 'any',
          default: <any>null
        },
        "experimentDesign": {
          name: 'experimentDesign',
          type: 'any',
          default: <any>null
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
        "site": {
          name: 'site',
          type: 'string'
        },
        "platePlanHash": {
          name: 'platePlanHash',
          type: 'any'
        },
        "instrumentPlateIdLookup": {
          name: 'instrumentPlateIdLookup',
          type: 'string'
        },
        "cultureDate": {
          name: 'cultureDate',
          type: 'Date'
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
