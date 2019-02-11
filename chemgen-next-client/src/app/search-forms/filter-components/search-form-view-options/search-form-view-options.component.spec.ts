import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormViewOptionsComponent } from './search-form-view-options.component';
import {FormsModule} from '@angular/forms';

describe('SearchFormViewOptionsComponent', () => {
  let component: SearchFormViewOptionsComponent;
  let fixture: ComponentFixture<SearchFormViewOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ SearchFormViewOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormViewOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
