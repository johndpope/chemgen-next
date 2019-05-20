import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, Input, Output, EventEmitter} from "@angular/core";
// import {ContactSheetPlateViewComponent} from './contact-sheet.component';
import {ContactSheetPlateViewComponent} from "./contact-sheet-plate-view.component";
import {FormsModule} from '@angular/forms';
import {NouisliderModule} from 'ng2-nouislider';
import {ModalModule} from 'ngx-bootstrap';
import {Lightbox} from 'angular2-lightbox';
import {ComponentLoaderFactory} from "ngx-bootstrap";
import {expSetMockData} from "../../../../test/ExpSet.mock";
import {DebugElement} from "@angular/core";
import {MockGridAlbumComponent} from "../../../../test/MockComponents";
import {ExpSetApi, ExpManualScoresApi} from "../../../types/sdk/services/custom";

describe('ContactSheetPlateViewComponent', () => {
    let component: ContactSheetPlateViewComponent;
    let fixture: ComponentFixture<ContactSheetPlateViewComponent>;
    let expSetsEl: DebugElement;

    // Need to not only declare import, but also all the child imports
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, NouisliderModule, ModalModule.forRoot()],
            declarations: [ContactSheetPlateViewComponent, MockGridAlbumComponent],
            providers: [{provide: ExpSetApi}, {provide: ExpManualScoresApi}, {provide: Lightbox}, {provide: ComponentLoaderFactory}]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ContactSheetPlateViewComponent);
        component = fixture.componentInstance;
        component.expSets = expSetMockData;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create initialize interesting to false', () => {
        //TODO need to test this with real data
        // component.expSets = expSetMockData;
        // fixture.detectChanges();
        expect(component.contactSheetResults.interesting[30456]).toBeFalsy();
        expect(component).toBeTruthy();
    });

    it('should removeInteresting()', () => {
        component.expSets = expSetMockData;
        fixture.detectChanges();
        component.contactSheetResults.interesting[30456] = true;
        component.removeByTreatmentGroupId(30456);
        expect(component).toBeTruthy();
    });

    it('should changePhenotypeSlider', () => {

    });
});
