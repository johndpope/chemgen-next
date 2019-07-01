import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExpsetScorePrimarySheetComponent} from './expset-score-primary-sheet.component';
import {FormsModule} from "@angular/forms";
import {SDKBrowserModule} from "../../../../../chemgen-next-server/common/types/custom/types/sdk";
import {MockExpsetScorePrimaryComponent} from "../../../../test/MockComponents";

describe('ExpsetScorePrimarySheetComponent', () => {
    let component: ExpsetScorePrimarySheetComponent;
    let fixture: ComponentFixture<ExpsetScorePrimarySheetComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SDKBrowserModule.forRoot()],
            declarations: [ExpsetScorePrimarySheetComponent, MockExpsetScorePrimaryComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExpsetScorePrimarySheetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
