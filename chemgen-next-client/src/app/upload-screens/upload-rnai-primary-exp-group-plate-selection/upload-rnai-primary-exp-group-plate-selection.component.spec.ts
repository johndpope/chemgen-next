import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadRnaiPrimaryExpGroupPlateSelectionComponent } from './upload-rnai-primary-exp-group-plate-selection.component';

describe('UploadRnaiPrimaryExpGroupPlateSelectionComponent', () => {
  let component: UploadRnaiPrimaryExpGroupPlateSelectionComponent;
  let fixture: ComponentFixture<UploadRnaiPrimaryExpGroupPlateSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadRnaiPrimaryExpGroupPlateSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadRnaiPrimaryExpGroupPlateSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
