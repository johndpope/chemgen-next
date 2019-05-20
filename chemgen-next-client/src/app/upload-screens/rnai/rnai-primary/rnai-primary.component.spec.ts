import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RnaiPrimaryComponent } from './rnai-primary.component';

describe('RnaiPrimaryComponent', () => {
  let component: RnaiPrimaryComponent;
  let fixture: ComponentFixture<RnaiPrimaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RnaiPrimaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RnaiPrimaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
