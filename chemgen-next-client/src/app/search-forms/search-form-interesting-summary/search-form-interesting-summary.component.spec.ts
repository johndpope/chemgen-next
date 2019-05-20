import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormInterestingSummaryComponent } from './search-form-interesting-summary.component';

describe('SearchFormInterestingSummaryComponent', () => {
  let component: SearchFormInterestingSummaryComponent;
  let fixture: ComponentFixture<SearchFormInterestingSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFormInterestingSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormInterestingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
