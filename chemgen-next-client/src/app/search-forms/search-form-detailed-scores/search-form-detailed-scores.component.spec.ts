import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormDetailedScoresComponent } from './search-form-detailed-scores.component';

describe('SearchFormDetailedScoresComponent', () => {
  let component: SearchFormDetailedScoresComponent;
  let fixture: ComponentFixture<SearchFormDetailedScoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFormDetailedScoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormDetailedScoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
