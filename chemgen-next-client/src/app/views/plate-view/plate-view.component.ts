import {Component, OnInit, Input} from '@angular/core';
import {Lightbox, LightboxConfig} from 'angular2-lightbox';
import {get, isObject, find, isEqual} from 'lodash';
import {ExpPlateResultSet} from "../../../types/sdk/models";
import {ExpsetModule, ExpSetSearchResults} from "../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";
import {ExpAssay2reagentResultSet} from "../../../types/sdk/models";

/**
 * Plate View
 * This view generates a layout of the entire plate
 * If the well is a reagent well (not an L4440/DMSO) then there is also a button that opens a modal to show the ExpSet View
 */

@Component({
    selector: 'app-plate-view',
    templateUrl: './plate-view.component.html',
    styleUrls: ['./plate-view.component.css']
})
export class PlateViewComponent implements OnInit {
    @Input() plateId: number;
    @Input() expSets: ExpSetSearchResults;
    public expSetModule: ExpsetModule;
    public plateAlbum: Array<any> = null;
    public thisPlate: ExpPlateResultSet = null;

    constructor(public _lightbox: Lightbox) {
    }

    ngOnInit() {
        this.preparePlateAlbum();
    }

    preparePlateAlbum() {
        this.plateAlbum = [];
        this.expSetModule = new ExpsetModule(this.expSets);
        this.expSetModule.deNormalizeExpSets();
        this.thisPlate = find(this.expSets.expPlates, {plateId: Number(this.plateId)});

        ['treatmentReagentImages', 'ctrlReagentImages', 'ctrlNullImages', 'ctrlStrainImages'].map((albumName) => {
            this.expSets.albums.map((expSetAlbum) => {
                expSetAlbum[albumName].filter((expSet) => {
                    return isEqual(Number(expSet.plateId), Number(this.plateId));
                }).map((album) => {
                    this.plateAlbum.push(album);
                });
            });
        });

        this.plateAlbum.map((plateAlbum: any) => {
            //@ts-ignore
            let expAssay2reagent: ExpAssay2reagentResultSet = find(this.expSets.expAssay2reagents, {assayId: plateAlbum.assayId});
            let treatmentGroupId = null;
            if (expAssay2reagent && isObject(expAssay2reagent) && get(expAssay2reagent, 'reagentType')) {
                let expDesignResultSets = this.expSetModule.getTreatmentGroupIdFromDesign(expAssay2reagent.expGroupId);
                treatmentGroupId = get(expDesignResultSets, [0, 'treatmentGroupId']);
                let expSet = find(this.expSetModule.expSetsDeNorm, {treatmentGroupId: treatmentGroupId});
                plateAlbum['treatmentGroupId'] = treatmentGroupId;
                plateAlbum['albums'] = get(expSet, 'albums');
                plateAlbum['expSet'] = expSet;
            }
        });
    }
    open(index: number): void {
        // open lightbox
        this._lightbox.open(this.plateAlbum, index);
    }
}
