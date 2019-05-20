import {Component, OnInit, Input, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {ModelPredictedCountsResultSet} from "../../../../../types/sdk/models";
import {ExpSetApi} from "../../../../../types/sdk/services/custom";
import {ModalDirective} from 'ngx-bootstrap/modal';
import {Lightbox} from 'angular2-lightbox';
import {get} from 'lodash';

@Component({
    selector: 'app-expset-album-dialog',
    templateUrl: './expset-album-dialog.component.html',
    styleUrls: ['./expset-album-dialog.component.css'],
})
export class ExpsetAlbumDialogComponent implements OnInit {

    @Input('expSet') expSet: any;
    // @Input('modelPredictedCounts') modelPredictedCounts: ModelPredictedCountsResultSet;
    @Input('albums') albums: any;
    @Input('score') score: boolean;
    @Input('contactSheetResults') contactSheetResults: any = {interesting: {}};
    @Input('displayToggle') displayToggle: boolean = true;

    @ViewChild('lgModal') lgModal: ModalDirective;

    expSetAlbums: any = {treatmentReagentImages: [], ctrlReagentImages: [], ctrlNullImages: [], ctrlStrainImages: []};
    public showProgress = false;

    constructor(private expSetApi: ExpSetApi, public _lightbox: Lightbox) {
    }

    ngOnInit() {
        if(!this.contactSheetResults){
            this.contactSheetResults = {};
            this.contactSheetResults.interesting = {};
        }
    }

    getExpSets(counts: ModelPredictedCountsResultSet) {
        this.showProgress = true;
        this.showChildModal();
        this.showProgress = false;
    }

    createAlbum(albumName: string, images: Array<string>) {
        if(get(this.expSetAlbums, albumName)){
            this.expSetAlbums[albumName] = images.map((image: string) => {
                if (image) {
                    return image;
                }
            }).filter((t) => {
                return t;
            });
        }
    }


    showChildModal(): void {
        this.lgModal.show();
    }

    open(album, index: number): void {
        // open lightbox
        this._lightbox.open(album, index);
    }

}
