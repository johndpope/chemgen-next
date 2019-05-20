import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormRnaiLibraryComponent } from './search-form-rnai-library.component';

describe('SearchFormRnaiLibraryComponent', () => {
  let component: SearchFormRnaiLibraryComponent;
  let fixture: ComponentFixture<SearchFormRnaiLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFormRnaiLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormRnaiLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
