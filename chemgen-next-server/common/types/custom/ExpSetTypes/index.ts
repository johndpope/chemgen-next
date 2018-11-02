import {
  ChemicalLibraryResultSet,
  ExpAssay2reagentResultSet, ExpAssayResultSet, ExpDesignResultSet,
  ExpGroupResultSet, ExpPlateResultSet,
  ExpScreenResultSet, ExpScreenUploadWorkflowResultSet,
  RnaiLibraryResultSet,
  ModelPredictedCountsResultSet, ExpManualScoreCodeResultSet, ExpManualScoresResultSet, RnaiWormbaseXrefsResultSet,
} from "../../sdk/models";
import {uniqBy, shuffle, uniqWith, orderBy, get, isEqual, isNull, isUndefined, isArray, find, isObject} from 'lodash';
import {Memoize} from 'lodash-decorators';

declare var Object: any;

export interface ExpSetSearchInterface {
  chemicalSearch?: Array<string>;
  rnaiSearch?: Array<string>;
  assaySearch?: Array<number>;
  librarySearch?: Array<any>;
  screenSearch?: Array<any>;
  expWorkflowSearch?: Array<any>;
  plateSearch?: Array<number>;
  currentPage?: number;
  expGroupSearch?: Array<number>;
  skip?: number;
  pageSize?: number;
  ctrlLimit?: number;
  scoresExist?: any;
  scoresQuery?: any;
  method?: string;
  //Filters to include different contactSheetResults
  compoundsXRefs?: Boolean;
  expAssays?: Boolean;
  expAssay2reagents?: Boolean;
  modelPredictedCounts?: Boolean;
  expPlates?: Boolean;
  expScreens?: Boolean;
  expWorkflows?: Boolean;
  expManualScores?: Boolean;
  expSets?: Boolean;
  albums?: Boolean;
  expGroupTypeAlbums?: Boolean;
}

export class ExpSetSearch {
  rnaiSearch ?: Array<string>;
  chemicalSearch ?: Array<string>;
  assaySearch ?: Array<number>;
  librarySearch ?: Array<any>;
  screenSearch ?: Array<any>;
  expWorkflowSearch ?: Array<any>;
  plateSearch ?: Array<number>;
  expGroupSearch ?: Array<number>;
  currentPage ?: number;
  method ?: string;
  skip ?: number;
  pageSize ?: number = 1;
  ctrlLimit ?: number = 4;
  //Filter for scores existing
  //If its null just grab whatever
  //If its false grab ExpSets that are not scored
  //If its true grab ExpSets that are scored
  scoresExist?: any = null;
  scoresQuery?: any = null;
  //Filters to include different contactSheetResults
  compoundsXRefs?: Boolean = true;
  expAssays?: Boolean = true;
  expAssay2reagents?: Boolean = true;
  modelPredictedCounts?: Boolean = true;
  expPlates?: Boolean = true;
  expScreens?: Boolean = true;
  expWorkflows?: Boolean = true;
  expManualScores?: Boolean = true;
  expSets?: Boolean = true;
  albums?: Boolean = true;
  expGroupTypeAlbums?: Boolean = true;

  constructor(data?: ExpSetSearchInterface) {
    //Allow for searching either using pagination or skip
    if (isUndefined(data)) {
      data = {};
    }
    if (isUndefined(data.skip) || isNull(data.skip)) {
      data.skip = 0;
    }
    if (isUndefined(data.currentPage) || isNull(data.currentPage)) {
      data.currentPage = 1;
    } else {
      data.skip = data.pageSize * (data.currentPage - 1);
    }
    // If these aren't already an array, make them an array
    ['arraySearch', 'rnaiSearch', 'chemicalSearch', 'librarySearch', 'screenSearch', 'expWorkflowSearch', 'expGroupSearch'].map((searchKey) => {
      if (isUndefined(data[searchKey]) || isNull(data[searchKey] || !data[searchKey])) {
        data[searchKey] = [];
      } else if (!isArray(data[searchKey])) {
        data[searchKey] = [data[searchKey]];
      }
    });
    Object.assign(this, data);
  }
}

