import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestingSummaryComponent } from './interesting-summary.component';

describe('InterestingSummaryComponent', () => {
  let component: InterestingSummaryComponent;
  let fixture: ComponentFixture<InterestingSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterestingSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterestingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
