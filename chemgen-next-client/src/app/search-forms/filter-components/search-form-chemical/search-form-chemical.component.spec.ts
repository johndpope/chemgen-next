import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormChemicalComponent } from './search-form-chemical.component';

describe('SearchFormChemicalComponent', () => {
  let component: SearchFormChemicalComponent;
  let fixture: ComponentFixture<SearchFormChemicalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFormChemicalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormChemicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