export interface ExpSetSearchResultsInterface {
  rnaisList?: RnaiLibraryResultSet[];
  rnaisXrefs?: RnaiWormbaseXrefsResultSet[];
  compoundsList?: ChemicalLibraryResultSet[];
  //This is a placeholder until we get some actual chemical xrefs
  compoundsXRefs?: ChemicalLibraryResultSet[];
  expAssays?: ExpAssayResultSet[];
  expAssay2reagents?: ExpAssay2reagentResultSet[];
  modelPredictedCounts?: ModelPredictedCountsResultSet[];
  expPlates?: ExpPlateResultSet[];
  expScreens?: ExpScreenResultSet[];
  expWorkflows?: ExpScreenUploadWorkflowResultSet[];
  expManualScores?: ExpManualScoresResultSet[];
  expSets?: Array<ExpDesignResultSet[]>;
  albums?: Array<any>;
  expGroupTypeAlbums?: any;
  currentPage?: number;
  skip?: number;
  totalPages?: number;
  pageSize?: number;
  fetchedFromCache?: boolean;
}

export class ExpSetSearchResults {
  rnaisList?: RnaiLibraryResultSet[] = [];
  rnaisXrefs?: RnaiWormbaseXrefsResultSet[] = [];
  compoundsList?: ChemicalLibraryResultSet[] = [];
  expAssays?: ExpAssayResultSet[] = [];
  expAssay2reagents?: ExpAssay2reagentResultSet[] = [];
  modelPredictedCounts?: ModelPredictedCountsResultSet[] = [];
  expPlates?: ExpPlateResultSet[] = [];
  expScreens?: ExpScreenResultSet[] = [];
  expWorkflows?: ExpScreenUploadWorkflowResultSet[] = [];
  expManualScores?: ExpManualScoresResultSet[] = [];
  expSets?: Array<ExpDesignResultSet[]>;
  albums ?: Array<any> = [];
  expGroupTypeAlbums?: any = [];
  currentPage ?: number = 1;
  skip ?: number = 0;
  totalPages ?: number = 0;
  pageSize ?: number = 20;
  fetchedFromCache ?: boolean = false;

  constructor(data?: ExpSetSearchResultsInterface) {
    Object.assign(this, data);
  }
}


/**
 * Search by Counts
 */

export interface ExpSetSearchByCountsInterface {
  assaySearch?: Array<number>;
  modelSearch?: Array<number>;
  screenSearch?: Array<any>;
  expWorkflowSearch?: Array<any>;
  plateSearch?: Array<number>;
  currentPage?: number;
  skip?: number;
  pageSize?: number;
  ctrlLimit?: number;
  expGroupSearch?: Array<number>;
  includeCounts?: Boolean;
  includeAlbums?: Boolean;
  includeManualScores?: Boolean;
  filterManualScores?: Boolean;
  orderBy?: string;
  order?: string;
}

export class ExpSetSearchByCounts {
  assaySearch ?: Array<number>;
  modelSearch ?: Array<number>;
  screenSearch ?: Array<any>;
  expWorkflowSearch ?: Array<any>;
  plateSearch ?: Array<number>;
  currentPage ?: number;
  skip ?: number;
  pageSize ?: number = 20;
  ctrlLimit ?: number = 4;
  expGroupSearch ?: Array<number>;
  includeCounts ?: Boolean = true;
  includeAlbums ?: Boolean = true;
  includeManualScores ?: Boolean = false;
  filterManualScores ?: Boolean = false;
  orderBy ?: string;
  order ?: string = 'DESC';

  constructor(data?: ExpSetSearchByCountsInterface) {
    if (!isObject(data)) {
      data = {};
    }
    data.includeCounts = true;
    data.includeAlbums = true;
    //Allow for searching either using pagination or skip
    if (isUndefined(data.skip) || isNull(data.skip)) {
      data.skip = 0;
    }
    if (isUndefined(data.currentPage) || isNull(data.currentPage)) {
      data.currentPage = 1;
    } else {
      data.skip = data.pageSize * (data.currentPage - 1);
    }
    // If these aren't already an array, make them an array
    ['arraySearch', 'modelSearch', 'screenSearch', 'expWorkflowSearch', 'expGroupSearch'].map((searchKey) => {
      if (isUndefined(data[searchKey]) || isNull(data[searchKey] || !data[searchKey])) {
        data[searchKey] = [];
      } else if (!isArray(data[searchKey])) {
        data[searchKey] = [data[searchKey]];
      }
    });
    Object.assign(this, data);
  }
}

