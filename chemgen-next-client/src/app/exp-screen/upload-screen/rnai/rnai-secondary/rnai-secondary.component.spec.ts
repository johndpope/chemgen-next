import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {RnaiSecondaryComponent} from './rnai-secondary.component';
import {FormsModule} from "@angular/forms";
import {SDKBrowserModule} from "../../../../../../../chemgen-next-server/common/types/custom/types/sdk";
import {DndModule} from "ng2-dnd";
import {MockPlateImagingDatesComponent, MockExpScreenInfoComponent} from "../../../../../../test/MockComponents";

describe('RnaiSecondaryComponent', () => {
    let component: RnaiSecondaryComponent;
    let fixture: ComponentFixture<RnaiSecondaryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, DndModule.forRoot(), SDKBrowserModule.forRoot()],
            declarations: [RnaiSecondaryComponent, MockExpScreenInfoComponent, MockPlateImagingDatesComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RnaiSecondaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
