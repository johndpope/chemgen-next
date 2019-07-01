import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadRnaiPrimaryFromGoogleSheetsRouteComponent } from './upload-rnai-primary-from-google-sheets-route.component';

describe('UploadRnaiPrimaryFromGoogleSheetsRouteComponent', () => {
  let component: UploadRnaiPrimaryFromGoogleSheetsRouteComponent;
  let fixture: ComponentFixture<UploadRnaiPrimaryFromGoogleSheetsRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadRnaiPrimaryFromGoogleSheetsRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadRnaiPrimaryFromGoogleSheetsRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
