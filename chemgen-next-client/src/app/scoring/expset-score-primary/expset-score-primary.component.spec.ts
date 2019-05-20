import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExpsetScorePrimaryComponent} from './expset-score-primary.component';
import {FormsModule} from "@angular/forms";
import {SDKBrowserModule} from "../../../../../chemgen-next-server/common/types/custom/types/sdk";
import {MockExpsetAlbumComponent} from "../../../../test/MockComponents";
import {LightboxModule} from "angular2-lightbox";
import {HotkeyModule, HotkeysService} from "angular2-hotkeys";

describe('ExpsetScorePrimaryComponent', () => {
    let component: ExpsetScorePrimaryComponent;
    let fixture: ComponentFixture<ExpsetScorePrimaryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SDKBrowserModule.forRoot(), LightboxModule, HotkeyModule.forRoot()],
            declarations: [ExpsetScorePrimaryComponent, MockExpsetAlbumComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExpsetScorePrimaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
