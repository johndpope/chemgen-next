import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExpsetAlbumComponent} from './expset-album.component';
import {FormsModule} from '@angular/forms';
import {Lightbox, LightboxModule} from 'angular2-lightbox';
import {SDKBrowserModule} from "../../../../../../chemgen-next-server/common/types/custom/types/sdk";
import {MockExpsetToggleComponent} from "../../../../../test/MockComponents";

describe('ExpsetAlbumComponent', () => {
    let component: ExpsetAlbumComponent;
    let fixture: ComponentFixture<ExpsetAlbumComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SDKBrowserModule.forRoot(), LightboxModule],
            declarations: [ExpsetAlbumComponent, MockExpsetToggleComponent],
            providers: [{provide: Lightbox}]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExpsetAlbumComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
