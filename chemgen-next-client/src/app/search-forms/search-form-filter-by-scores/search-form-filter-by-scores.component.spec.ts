import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormFilterByScoresComponent } from './search-form-filter-by-scores.component';

describe('SearchFormFilterByScoresComponent', () => {
  let component: SearchFormFilterByScoresComponent;
  let fixture: ComponentFixture<SearchFormFilterByScoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFormFilterByScoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormFilterByScoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
