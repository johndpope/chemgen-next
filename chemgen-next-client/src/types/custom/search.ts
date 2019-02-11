import {intersection, compact, isEqual, includes, shuffle, find, filter} from 'lodash';

/**
 * The search results on the front end give us a list of expWorkflowIds (Batch Ids) or expSetIds (mel-4 on 2012-12-12 in dhc-5 at 22.5)
 */
declare var Object: any;

export class IdResults {
  expWorkflowIds?: String[];
  expSetIds?: Number[];

  constructor(expWorkflowIds?: String[], expSetIds?: Number[]) {
    this.expSetIds = expSetIds;
    this.expWorkflowIds = expWorkflowIds;
  }

  /**
   * This is a poor mans join across tables that can't be joined
   * Instead of doing joins, just run the queries separately
   * Then see which are common between all, and return the results
   * @param results
   */
  getCommonResults(results: Array<Array<string | number>>) {
    results = compact(results);
    return intersection.apply(null, results);
  }
}

export interface ScreenSearchInterface {
  search(): void;
}

export interface ScreenMetaDataSearchInterface {
  wormStrainId?: number;
  temperature?: number;
  temperatureRange?: Number[];
  plateIds?: Number[];
  screenStage?: string;
  screenType?: string;
  screenId?: number;
}

export class ScreenMetaDataCriteria implements ScreenMetaDataSearchInterface {
  wormStrainId?: number;
  temperature?: number;
  temperatureRange?: Number[];
  plateIds?: Number[];
  screenStage?: string;
  screenType?: string;
  screenId?: number;

  constructor(data?: ScreenMetaDataSearchInterface) {
    Object.assign(this, data);
  }
}


export class ScreenCriteria {
  screenId: number;
  expWorkflowId: string;
}

export interface ReagentDataCriteriaInterface {
  rnaiList: String[];
  chemicalList: String[];
}

export class ReagentDataCriteria implements ReagentDataCriteriaInterface {
  rnaiList: String[];
  chemicalList: String[];

  constructor(data?: ReagentDataCriteriaInterface) {
    Object.assign(this, data);
  }
}
