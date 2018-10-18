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

//Loopback SDK - generates model definition, services, etc
import {SDKBrowserModule} from '../types/sdk';
import {LoopBackConfig} from '../types/sdk';

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
import {BsDatepickerModule} from 'ngx-bootstrap';
import {DndModule} from 'ng2-dnd';
import {LightboxModule} from 'angular2-lightbox';
import {NouisliderModule} from 'ng2-nouislider';
import {AgGridModule} from 'ag-grid-angular';

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
import {SearchFormExpScreenComponent} from './search-forms/search-form-exp-screen/search-form-exp-screen.component';
import {SearchFormRnaiComponent} from './search-forms/search-form-rnai/search-form-rnai.component';
import {SearchFormChemicalComponent} from './search-forms/search-form-chemical/search-form-chemical.component';
import {SearchFormViewOptionsComponent} from './search-forms/search-form-view-options/search-form-view-options.component';

/**
 * Components - Search Forms for Various Experiment Data (score this, score that, search for this, search for that)
 */
import {SearchFormContactSheetPrimaryComponent} from './search-forms/search-form-contact-sheet-primary/search-form-contact-sheet-primary.component';
import {SearchFormExpsetsComponent} from './search-forms/search-form-expsets/search-form-expsets.component';
import {SearchFormScoreExpsetsComponent} from './search-forms/search-form-score-expsets/search-form-score-expsets.component';

/**
 * Components -  Scoring Forms
 */
import {ContactSheetComponent} from './scoring/contact-sheet/contact-sheet.component';
import {SearchFormWormsComponent} from './search-forms/search-form-worms/search-form-worms.component';
import {ExpsetSheetComponent} from './scoring/expset-sheet/expset-sheet.component';
import {ExpsetToggleComponent} from './scoring/expset-toggle/expset-toggle.component';
import {ExpsetScorePrimaryComponent} from './scoring/expset-score-primary/expset-score-primary.component';
import {ExpsetScorePrimaryDialogComponent} from './scoring/expset-score-primary-dialog/expset-score-primary-dialog.component';
import {ExpsetScorePrimarySheetComponent} from './scoring/expset-score-primary-sheet/expset-score-primary-sheet.component';
// import {PrimaryEnhComponent} from './scoring/forms/primary-enh/primary-enh.component';
import {HotkeyModule} from "angular2-hotkeys";

/**
 * WIPs
 */
import {ScatterplotCountsComponent} from './viz/scatterplot-counts/scatterplot-counts.component';
import {ScoredSummaryComponent} from './scoring/scored-summary/scored-summary.component';

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
        TooltipModule.forRoot(),
        TypeaheadModule.forRoot(),
        NgProgressModule.forRoot({}),
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
        ContactSheetComponent,
        SearchFormViewOptionsComponent,
        ExpsetAlbumDialogComponent,
        SearchFormWormsComponent,
        ExpsetSheetComponent,
        EmptyComponent,
        ExpsetToggleComponent,
        SearchFormExpsetsComponent,
        ScatterplotCountsComponent,
        SearchFormContactSheetPrimaryComponent,
        ExpsetScorePrimaryComponent,
        ExpsetScorePrimaryDialogComponent,
        SearchFormScoreExpsetsComponent,
        // PrimaryEnhComponent,
        ExpsetScorePrimarySheetComponent,
        ScoredSummaryComponent
    ],
    entryComponents: [],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {
        // TODO Need to add this to an environmental variables
        // LoopBackConfig.setBaseURL('http://10.230.9.227:3000');
        LoopBackConfig.setBaseURL('http://localhost:3000');
        LoopBackConfig.setApiVersion('api');
    }
}
