import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExpsetSheetComponent} from './expset-sheet.component';
import {FormsModule} from '@angular/forms';
import {ModalModule} from 'ngx-bootstrap';
import {MockExpsetAlbumComponent, MockExpsetAlbumDialog} from "../../../../test/MockComponents";
import {SDKBrowserModule} from "../../../../../chemgen-next-server/common/types/custom/types/sdk";

describe('ExpsetSheetComponent', () => {
    let component: ExpsetSheetComponent;
    let fixture: ComponentFixture<ExpsetSheetComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ModalModule, SDKBrowserModule.forRoot()],
            declarations: [ExpsetSheetComponent, MockExpsetAlbumComponent, MockExpsetAlbumDialog]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExpsetSheetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
