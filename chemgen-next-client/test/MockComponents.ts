import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ExperimentData, ScreenDesign, SearchExpBiosamples} from "../src/app/exp-screen/upload-screen/helpers";
import {ExpSetSearch, ExpSetSearchResults} from "../src/types/custom/ExpSetTypes";
import {ExpManualScoresResultSet, ExpScreenResultSet, ExpScreenUploadWorkflowResultSet} from "../src/types/sdk/models";
import {SearchFormExpScreenFormResults} from "../src/app/search/search.module";
import {SearchFormRnaiFormResults} from "../src/app/search/search.module";
import {ExpsetModule} from "../src/app/scoring/expset/expset.module";

@Component({
    selector: 'app-grid-album',
    template: '<p>Mock Grid Album Component</p>'
})
export class MockGridAlbumComponent {
    @Input('album') album: any;
    @Input('albums') albums: any;
    @Input('score') score: Boolean;
    @Input('plateId') plateId: number;
    @Input('albumType') albumType: string;
    @Input('contactSheetResults') contactSheetResults: any;
    @Input('displayCounts') displayCounts: any;
    @Input('expSetModule') expSetModule: ExpsetModule;

    @Output() parseInterestingEvent = new EventEmitter<string>();
    @Output() getExpSetsEvent = new EventEmitter<any>();
}

@Component({
    selector: 'app-exp-screen-info',
    template: '<p>Mock Plate Imaging Dates Component</p>'
})
export class MockExpScreenInfoComponent {
    @Input() expDataModel: ExperimentData;
    @Input() expBiosampleModel: SearchExpBiosamples;
}

@Component({
    selector: 'app-plate-imaging-dates',
    template: '<p>Mock Plate Imaging Dates Component</p>'
})
export class MockPlateImagingDatesComponent {
    @Input() plateModel: ScreenDesign;
}

@Component({
    selector: 'app-expset-toggle',
    template: '<p>Mock ExpSetToggle</p>',
})
export class MockExpsetToggleComponent{
    @Input() expScreen: ExpScreenResultSet;
    @Input() expWorkflow: ExpScreenUploadWorkflowResultSet;
    @Input() treatmentGroupId: number;
    @Input() assayId: any = null;
    @Input() contactSheetResults: any;
    @Input() expManualScores: ExpManualScoresResultSet[] = [];
    @Input() submit: boolean = true;
}

@Component({
    selector: 'app-contact-sheet',
    template: '<p>Mock Contact Sheet</p>',
})
export class MockContactSheetComponent{
    @Input() expSets: ExpSetSearchResults;
    @Input() byPlate: Boolean = true;
    // @Input() expSetModule: ExpsetModule;
    @Output() expSetsScored = new EventEmitter<boolean>();
}

@Component({
    selector: 'app-expset-album',
    template: '<p>Mock ExpSetAlbum</p>',
})
export class MockExpsetAlbumComponent{
    @Input('expSet') expSet: any;
    @Input('expSetModule') expSetModule: ExpsetModule;
    @Input('albums') albums: any;
    @Input('score') score: boolean;
    @Input('expSetAlbums') expSetAlbums: any;
    @Input('contactSheetResults') contactSheetResults: any = {interesting: {}};
}

@Component({
    selector: 'app-search-form-exp-screen',
    template: '<p>Mock Search Form Exp Screen</p>',
})
export class MockSearchFormExpScreen{
    @Input('formResults') formResults: SearchFormExpScreenFormResults;
}

@Component({
    selector: 'app-search-form-rnai',
    template: '<p>Mock Search Form Rnai</p>',
})
export class MockSearchFormRnai{
    @Input('formResults') formResults: SearchFormRnaiFormResults;
}

@Component({
    selector: 'app-expset-sheet',
    template: '<p>Mock Exp Set Sheet</p>',
})
export class MockExpsetSheet{
    @Input() expSets: any;
    @Input() expSetSearch: ExpSetSearch;
    @Input() expSetModule: ExpsetModule;
}

@Component({
    selector: 'app-expset-album-dialog',
    template: '<p>Mock ExpSet Album Dialog</p>',
})
export class MockExpsetAlbumDialog {
    @Input('expSet') expSet: any;
    // @Input('modelPredictedCounts') modelPredictedCounts: ModelPredictedCountsResultSet;
    @Input('albums') albums: any;
    @Input('score') score: boolean;
    @Input('contactSheetResults') contactSheetResults: any = {interesting: {}};
}

@Component({
    selector: 'app-expset-score-primary',
    template: '<p>Mock ExpSet Score Primary</p>',
})
export class MockExpsetScorePrimaryComponent {
    @Input('expSet') expSet: any;
    @Input('expSetModule') expSetModule: ExpsetModule;
    @Input('score') score: boolean;
    @Input('contactSheetResults') contactSheetResults: any = {interesting: {}};
    @Output() getMoreExpSets = new EventEmitter<boolean>();
}
