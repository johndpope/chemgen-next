import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {isEqual, uniqWith,  find, get, filter, shuffle, orderBy, uniqBy} from 'lodash';
import {
    ModelPredictedCountsResultSet,
    ExpScreenUploadWorkflowResultSet,
    ExpDesignResultSet,
    ExpScreenResultSet,
    RnaiLibraryResultSet,
    ChemicalLibraryResultSet,
    ExpAssayResultSet,
    ExpAssay2reagentResultSet,
    ExpPlateResultSet,
    ExpManualScoresResultSet, RnaiWormbaseXrefsResultSet
} from '../../../types/sdk/models';
import {Memoize} from 'lodash-decorators';
import {ExpSetSearchResults} from "../../../types/custom/ExpSetTypes";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: []
})

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
        let objects =  this.expSets.expManualScores.filter((expManualScore: ExpManualScoresResultSet) => {
            return isEqual(expManualScore.treatmentGroupId, treatmentGroupId);
        });
        //This should really be taken care of on the server side
        objects =  uniqWith(objects, isEqual);
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

