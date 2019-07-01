import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExpsetAlbumDialogComponent} from './expset-album-dialog.component';
import {FormsModule} from '@angular/forms';
import {LightboxModule} from 'angular2-lightbox';
import { ModalModule} from 'ngx-bootstrap';
import {SDKBrowserModule} from "../../../../../../../chemgen-next-server/common/types/custom/types/sdk";
import {MockExpsetAlbumComponent} from "../../../../../../test/MockComponents";

describe('ExpsetAlbumDialogComponent', () => {
  let component: ExpsetAlbumDialogComponent;
  let fixture: ComponentFixture<ExpsetAlbumDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ModalModule.forRoot(), LightboxModule, SDKBrowserModule.forRoot()],
      declarations: [ExpsetAlbumDialogComponent, MockExpsetAlbumComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpsetAlbumDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
