import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormFilterByScoresAdvancedComponent } from './search-form-filter-by-scores-advanced.component';

describe('SearchFormFilterByScoresAdvancedComponent', () => {
  let component: SearchFormFilterByScoresAdvancedComponent;
  let fixture: ComponentFixture<SearchFormFilterByScoresAdvancedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFormFilterByScoresAdvancedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormFilterByScoresAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
