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
import {SearchFormContactSheetPrimaryComponent} from "./search-forms/search-form-contact-sheet-primary/search-form-contact-sheet-primary.component";
import {SearchFormScoreExpsetsComponent} from "./search-forms/search-form-score-expsets/search-form-score-expsets.component";
import {ScoredSummaryComponent} from "./scoring/scored-summary/scored-summary.component";
import {ContactSheetSecondaryComponent} from "./scoring/contact-sheet-secondary/contact-sheet-secondary.component";

// TODO Make Routing Modules

const appRoutes: Routes = [
    {path: 'pages', component: PagesComponent},
    {path: 'empty', component: EmptyComponent},
    {path: 'rnai-primary', component: RnaiPrimaryComponent},
    {path: 'rnai-secondary', component: RnaiSecondaryComponent},
    {path: 'rnai-plate-plan', component: RnaiPlatePlanComponent},
    {path: 'chemical-primary', component: ChemicalPrimaryComponent},
    {path: 'chemical-secondary', component: ChemicalSecondaryComponent},
    {path: 'search-form-contact-sheet-plate', component: SearchFormContactSheetPrimaryComponent},
    {path: 'search-expsets-worms', component: SearchFormExpsetsComponent},
    {path: 'score-expsets-worms', component: SearchFormScoreExpsetsComponent},
    {path: 'scored-summary', component: ScoredSummaryComponent},
    {path: 'contact-sheet-by-expset', component: ContactSheetSecondaryComponent},
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
