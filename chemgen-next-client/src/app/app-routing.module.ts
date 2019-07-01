import {NgModule} from '@angular/core';
import {ExtraOptions, RouterModule, Routes} from '@angular/router';

import {PageNotFoundComponent} from './pages/not-found.component';
import {PagesComponent} from './pages/pages.component';
import {RnaiPrimaryComponent} from './exp-screen/upload-screen/rnai/rnai-primary/rnai-primary.component';
import {RnaiPlatePlanComponent} from './exp-screen/upload-screen/rnai/rnai-secondary/rnai-plate-plan/rnai-plate-plan.component';
import {RnaiSecondaryComponent} from './exp-screen/upload-screen/rnai/rnai-secondary/rnai-secondary.component';
import {ChemicalPrimaryComponent} from './exp-screen/upload-screen/chemical/chemical-primary/chemical-primary.component';
import {ChemicalSecondaryComponent} from './exp-screen/upload-screen/chemical/chemical-secondary/chemical-secondary.component';
import {EmptyComponent} from "./empty/empty.component";
import {SearchFormExpsetsComponent} from "./search-forms/search-form-expsets/search-form-expsets.component";
import {ScatterplotCountsComponent} from "./viz/scatterplot-counts/scatterplot-counts.component";
import {SearchFormContactSheetPlateViewComponent} from "./search-forms/search-form-contact-sheet-plate-view/search-form-contact-sheet-plate-view.component";
import {SearchFormScoreExpsetsComponent} from "./search-forms/search-form-score-expsets/search-form-score-expsets.component";
import {ScoredSummaryComponent} from "./scoring/scored-summary/scored-summary.component";
import {ContactSheetReplicateViewComponent} from "./scoring/contact-sheet-replicate-view/contact-sheet-replicate-view.component";
import {ExpWorkflowQcComponent} from "./scoring/exp-workflow-qc/exp-workflow-qc.component";
import {SearchFormExpWorkflowQcComponent} from "./search-forms/search-form-exp-workflow-qc/search-form-exp-workflow-qc.component";
import {SearchFormContactSheetReplicateViewComponent} from "./search-forms/search-form-contact-sheet-replicate-view/search-form-contact-sheet-replicate-view.component";
import {InterestingSummaryComponent} from "./scoring/interesting-summary/interesting-summary.component";
import {SearchFormInterestingSummaryComponent} from "./search-forms/search-form-interesting-summary/search-form-interesting-summary.component";
import {PlateViewRouteComponent} from "./views/plate-view-route/plate-view-route.component";
import {RelatedExpsetsRouteComponent} from "./views/related-expsets-route/related-expsets-route.component";
import {SearchFormRnaiLibraryComponent} from "./search-forms/search-form-rnai-library/search-form-rnai-library.component";
import {SearchFormChemicalLibraryComponent} from "./search-forms/search-form-chemical-library/search-form-chemical-library.component";
import {DetailedScoresComponent} from "./scoring/detailed-scores/detailed-scores.component";
import {SearchFormDetailedScoresComponent} from "./search-forms/search-form-detailed-scores/search-form-detailed-scores.component";
import {ContactSheetReplicateViewRouteComponent} from "./scoring/contact-sheet-replicate-view-route/contact-sheet-replicate-view-route.component";
import {ExpsetScorePrimaryRouteComponent} from "./scoring/expset-score-primary-route/expset-score-primary-route.component";
import {UploadRnaiPrimaryComponent} from "./upload-screens/upload-rnai-primary/upload-rnai-primary.component";
import {UploadRnaiPrimaryFromGoogleSheetsRouteComponent} from "./upload-screens/upload-rnai-primary-from-google-sheets-route/upload-rnai-primary-from-google-sheets-route.component";

const appRoutes: Routes = [
    {path: 'pages', component: PagesComponent},
    {path: 'empty', component: EmptyComponent},
    {path: 'rnai-primary', component: RnaiPrimaryComponent},
    {path: 'rnai-secondary', component: RnaiSecondaryComponent},
    {path: 'rnai-plate-plan', component: RnaiPlatePlanComponent},
    {path: 'chemical-primary', component: ChemicalPrimaryComponent},
    {path: 'chemical-secondary', component: ChemicalSecondaryComponent},
    {path: 'search-form-contact-sheet-plate', component: SearchFormContactSheetPlateViewComponent},
    {path: 'search-form-contact-sheet-replicate', component: SearchFormContactSheetReplicateViewComponent},
    {path: 'score-expsets-worms', component: SearchFormScoreExpsetsComponent},
    {path: 'search-form-exp-workflow-qc', component: SearchFormExpWorkflowQcComponent},
    {path: 'scored-summary', component: ScoredSummaryComponent},
    {path: 'search-form-interesting-summary', component: SearchFormInterestingSummaryComponent},
    {path: 'exp_plate/:plateId', component: PlateViewRouteComponent},
    {path: 'search-expsets-worms', component: SearchFormExpsetsComponent},
    {path: 'related_expsets/:treatmentGroupId', component: RelatedExpsetsRouteComponent},
    {path: 'search-form-rnai-library', component: SearchFormRnaiLibraryComponent},
    {path: 'search-form-chemical-library', component: SearchFormChemicalLibraryComponent},
    {path: 'search-form-detailed-scores', component: SearchFormDetailedScoresComponent},
    {path: 'contact-sheet-replicate-view/:treatmentGroupId', component: ContactSheetReplicateViewRouteComponent},
    {path: 'expset-score-primary/:treatmentGroupId', component: ExpsetScorePrimaryRouteComponent},
    {path: 'upload-rnai-primary', component: UploadRnaiPrimaryComponent},
    {path: 'upload-rnai-primary-spreadsheet', component: UploadRnaiPrimaryFromGoogleSheetsRouteComponent},
    /* WIP */
    {path: 'counts-viz', component: ScatterplotCountsComponent},
    {path: '', redirectTo: '/empty', pathMatch: 'full'},
    {path: '**', component: PageNotFoundComponent},
];

const config: ExtraOptions = {
    enableTracing: false,
    useHash: true,
};

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, config),
    ],
    exports: [RouterModule],
    declarations: []
})

export class AppRoutingModule {
}