export class ExpsetModule {

  public expSets: ExpSetSearchResults;
  public expSetsDeNorm: Array<any> = [];

  constructor(expSets: ExpSetSearchResults) {
    this.expSets = expSets;
    this.expSets.expWorkflows = this.expSets.expWorkflows.map((expWorkflow) => {
      return this.findExpWorkflow(String(expWorkflow.id));
    });
  }

  @Memoize()
  findExpWorkflow(expWorkflowId: string) {
    let expWorkflow = find(this.expSets.expWorkflows, (expWorkflow: ExpScreenUploadWorkflowResultSet) => {
      return isEqual(expWorkflowId, expWorkflow.id);
    });
    if (get(expWorkflow, ["temperature", "$numberDouble"])) {
      expWorkflow.temperature = expWorkflow.temperature["$numberDouble"];
    }
    return expWorkflow;
  }

  @Memoize()
  findExpManualScores(treatmentGroupId: number) {
    let objects = this.expSets.expManualScores.filter((expManualScore: ExpManualScoresResultSet) => {
      return isEqual(expManualScore.treatmentGroupId, treatmentGroupId);
    });
    //This should really be taken care of on the server side
    objects = uniqWith(objects, isEqual);
    return orderBy(objects, 'manualscoreValue', 'desc');
  }

  @Memoize()
  findExpPlates(expWorkflowId: string) {
    return this.expSets.expPlates.filter((expPlate: ExpPlateResultSet) => {
      return isEqual(expWorkflowId, expPlate.expWorkflowId);
    });
  }

  @Memoize()
  findExpScreen(screenId: number) {
    return find(this.expSets.expScreens, (screen: ExpScreenResultSet) => {
      return isEqual(screenId, screen.screenId);
    });
  }

  @Memoize()
  getTreatmentGroupIdFromDesign(expGroupId: number) {
    return this.expSets.expSets.filter((expSet: Array<ExpDesignResultSet>) => {
      return expSet.filter((expDesignRow: ExpDesignResultSet) => {
        return isEqual(expGroupId, expDesignRow.treatmentGroupId) || isEqual(expGroupId, expDesignRow.controlGroupId);
      })[0];
    })[0];
  }

  @Memoize()
  findModelPredictedCounts(treatmentGroupId: number) {
    return this.expSets.modelPredictedCounts.filter((counts: ModelPredictedCountsResultSet) => {
      return isEqual(counts.treatmentGroupId, treatmentGroupId);
    });
  }

  @Memoize()
  findExpSets(treatmentGroupId) {
    return this.expSets.expSets.filter((expSet: Array<ExpDesignResultSet>) => {
      return isEqual(treatmentGroupId, expSet[0].treatmentGroupId);
    })[0];
  }

  @Memoize()
  findAlbums(treatmentGroupId) {
    return this.expSets.albums.filter((album: any) => {
      return isEqual(treatmentGroupId, album.treatmentGroupId);
    })[0];
  }

  @Memoize()
  findExpAssay2reagents(expGroupId: number) {
    return this.expSets.expAssay2reagents.filter((expAssay2reagent: ExpAssay2reagentResultSet) => {
      return isEqual(expGroupId, expAssay2reagent.expGroupId);
    });
  }

  @Memoize()
  findReagents(treatmentGroupId) {
    const expAssay2reagents: ExpAssay2reagentResultSet[] = this.expSets.expAssay2reagents.filter((expAssay2reagent) => {
      return isEqual(Number(expAssay2reagent.treatmentGroupId), Number(treatmentGroupId));
    });
    let rnaisList: RnaiLibraryResultSet[] = [];
    let compoundsList: ChemicalLibraryResultSet[] = [];
    expAssay2reagents.map((expAssay2reagent) => {
      if (expAssay2reagent.reagentTable.match('Rnai')) {
        this.expSets.rnaisList.filter((rnai: RnaiLibraryResultSet) => {
          return isEqual(rnai.libraryId, expAssay2reagent.libraryId) && isEqual(rnai.rnaiId, expAssay2reagent.reagentId);
        }).map((rnai: RnaiLibraryResultSet) => {
          rnaisList.push(rnai);
        });

        if (rnaisList.length) {
          rnaisList = uniqBy(rnaisList, 'rnaiId');
        }

        rnaisList.map((rnai: RnaiLibraryResultSet) => {
          rnai['xrefs'] = this.expSets.rnaisXrefs.filter((rnaiXref: RnaiWormbaseXrefsResultSet) => {
            return isEqual(rnaiXref.wbGeneSequenceId, rnai.geneName);
          });
        });

      } else if (expAssay2reagent.reagentTable.match('Chem')) {
        this.expSets.compoundsList.filter((compound: ChemicalLibraryResultSet) => {
          return isEqual(compound.compoundId, expAssay2reagent.reagentId);
        }).map((compound: ChemicalLibraryResultSet) => {
          compoundsList.push(compound);
        });

        if (compoundsList.length) {
          compoundsList = uniqBy(compoundsList, 'compoundId');
          compoundsList.map((compound: ChemicalLibraryResultSet) => {
            //For now we don't have any xrefs - so this is just a placeholder
            compound['xref'] = [];
          });
        }
      }
    });
    return {rnaisList: rnaisList, compoundsList: compoundsList};
  }

