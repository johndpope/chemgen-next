import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExpScreenInfoComponent} from './exp-screen-info.component';
import {FormsModule} from "@angular/forms";
import {SDKBrowserModule} from "../../../../../../chemgen-next-server/common/types/custom/types/sdk";

describe('ExpScreenInfoComponent', () => {
    let component: ExpScreenInfoComponent;
    let fixture: ComponentFixture<ExpScreenInfoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SDKBrowserModule.forRoot()],
            declarations: [ExpScreenInfoComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExpScreenInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
