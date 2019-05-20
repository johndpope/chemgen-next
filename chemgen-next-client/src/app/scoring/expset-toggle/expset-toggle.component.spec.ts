import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExpsetToggleComponent} from './expset-toggle.component';
import {FormsModule} from "@angular/forms";
import {SDKBrowserModule} from "../../../../../chemgen-next-server/common/types/custom/types/sdk";

import {UiSwitchModule} from "ngx-ui-switch";
// UiSwitchModule.forRoot({}),


describe('ExpsetToggleComponent', () => {
    let component: ExpsetToggleComponent;
    let fixture: ComponentFixture<ExpsetToggleComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SDKBrowserModule.forRoot(), UiSwitchModule.forRoot({})],
            declarations: [ExpsetToggleComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExpsetToggleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
