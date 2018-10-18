import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoredSummaryComponent } from './scored-summary.component';

describe('ScoredSummaryComponent', () => {
  let component: ScoredSummaryComponent;
  let fixture: ComponentFixture<ScoredSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoredSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoredSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
