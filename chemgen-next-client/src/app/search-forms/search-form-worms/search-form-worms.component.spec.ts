import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchFormWormsComponent} from './search-form-worms.component';
import {SearchFormExpScreenComponent} from '../search-form-exp-screen/search-form-exp-screen.component';
import {SearchFormRnaiComponent} from '../search-form-rnai/search-form-rnai.component';
import {SearchFormViewOptionsComponent} from '../search-form-view-options/search-form-view-options.component';
import {LoadingModule} from 'ngx-loading';
import {ContactSheetPrimaryComponent} from '../../scoring/contact-sheet-primary/contact-sheet.component';
import {ExpsetSheetComponent} from '../../scoring/expset-sheet/expset-sheet.component';
import {FormsModule} from '@angular/forms';
import {NouisliderModule} from 'ng2-nouislider';
import {ExpsetAlbumComponent} from '../../scoring/albums/expset-album/expset-album.component';
import {ExpsetAlbumDialogComponent} from '../../scoring/albums/expset-album/expset-album-dialog/expset-album-dialog.component';
import {ModalModule} from 'ngx-bootstrap';
import {NgProgressModule} from '@ngx-progressbar/core';
import {SDKBrowserModule} from '../../../types/sdk';
import {MockExpsetToggleComponent, MockGridAlbumComponent} from "../../../../test/MockComponents";

describe('SearchFormWormsComponent', () => {
    let component: SearchFormWormsComponent;
    let fixture: ComponentFixture<SearchFormWormsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [LoadingModule, FormsModule, NouisliderModule, ModalModule, NgProgressModule, SDKBrowserModule.forRoot()],
            declarations: [SearchFormWormsComponent, SearchFormExpScreenComponent, MockExpsetToggleComponent, MockGridAlbumComponent,
                SearchFormRnaiComponent, SearchFormViewOptionsComponent, ContactSheetPrimaryComponent,
                ExpsetSheetComponent, ExpsetAlbumComponent, ExpsetAlbumDialogComponent],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchFormWormsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
