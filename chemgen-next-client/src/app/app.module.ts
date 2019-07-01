import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {Injectable} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {PagesModule} from './pages/pages.module';
import {PageNotFoundComponent} from './pages/not-found.component';

//Main Imports
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

//Environment imports
import {environment} from "../environments/environment";

//Loopback SDK - generates model definition, services, etc
import {SDKBrowserModule, LoopBackConfig} from "../types/sdk";

// Highcharts is weird
import {HighchartsChartModule} from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import exporting from 'highcharts/modules/exporting.src';
import highcharts3D from 'highcharts/highcharts-3d.src.js';

exporting(Highcharts);
highcharts3D(Highcharts);
// Highcharts is weird

/**
 * UI Helper Modules
 */
import {UiSwitchModule} from 'ngx-ui-switch';
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {NgxSpinnerModule} from "ngx-spinner";
import {TypeaheadModule} from 'ngx-bootstrap/typeahead';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {ModalModule} from 'ngx-bootstrap/modal';
import {BsDatepickerModule} from 'ngx-bootstrap/datepicker';
import {DndModule} from 'ng2-dnd';
import {LightboxModule} from 'angular2-lightbox';
import {NouisliderModule} from 'ng2-nouislider';
import {AgGridModule} from 'ag-grid-angular';
import {HotkeyModule} from "angular2-hotkeys";

//I don't think I am using either of these - just the ngxspinner
import {NgProgressModule} from '@ngx-progressbar/core';
import {LoadingModule} from 'ngx-loading';

/**
 *  Components
 */

/**
 * Components - General
 */
import {EmptyComponent} from './empty/empty.component';

/**
 * Components - Upload a Screen
 */
import {RnaiPrimaryComponent} from './exp-screen/upload-screen/rnai/rnai-primary/rnai-primary.component';
import {RnaiSecondaryComponent} from './exp-screen/upload-screen/rnai/rnai-secondary/rnai-secondary.component';
import {ExpScreenInfoComponent} from './exp-screen/upload-screen/exp-screen-info/exp-screen-info.component';
import {PlateImagingDatesComponent} from './exp-screen/upload-screen/plate-imaging-dates/plate-imaging-dates.component';
import {RnaiPlatePlanComponent} from './exp-screen/upload-screen/rnai/rnai-secondary/rnai-plate-plan/rnai-plate-plan.component';
import {ChemicalSecondaryComponent} from './exp-screen/upload-screen/chemical/chemical-secondary/chemical-secondary.component';
import {ChemicalPrimaryComponent} from './exp-screen/upload-screen/chemical/chemical-primary/chemical-primary.component';

/**
 * Components - Albums, image layouts
 */
import {GridAlbumComponent} from './scoring/albums/grid-album/grid-album.component';
import {ExpsetAlbumComponent} from './scoring/albums/expset-album/expset-album.component';
import {ExpsetAlbumDialogComponent} from './scoring/albums/expset-album/expset-album-dialog/expset-album-dialog.component';

/**
 * Components - Search Forms
 */

/**
 * Components - Search Forms Child Components ( these are reusable components that are used throughout the site)
 */
import {SearchFormExpScreenComponent} from './search-forms/filter-components/search-form-exp-screen/search-form-exp-screen.component';
import {SearchFormRnaiComponent} from './search-forms/filter-components/search-form-rnai/search-form-rnai.component';
import {SearchFormChemicalComponent} from './search-forms/filter-components/search-form-chemical/search-form-chemical.component';
import {SearchFormViewOptionsComponent} from './search-forms/filter-components/search-form-view-options/search-form-view-options.component';

/**
 * Components - Search Forms for Various Experiment Data (score this, score that, expSetSearch for this, expSetSearch for that)
 */
import {SearchFormContactSheetPlateViewComponent} from './search-forms/search-form-contact-sheet-plate-view/search-form-contact-sheet-plate-view.component';
import {SearchFormExpsetsComponent} from './search-forms/search-form-expsets/search-form-expsets.component';
import {SearchFormScoreExpsetsComponent} from './search-forms/search-form-score-expsets/search-form-score-expsets.component';

