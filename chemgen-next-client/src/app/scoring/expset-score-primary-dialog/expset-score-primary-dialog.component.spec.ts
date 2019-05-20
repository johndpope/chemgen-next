import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExpsetScorePrimaryDialogComponent} from './expset-score-primary-dialog.component';
import {FormsModule} from "@angular/forms";
import {SDKBrowserModule} from "../../../../../chemgen-next-server/common/types/custom/types/sdk";
import {MockExpsetAlbumComponent, MockExpsetScorePrimaryComponent} from "../../../../test/MockComponents";
import {ModalModule} from "ngx-bootstrap";

describe('ExpsetScorePrimaryDialogComponent', () => {
    let component: ExpsetScorePrimaryDialogComponent;
    let fixture: ComponentFixture<ExpsetScorePrimaryDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SDKBrowserModule.forRoot(), ModalModule.forRoot()],
            declarations: [ExpsetScorePrimaryDialogComponent, MockExpsetScorePrimaryComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExpsetScorePrimaryDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
