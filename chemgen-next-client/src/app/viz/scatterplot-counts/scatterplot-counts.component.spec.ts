import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScatterplotCountsComponent} from './scatterplot-counts.component';
import {FormsModule} from "@angular/forms";
import {SDKBrowserModule} from "../../../../../chemgen-next-server/common/types/custom/types/sdk";
import { HighchartsChartModule } from 'highcharts-angular';
import {MockExpsetAlbumComponent} from "../../../../test/MockComponents";

describe('ScatterplotCountsComponent', () => {
    let component: ScatterplotCountsComponent;
    let fixture: ComponentFixture<ScatterplotCountsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SDKBrowserModule.forRoot(), HighchartsChartModule],
            declarations: [ScatterplotCountsComponent, MockExpsetAlbumComponent],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ScatterplotCountsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