/**
 * Components -  Scoring Forms
 */
import {ContactSheetPlateViewComponent} from "./scoring/contact-sheet-plate-view/contact-sheet-plate-view.component";
import {ExpsetSheetComponent} from './scoring/expset-sheet/expset-sheet.component';
import {ExpsetToggleComponent} from './scoring/expset-toggle/expset-toggle.component';
import {ExpsetScorePrimaryComponent} from './scoring/expset-score-primary/expset-score-primary.component';
import {ExpsetScorePrimaryDialogComponent} from './scoring/expset-score-primary-dialog/expset-score-primary-dialog.component';
import {ExpsetScorePrimarySheetComponent} from './scoring/expset-score-primary-sheet/expset-score-primary-sheet.component';
import {ScoredSummaryComponent} from './scoring/scored-summary/scored-summary.component';

/**
 * WIPs
 */
import {ScatterplotCountsComponent} from './viz/scatterplot-counts/scatterplot-counts.component';
import {SearchFormFilterByScoresComponent} from './search-forms/filter-components/search-form-filter-by-scores/search-form-filter-by-scores.component';
import {SearchFormFilterByScoresAdvancedComponent} from './search-forms/filter-components/search-form-filter-by-scores-advanced/search-form-filter-by-scores-advanced.component';
import {ContactSheetReplicateViewComponent} from "./scoring/contact-sheet-replicate-view/contact-sheet-replicate-view.component";
import {ExpWorkflowQcComponent} from './scoring/exp-workflow-qc/exp-workflow-qc.component';
import {SearchFormExpWorkflowQcComponent} from './search-forms/search-form-exp-workflow-qc/search-form-exp-workflow-qc.component';

/**
 * WIP Refactoring expSetSearch forms
 */
import {SearchFormBaseComponent} from './search-forms/search-form-base/search-form-base.component';
import {SearchFormContactSheetReplicateViewComponent} from './search-forms/search-form-contact-sheet-replicate-view/search-form-contact-sheet-replicate-view.component';
import {InterestingSummaryComponent} from './scoring/interesting-summary/interesting-summary.component';
import {SearchFormInterestingSummaryComponent} from './search-forms/search-form-interesting-summary/search-form-interesting-summary.component';
import {PlateViewComponent} from './views/plate-view/plate-view.component';
import {PlateViewRouteComponent} from './views/plate-view-route/plate-view-route.component';
import {ReagentDataComponent} from './views/expset-data/reagent-data/reagent-data.component';
import {PlateDataComponent} from './views/expset-data/plate-data/plate-data.component';
import {ScoreDataComponent} from './views/expset-data/score-data/score-data.component';
import {BatchDataComponent} from './views/expset-data/batch-data/batch-data.component';
import {ExpsetTabViewComponent} from './views/expset-tab-view/expset-tab-view.component';
import {RelatedExpsetsRouteComponent} from './views/related-expsets-route/related-expsets-route.component';
import {SearchFormRnaiLibraryComponent} from './search-forms/search-form-rnai-library/search-form-rnai-library.component';
import {SearchFormChemicalLibraryComponent} from './search-forms/search-form-chemical-library/search-form-chemical-library.component';
import {DetailedScoresComponent} from './scoring/detailed-scores/detailed-scores.component';
import {SearchFormDetailedScoresComponent} from "./search-forms/search-form-detailed-scores/search-form-detailed-scores.component";
import {ContactSheetReplicateViewRouteComponent} from './scoring/contact-sheet-replicate-view-route/contact-sheet-replicate-view-route.component';
import {ExpsetScorePrimaryRouteComponent} from './scoring/expset-score-primary-route/expset-score-primary-route.component';
import {UploadRnaiPrimaryComponent} from './upload-screens/upload-rnai-primary/upload-rnai-primary.component';
import {UploadRnaiPrimaryExpGroupPlateSelectionComponent} from './upload-screens/upload-rnai-primary-exp-group-plate-selection/upload-rnai-primary-exp-group-plate-selection.component';
import { UploadRnaiPrimaryFromGoogleSheetsComponent } from './upload-screens/upload-rnai-primary-from-google-sheets/upload-rnai-primary-from-google-sheets.component';
import { UploadRnaiPrimaryFromGoogleSheetsRouteComponent } from './upload-screens/upload-rnai-primary-from-google-sheets-route/upload-rnai-primary-from-google-sheets-route.component';

