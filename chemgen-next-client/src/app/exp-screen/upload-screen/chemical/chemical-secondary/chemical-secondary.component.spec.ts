import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ChemicalSecondaryComponent} from './chemical-secondary.component';
import {FormsModule} from "@angular/forms";
import {DndModule,} from "ng2-dnd";
import {SDKBrowserModule} from "../../../../../../../chemgen-next-server/common/types/custom/types/sdk";
import {MockPlateImagingDatesComponent, MockExpScreenInfoComponent} from "../../../../../../test/MockComponents";

describe('ChemicalSecondaryComponent', () => {
    let component: ChemicalSecondaryComponent;
    let fixture: ComponentFixture<ChemicalSecondaryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, DndModule.forRoot(), SDKBrowserModule.forRoot()],
            declarations: [ChemicalSecondaryComponent, MockExpScreenInfoComponent, MockPlateImagingDatesComponent],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChemicalSecondaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
