import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormBaseComponent } from './search-form-base.component';

describe('SearchFormBaseComponent', () => {
  let component: SearchFormBaseComponent;
  let fixture: ComponentFixture<SearchFormBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFormBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
