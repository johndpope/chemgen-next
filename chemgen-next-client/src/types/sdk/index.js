"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
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
var error_service_1 = require("./services/core/error.service");
var auth_service_1 = require("./services/core/auth.service");
var logger_service_1 = require("./services/custom/logger.service");
var SDKModels_1 = require("./services/custom/SDKModels");
var storage_swaps_1 = require("./storage/storage.swaps");
var http_1 = require("@angular/common/http");
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var cookie_browser_1 = require("./storage/cookie.browser");
var storage_browser_1 = require("./storage/storage.browser");
var BiosampleStock_1 = require("./services/custom/BiosampleStock");
var ChemicalLibrary_1 = require("./services/custom/ChemicalLibrary");
var ExpDesign_1 = require("./services/custom/ExpDesign");
var ExpGroup_1 = require("./services/custom/ExpGroup");
var ExpAssay2reagent_1 = require("./services/custom/ExpAssay2reagent");
var ExpScreen_1 = require("./services/custom/ExpScreen");
var ExpBiosample_1 = require("./services/custom/ExpBiosample");
var ExpPlate_1 = require("./services/custom/ExpPlate");
var ExpAssay_1 = require("./services/custom/ExpAssay");
var ReagentLibrary_1 = require("./services/custom/ReagentLibrary");
var RnaiLibrary_1 = require("./services/custom/RnaiLibrary");
var ChemicalLibraryStock_1 = require("./services/custom/ChemicalLibraryStock");
var ChemicalXrefs_1 = require("./services/custom/ChemicalXrefs");
var RnaiLibraryStock_1 = require("./services/custom/RnaiLibraryStock");
var RnaiWormbaseXrefs_1 = require("./services/custom/RnaiWormbaseXrefs");
var Plate_1 = require("./services/custom/Plate");
var ExpScreenUploadWorkflow_1 = require("./services/custom/ExpScreenUploadWorkflow");
var WpTerms_1 = require("./services/custom/WpTerms");
var WpPosts_1 = require("./services/custom/WpPosts");
var WpPostmeta_1 = require("./services/custom/WpPostmeta");
var WpTermRelationships_1 = require("./services/custom/WpTermRelationships");
var WpTermTaxonomy_1 = require("./services/custom/WpTermTaxonomy");
var RnaiScreenUploadWorkflow_1 = require("./services/custom/RnaiScreenUploadWorkflow");
var ModelPredictedPheno_1 = require("./services/custom/ModelPredictedPheno");
var ModelPredictedCounts_1 = require("./services/custom/ModelPredictedCounts");
var ModelPredictedRank_1 = require("./services/custom/ModelPredictedRank");
var ExpManualScores_1 = require("./services/custom/ExpManualScores");
var ExpManualScoreCode_1 = require("./services/custom/ExpManualScoreCode");
var PlatePlan96_1 = require("./services/custom/PlatePlan96");
var Analysis_1 = require("./services/custom/Analysis");
var RnaiExpSet_1 = require("./services/custom/RnaiExpSet");
var ChemicalExpSet_1 = require("./services/custom/ChemicalExpSet");
var ExpSet_1 = require("./services/custom/ExpSet");
var Models_1 = require("./services/custom/Models");
var ReactomeEntity_1 = require("./services/custom/ReactomeEntity");
var ReactomePathway_1 = require("./services/custom/ReactomePathway");
var ReactomeGraph_1 = require("./services/custom/ReactomeGraph");
/**
* @module SDKBrowserModule
* @description
* This module should be imported when building a Web Application in the following scenarios:
*
*  1.- Regular web application
*  2.- Angular universal application (Browser Portion)
*  3.- Progressive applications (Angular Mobile, Ionic, WebViews, etc)
**/
var SDKBrowserModule = /** @class */ (function () {
    function SDKBrowserModule() {
    }
    SDKBrowserModule_1 = SDKBrowserModule;
    SDKBrowserModule.forRoot = function (internalStorageProvider) {
        if (internalStorageProvider === void 0) { internalStorageProvider = {
            provide: storage_swaps_1.InternalStorage,
            useClass: cookie_browser_1.CookieBrowser
        }; }
        return {
            ngModule: SDKBrowserModule_1,
            providers: [
                auth_service_1.LoopBackAuth,
                logger_service_1.LoggerService,
                SDKModels_1.SDKModels,
                BiosampleStock_1.BiosampleStockApi,
                ChemicalLibrary_1.ChemicalLibraryApi,
                ExpDesign_1.ExpDesignApi,
                ExpGroup_1.ExpGroupApi,
                ExpAssay2reagent_1.ExpAssay2reagentApi,
                ExpScreen_1.ExpScreenApi,
                ExpBiosample_1.ExpBiosampleApi,
                ExpPlate_1.ExpPlateApi,
                ExpAssay_1.ExpAssayApi,
                ReagentLibrary_1.ReagentLibraryApi,
                RnaiLibrary_1.RnaiLibraryApi,
                ChemicalLibraryStock_1.ChemicalLibraryStockApi,
                ChemicalXrefs_1.ChemicalXrefsApi,
                RnaiLibraryStock_1.RnaiLibraryStockApi,
                RnaiWormbaseXrefs_1.RnaiWormbaseXrefsApi,
                Plate_1.PlateApi,
                ExpScreenUploadWorkflow_1.ExpScreenUploadWorkflowApi,
                WpTerms_1.WpTermsApi,
                WpPosts_1.WpPostsApi,
                WpPostmeta_1.WpPostmetaApi,
                WpTermRelationships_1.WpTermRelationshipsApi,
                WpTermTaxonomy_1.WpTermTaxonomyApi,
                RnaiScreenUploadWorkflow_1.RnaiScreenUploadWorkflowApi,
                ModelPredictedPheno_1.ModelPredictedPhenoApi,
                ModelPredictedCounts_1.ModelPredictedCountsApi,
                ModelPredictedRank_1.ModelPredictedRankApi,
                ExpManualScores_1.ExpManualScoresApi,
                ExpManualScoreCode_1.ExpManualScoreCodeApi,
                PlatePlan96_1.PlatePlan96Api,
                Analysis_1.AnalysisApi,
                RnaiExpSet_1.RnaiExpSetApi,
                ChemicalExpSet_1.ChemicalExpSetApi,
                ExpSet_1.ExpSetApi,
                Models_1.ModelsApi,
                ReactomeEntity_1.ReactomeEntityApi,
                ReactomePathway_1.ReactomePathwayApi,
                ReactomeGraph_1.ReactomeGraphApi,
                internalStorageProvider,
                { provide: storage_swaps_1.SDKStorage, useClass: storage_browser_1.StorageBrowser }
            ]
        };
    };
    SDKBrowserModule = SDKBrowserModule_1 = __decorate([
        core_1.NgModule({
            imports: [common_1.CommonModule, http_1.HttpClientModule],
            declarations: [],
            exports: [],
            providers: [
                error_service_1.ErrorHandler
            ]
        })
    ], SDKBrowserModule);
    return SDKBrowserModule;
    var SDKBrowserModule_1;
}());
exports.SDKBrowserModule = SDKBrowserModule;
/**
* Have Fun!!!
* - Jon
**/
__export(require("./models/index"));
__export(require("./services/index"));
__export(require("./lb.config"));
__export(require("./storage/storage.swaps"));
var cookie_browser_2 = require("./storage/cookie.browser");
exports.CookieBrowser = cookie_browser_2.CookieBrowser;
var storage_browser_2 = require("./storage/storage.browser");
exports.StorageBrowser = storage_browser_2.StorageBrowser;
//# sourceMappingURL=index.js.map