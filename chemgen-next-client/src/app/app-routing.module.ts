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
    /* WIP */
    {path: 'search-expsets-worms', component: SearchFormExpsetsComponent},
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
