import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Input} from '@angular/core';
import {ExpManualScoresResultSet, ModelPredictedCountsResultSet} from '../../../../types/sdk/models';
import {Lightbox} from 'angular2-lightbox';

import {get, find, isEqual, isEmpty} from 'lodash';
import {ExpsetModule} from "../../expset/expset.module";

@Component({
    selector: 'app-expset-album',
    templateUrl: './expset-album.component.html',
    styleUrls: ['./expset-album.component.css'],
    providers: [],
})

export class ExpsetAlbumComponent implements OnInit {
    @Input('expSet') expSet: any;
    @Input('albums') albums: any;
    @Input('score') score: boolean;
    @Input('expSetAlbums') expSetAlbums: any;
    @Input('contactSheetResults') contactSheetResults: any = {interesting: {}};
    @Input('expSetModule') expSetModule: ExpsetModule;
    @Input('displayToggle') displayToggle: boolean = true;
    @Input('displayScoreExpSet') displayScoreExpSet: boolean = true;

    constructor(public _lightbox: Lightbox) {
    }

    ngOnInit() {
    }

    junkClass(album, index: number) {
        if (this.expSet && get(this.expSet, 'albums')) {
            let well = get(this.expSet.albums, album)[index];
            let assayId = get(well, 'assayId');
            if (assayId && get(this.expSetModule, ['expSets', 'expManualScores'])) {
                let junk = find(this.expSetModule.expSets.expManualScores, (manualScore: ExpManualScoresResultSet) => {
                    return isEqual(manualScore.assayId, assayId) &&
                        isEqual(manualScore.manualscoreGroup, 'JUNK') &&
                        isEqual(manualScore.manualscoreValue, 1)
                });
                if (junk) {
                    return 'junk';
                } else {
                    return '';
                }
            } else {
                //Something weird happened!
            }
            return '';
        }
    }

    open(album, index: number): void {
        // open lightbox
        this._lightbox.open(album, index);
    }

}
