import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadRnaiPrimaryFromGoogleSheetsComponent } from './upload-rnai-primary-from-google-sheets.component';

describe('UploadRnaiPrimaryFromGoogleSheetsComponent', () => {
  let component: UploadRnaiPrimaryFromGoogleSheetsComponent;
  let fixture: ComponentFixture<UploadRnaiPrimaryFromGoogleSheetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadRnaiPrimaryFromGoogleSheetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadRnaiPrimaryFromGoogleSheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
