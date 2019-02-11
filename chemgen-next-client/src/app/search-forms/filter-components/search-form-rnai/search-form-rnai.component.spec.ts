import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormRnaiComponent } from './search-form-rnai.component';
import {FormsModule} from '@angular/forms';

describe('SearchFormRnaiComponent', () => {
  let component: SearchFormRnaiComponent;
  let fixture: ComponentFixture<SearchFormRnaiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ SearchFormRnaiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormRnaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
