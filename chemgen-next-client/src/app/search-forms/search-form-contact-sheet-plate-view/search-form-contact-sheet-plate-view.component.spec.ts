import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchFormContactSheetPlateViewComponent} from './search-form-contact-sheet-plate-view.component';
import {SDKBrowserModule} from "../../../../../chemgen-next-server/common/types/custom/types/sdk";
import {FormsModule} from "@angular/forms";
import {MockSearchFormExpScreen, MockContactSheetComponent} from "../../../../test/MockComponents";
import {NgxSpinnerModule} from "ngx-spinner";

describe('SearchFormContactSheetPlateViewComponent', () => {
    let component: SearchFormContactSheetPlateViewComponent;
    let fixture: ComponentFixture<SearchFormContactSheetPlateViewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SDKBrowserModule.forRoot(), NgxSpinnerModule],
            declarations: [SearchFormContactSheetPlateViewComponent, MockSearchFormExpScreen, MockContactSheetComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchFormContactSheetPlateViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
