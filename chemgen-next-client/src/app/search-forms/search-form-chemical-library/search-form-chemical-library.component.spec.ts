import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormChemicalLibraryComponent } from './search-form-chemical-library.component';

describe('SearchFormChemicalLibraryComponent', () => {
  let component: SearchFormChemicalLibraryComponent;
  let fixture: ComponentFixture<SearchFormChemicalLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFormChemicalLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormChemicalLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
