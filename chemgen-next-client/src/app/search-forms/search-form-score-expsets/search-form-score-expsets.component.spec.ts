import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchFormScoreExpsetsComponent} from './search-form-score-expsets.component';
import {FormsModule} from "@angular/forms";
import {SDKBrowserModule} from "../../../../../chemgen-next-server/common/types/custom/types/sdk";
import {
    MockExpScreenInfoComponent,
    MockExpsetScorePrimaryComponent, MockSearchFormExpScreen,
    MockSearchFormRnai
} from "../../../../test/MockComponents";
import {NgxSpinnerModule} from "ngx-spinner";

describe('SearchFormScoreExpsetsComponent', () => {
    let component: SearchFormScoreExpsetsComponent;
    let fixture: ComponentFixture<SearchFormScoreExpsetsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SDKBrowserModule.forRoot(), NgxSpinnerModule],
            declarations: [SearchFormScoreExpsetsComponent, MockExpsetScorePrimaryComponent, MockExpScreenInfoComponent, MockSearchFormRnai, MockSearchFormExpScreen]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchFormScoreExpsetsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
