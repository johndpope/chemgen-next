import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadRnaiPrimaryComponent } from './upload-rnai-primary.component';

describe('UploadRnaiPrimaryComponent', () => {
  let component: UploadRnaiPrimaryComponent;
  let fixture: ComponentFixture<UploadRnaiPrimaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadRnaiPrimaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadRnaiPrimaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
