/* tslint:disable */
/**
* @module SDKModule
* @author Jonathan Casarrubias <t:@johncasarrubias> <gh:jonathan-casarrubias>
* @license MIT 2016 Jonathan Casarrubias
* @version 2.1.0
* @description
* The SDKModule is a generated Software Development Kit automatically built by
* the LoopBack SDK Builder open source module.
*
* The SDKModule provides Angular 2 >= RC.5 support, which means that NgModules
* can import this Software Development Kit as follows:
*
*
* APP Route Module Context
* ============================================================================
* import { NgModule }       from '@angular/core';
* import { BrowserModule }  from '@angular/platform-browser';
* // App Root 
* import { AppComponent }   from './app.component';
* // Feature Modules
* import { SDK[Browser|Node|Native]Module } from './shared/sdk/sdk.module';
* // Import Routing
* import { routing }        from './app.routing';
* @NgModule({
*  imports: [
*    BrowserModule,
*    routing,
*    SDK[Browser|Node|Native]Module.forRoot()
*  ],
*  declarations: [ AppComponent ],
*  bootstrap:    [ AppComponent ]
* })
* export class AppModule { }
*
**/
import { ErrorHandler } from './services/core/error.service';
import { LoopBackAuth } from './services/core/auth.service';
import { LoggerService } from './services/custom/logger.service';
import { SDKModels } from './services/custom/SDKModels';
import { InternalStorage, SDKStorage } from './storage/storage.swaps';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CookieBrowser } from './storage/cookie.browser';
import { StorageBrowser } from './storage/storage.browser';
import { BiosampleStockApi } from './services/custom/BiosampleStock';
import { ChemicalLibraryApi } from './services/custom/ChemicalLibrary';
import { ExpDesignApi } from './services/custom/ExpDesign';
import { ExpGroupApi } from './services/custom/ExpGroup';
import { ExpAssay2reagentApi } from './services/custom/ExpAssay2reagent';
import { ExpScreenApi } from './services/custom/ExpScreen';
import { ExpBiosampleApi } from './services/custom/ExpBiosample';
import { ExpPlateApi } from './services/custom/ExpPlate';
import { ExpAssayApi } from './services/custom/ExpAssay';
import { ReagentLibraryApi } from './services/custom/ReagentLibrary';
import { RnaiLibraryApi } from './services/custom/RnaiLibrary';
import { ChemicalLibraryStockApi } from './services/custom/ChemicalLibraryStock';
import { ChemicalXrefsApi } from './services/custom/ChemicalXrefs';
import { RnaiLibraryStockApi } from './services/custom/RnaiLibraryStock';
import { RnaiWormbaseXrefsApi } from './services/custom/RnaiWormbaseXrefs';
import { PlateApi } from './services/custom/Plate';
import { ArrayScanPlateMirrorApi } from './services/custom/ArrayScanPlateMirror';
import { ExpScreenUploadWorkflowApi } from './services/custom/ExpScreenUploadWorkflow';
import { WpTermsApi } from './services/custom/WpTerms';
import { WpPostsApi } from './services/custom/WpPosts';
import { WpPostmetaApi } from './services/custom/WpPostmeta';
import { WpTermRelationshipsApi } from './services/custom/WpTermRelationships';
import { WpTermTaxonomyApi } from './services/custom/WpTermTaxonomy';
import { RnaiScreenUploadWorkflowApi } from './services/custom/RnaiScreenUploadWorkflow';
import { ModelPredictedPhenoApi } from './services/custom/ModelPredictedPheno';
import { ModelPredictedCountsApi } from './services/custom/ModelPredictedCounts';
import { ModelPredictedRankApi } from './services/custom/ModelPredictedRank';
import { ExpManualScoresApi } from './services/custom/ExpManualScores';
import { ExpManualScoreCodeApi } from './services/custom/ExpManualScoreCode';
import { PlatePlan96Api } from './services/custom/PlatePlan96';
import { AnalysisApi } from './services/custom/Analysis';
import { RnaiExpSetApi } from './services/custom/RnaiExpSet';
import { ChemicalExpSetApi } from './services/custom/ChemicalExpSet';
import { ExpSetApi } from './services/custom/ExpSet';
import { ModelsApi } from './services/custom/Models';
import { ReactomeEnityApi } from './services/custom/ReactomeEnity';
import { ReactomePathwayApi } from './services/custom/ReactomePathway';
import { PlateSearchConfigurationApi } from './services/custom/PlateSearchConfiguration';
/**
* @module SDKBrowserModule
* @description
* This module should be imported when building a Web Application in the following scenarios:
*
*  1.- Regular web application
*  2.- Angular universal application (Browser Portion)
*  3.- Progressive applications (Angular Mobile, Ionic, WebViews, etc)
**/
@NgModule({
  imports:      [ CommonModule, HttpClientModule ],
  declarations: [ ],
  exports:      [ ],
  providers:    [
    ErrorHandler
  ]
})
export class SDKBrowserModule {
  static forRoot(internalStorageProvider: any = {
    provide: InternalStorage,
    useClass: CookieBrowser
  }): ModuleWithProviders {
    return {
      ngModule  : SDKBrowserModule,
      providers : [
        LoopBackAuth,
        LoggerService,
        SDKModels,
        BiosampleStockApi,
        ChemicalLibraryApi,
        ExpDesignApi,
        ExpGroupApi,
        ExpAssay2reagentApi,
        ExpScreenApi,
        ExpBiosampleApi,
        ExpPlateApi,
        ExpAssayApi,
        ReagentLibraryApi,
        RnaiLibraryApi,
        ChemicalLibraryStockApi,
        ChemicalXrefsApi,
        RnaiLibraryStockApi,
        RnaiWormbaseXrefsApi,
        PlateApi,
        ArrayScanPlateMirrorApi,
        ExpScreenUploadWorkflowApi,
        WpTermsApi,
        WpPostsApi,
        WpPostmetaApi,
        WpTermRelationshipsApi,
        WpTermTaxonomyApi,
        RnaiScreenUploadWorkflowApi,
        ModelPredictedPhenoApi,
        ModelPredictedCountsApi,
        ModelPredictedRankApi,
        ExpManualScoresApi,
        ExpManualScoreCodeApi,
        PlatePlan96Api,
        AnalysisApi,
        RnaiExpSetApi,
        ChemicalExpSetApi,
        ExpSetApi,
        ModelsApi,
        ReactomeEnityApi,
        ReactomePathwayApi,
        PlateSearchConfigurationApi,
        internalStorageProvider,
        { provide: SDKStorage, useClass: StorageBrowser }
      ]
    };
  }
}
/**
* Have Fun!!!
* - Jon
**/
export * from './models/index';
export * from './services/index';
export * from './lb.config';
export * from './storage/storage.swaps';
export { CookieBrowser } from './storage/cookie.browser';
export { StorageBrowser } from './storage/storage.browser';