@NgModule({
    imports: [
        AgGridModule.withComponents([]),
        HighchartsChartModule,
        NgxSpinnerModule,
        BrowserModule,
        AppRoutingModule,
        PagesModule,
        HttpClientModule,
        FormsModule,
        InfiniteScrollModule,
        UiSwitchModule.forRoot({}),
        BsDatepickerModule.forRoot(),
        DndModule.forRoot(),
        SDKBrowserModule.forRoot(),
        ModalModule.forRoot(),
        BsDropdownModule.forRoot(),
        BsDatepickerModule.forRoot(),
        TooltipModule.forRoot(),
        TypeaheadModule.forRoot(),
        NgProgressModule.forRoot({}),
        // HotkeyModule.forRoot({cheatSheetHotkey: 'shift+h'}),
        HotkeyModule.forRoot(),
        LightboxModule,
        NouisliderModule,
        LoadingModule,
    ],
    declarations: [
        AppComponent,
        PageNotFoundComponent,
        RnaiPrimaryComponent,
        RnaiSecondaryComponent,
        ExpScreenInfoComponent,
        PlateImagingDatesComponent,
        RnaiPlatePlanComponent,
        ChemicalSecondaryComponent,
        ChemicalPrimaryComponent,
        GridAlbumComponent,
        ExpsetAlbumComponent,
        SearchFormExpScreenComponent,
        SearchFormRnaiComponent,
        SearchFormChemicalComponent,
        ContactSheetPlateViewComponent,
        SearchFormViewOptionsComponent,
        ExpsetAlbumDialogComponent,
        ExpsetSheetComponent,
        EmptyComponent,
        ExpsetToggleComponent,
        SearchFormExpsetsComponent,
        ScatterplotCountsComponent,
        SearchFormContactSheetPlateViewComponent,
        ExpsetScorePrimaryComponent,
        ExpsetScorePrimaryDialogComponent,
        SearchFormScoreExpsetsComponent,
        ExpsetScorePrimarySheetComponent,
        ScoredSummaryComponent,
        SearchFormFilterByScoresComponent,
        SearchFormFilterByScoresAdvancedComponent,
        ContactSheetReplicateViewComponent,
        ExpWorkflowQcComponent,
        SearchFormExpWorkflowQcComponent,
        SearchFormBaseComponent,
        SearchFormContactSheetReplicateViewComponent,
        InterestingSummaryComponent,
        SearchFormInterestingSummaryComponent,
        PlateViewComponent,
        PlateViewRouteComponent,
        ReagentDataComponent,
        PlateDataComponent,
        ScoreDataComponent,
        BatchDataComponent,
        ExpsetTabViewComponent,
        RelatedExpsetsRouteComponent,
        SearchFormRnaiLibraryComponent,
        SearchFormChemicalLibraryComponent,
        DetailedScoresComponent,
        SearchFormDetailedScoresComponent,
        ContactSheetReplicateViewRouteComponent,
        ExpsetScorePrimaryRouteComponent,
        UploadRnaiPrimaryComponent,
        UploadRnaiPrimaryExpGroupPlateSelectionComponent,
        UploadRnaiPrimaryFromGoogleSheetsComponent,
        UploadRnaiPrimaryFromGoogleSheetsRouteComponent,
    ],
    entryComponents: [],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {
        LoopBackConfig.setBaseURL(environment.loopbackApiUrl);
        LoopBackConfig.setApiVersion('api');
    }
}
