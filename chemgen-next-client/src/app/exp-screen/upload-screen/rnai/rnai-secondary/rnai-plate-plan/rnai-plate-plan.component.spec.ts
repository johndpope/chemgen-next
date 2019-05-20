import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RnaiPlatePlanComponent} from './rnai-plate-plan.component';
import {SDKBrowserModule} from "../../../../../../../../chemgen-next-server/common/types/custom/types/sdk";
import {FormsModule} from "@angular/forms";

describe('RnaiPlatePlanComponent', () => {
    let component: RnaiPlatePlanComponent;
    let fixture: ComponentFixture<RnaiPlatePlanComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [SDKBrowserModule.forRoot(), FormsModule],
            declarations: [RnaiPlatePlanComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RnaiPlatePlanComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
