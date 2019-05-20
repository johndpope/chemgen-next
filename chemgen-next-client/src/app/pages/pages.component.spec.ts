import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PagesComponent} from './pages.component';
import {FormsModule} from "@angular/forms";
import {SDKBrowserModule} from "../../../../chemgen-next-server/common/types/custom/types/sdk";
import {ChildrenOutletContexts, RouterModule} from "@angular/router";

describe('PagesComponent', () => {
    let component: PagesComponent;
    let fixture: ComponentFixture<PagesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SDKBrowserModule.forRoot(), RouterModule],
            declarations: [PagesComponent],
            providers: [ChildrenOutletContexts]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PagesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
