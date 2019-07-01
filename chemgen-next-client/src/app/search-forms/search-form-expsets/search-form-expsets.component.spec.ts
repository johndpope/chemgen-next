import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchFormExpsetsComponent} from './search-form-expsets.component';
import {SDKBrowserModule} from "../../../../../chemgen-next-server/common/types/custom/types/sdk";
import {FormsModule} from "@angular/forms";
import {MockExpScreenInfoComponent, MockSearchFormExpScreen, MockSearchFormRnai, MockExpsetSheet} from "../../../../test/MockComponents";
import {NgxSpinnerModule} from "ngx-spinner";

describe('SearchFormExpsetsComponent', () => {
    let component: SearchFormExpsetsComponent;
    let fixture: ComponentFixture<SearchFormExpsetsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SDKBrowserModule.forRoot(), NgxSpinnerModule],
            declarations: [SearchFormExpsetsComponent, MockExpScreenInfoComponent, MockSearchFormExpScreen, MockSearchFormRnai, MockExpsetSheet]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchFormExpsetsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