  /**
   * The data structure that is returned from the server is very flattened and normalized to save on size
   * We denormalize it here
   */
  deNormalizeExpSets() {
    this.expSetsDeNorm = this.expSets.albums.map((album: any) => {
      return this.deNormalizeAlbum(album);
    });
    return this.expSetsDeNorm;
  }

  //TO DO This is basically the same thing as the getExpSet function - fix that
  deNormalizeAlbum(album: any) {
    let expWorkflow: ExpScreenUploadWorkflowResultSet = this.findExpWorkflow(album.expWorkflowId);
    let expScreen: ExpScreenResultSet = this.findExpScreen(expWorkflow.screenId);
    let expPlates: ExpPlateResultSet[] = this.findExpPlates(album.expWorkflowId);
    let reagentsList = this.findReagents(album.treatmentGroupId);
    let expManualScores = this.findExpManualScores(album.treatmentGroupId);
    album.expWorkflow = expWorkflow;
    album.expSet = this.findExpSets(album.treatmentGroupId);
    //I cannot figure out why this isn't taken care of on the backend
    ['ctrlNullImages', 'ctrlStrainImages'].map((ctrlKey) => {
      if (get(album, ctrlKey)) {
        album[ctrlKey] = shuffle(album[ctrlKey]).slice(0, 4);
      }
    });
    return {
      treatmentGroupId: album.treatmentGroupId,
      albums: album,
      expWorkflow: expWorkflow,
      expSet: album.expSet,
      expScreen: expScreen,
      rnaisList: reagentsList.rnaisList,
      compoundsList: reagentsList.compoundsList,
      expPlates: expPlates,
      expManualScores: expManualScores,
    };
  }

  // TODO Fix this - it assumes there are counts
  getExpSet(wellCounts: ModelPredictedCountsResultSet) {
    const o: any = {};

    o.expWorkflow = this.findExpWorkflow(wellCounts.expWorkflowId);

    o.expScreen = this.findExpScreen(wellCounts.screenId);

    let treatmentGroupId = wellCounts.treatmentGroupId;
    if (!treatmentGroupId) {
      const expSet = this.getTreatmentGroupIdFromDesign(wellCounts.expGroupId);
      if (expSet) {
        treatmentGroupId = expSet[0].treatmentGroupId;
        wellCounts.treatmentGroupId = treatmentGroupId;
      }
    }

    if (treatmentGroupId) {
      o.modelPredictedCounts = this.findModelPredictedCounts(treatmentGroupId);
      o.expSets = this.findExpSets(treatmentGroupId);
      o.albums = this.findAlbums(treatmentGroupId);
      o.expPlates = this.findExpPlates(o.expWorkflow.id);
      o.expManualScores = this.findExpManualScores(treatmentGroupId);
      o.treatmentGroupId = treatmentGroupId;
      let reagentsList = this.findReagents(treatmentGroupId);
      o.rnaisList = reagentsList.rnaisList;
      o.compoundsList = reagentsList.compoundsList;
    } else {
      o.modelPredictedCounts = [];
      o.expSets = [];
      o.albums = {};
    }
    ['ctrlNullImages', 'ctrlStrainImages'].map((ctrlKey) => {
      if (get(o.albums, ctrlKey)) {
        o.albums[ctrlKey] = shuffle(o.albums[ctrlKey]).slice(0, 4);
      }
    });

    return o;
  }

  createAlbum(expSetAlbums: any, albumName: string, images: Array<string>) {
    expSetAlbums[albumName] = images.map((image: string) => {
      if (image) {
        return {
          src: `http://onyx.abudhabi.nyu.edu/images/${image}-autolevel.jpeg`,
          caption: `Image ${image} caption here`,
          thumb: `http://onyx.abudhabi.nyu.edu/images/${image}-autolevel.jpeg`,
        };
      }
    }).filter((t) => {
      return t;
    });
    return expSetAlbums;
  }
}

export interface PredictPrimaryPhenotypeExpSetInterface {
  timestamp: any;
  treatmentGroupId: number;
  screenId: number;
  screenName: string;
  screenStage: string;
  expWorkflowId: string;
  manualscoreGroup: string;
  reagentWormCountR0: number;
  reagentLarvaCountR0: number;
  reagentEggCountR0: number;
  reagentWormCountR1: number;
  reagentLarvaCountR1: number;
  reagentEggCountR1: number;
  ctrlWormCountR0: number;
  ctrlLarvaCountR0: number;
  ctrlEggCountR0: number;
  ctrlWormCountR1: number;
  ctrlLarvaCountR1: number;
  ctrlEggCountR1: number;
  ctrlWormCountR2: number;
  ctrlLarvaCountR2: number;
  ctrlEggCountR2: number;
  ctrlWormCountR3: number;
  ctrlLarvaCountR3: number;
  ctrlEggCountR3: number;
  predictedScore?: number;
}

export class PredictPrimaryPhenotypeExpSet {
  timestamp: any;
  treatmentGroupId: number;
  screenId: number;
  screenName: string;
  expWorkflowId: string;
  screenStage: string;
  manualscoreGroup: string;
  reagentWormCountR0: number;
  reagentLarvaCountR0: number;
  reagentEggCountR0: number;
  reagentWormCountR1: number;
  reagentLarvaCountR1: number;
  reagentEggCountR1: number;
  ctrlWormCountR0: number;
  ctrlLarvaCountR0: number;
  ctrlEggCountR0: number;
  ctrlWormCountR1: number;
  ctrlLarvaCountR1: number;
  ctrlEggCountR1: number;
  ctrlWormCountR2: number;
  ctrlLarvaCountR2: number;
  ctrlEggCountR2: number;
  ctrlWormCountR3: number;
  ctrlLarvaCountR3: number;
  ctrlEggCountR3: number;
  predictedScore?: number;

  constructor(data?: PredictPrimaryPhenotypeExpSetInterface) {
    Object.assign(this, data);
  }
}

export interface PredictSecondaryPhenotypeExpSetInterface extends PredictPrimaryPhenotypeExpSetInterface {
  reagentWormCountR2: number;
  reagentLarvaCountR2: number;
  reagentEggCountR2: number;
  reagentWormCountR3: number;
  reagentLarvaCountR3: number;
  reagentEggCountR3: number;
  reagentWormCountR4: number;
  reagentLarvaCountR4: number;
  reagentEggCountR4: number;
  reagentWormCountR5: number;
  reagentLarvaCountR5: number;
  reagentEggCountR5: number;
  reagentWormCountR6: number;
  reagentLarvaCountR6: number;
  reagentEggCountR6: number;
  reagentWormCountR7: number;
  reagentLarvaCountR7: number;
  reagentEggCountR7: number;
}

export class PredictSecondaryPhenotypeExpSet extends PredictPrimaryPhenotypeExpSet {
  reagentWormCountR2: number;
  reagentLarvaCountR2: number;
  reagentEggCountR2: number;
  reagentWormCountR3: number;
  reagentLarvaCountR3: number;
  reagentEggCountR3: number;
  reagentWormCountR4: number;
  reagentLarvaCountR4: number;
  reagentEggCountR4: number;
  reagentWormCountR5: number;
  reagentLarvaCountR5: number;
  reagentEggCountR5: number;
  reagentWormCountR6: number;
  reagentLarvaCountR6: number;
  reagentEggCountR6: number;
  reagentWormCountR7: number;
  reagentLarvaCountR7: number;
  reagentEggCountR7: number;

  constructor(data?: PredictSecondaryPhenotypeExpSetInterface) {
    super(data);
    Object.assign(this, data);
  }
}
