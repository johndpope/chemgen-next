import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormExpWorkflowQcComponent } from './search-form-exp-workflow-qc.component';

describe('SearchFormExpWorkflowQcComponent', () => {
  let component: SearchFormExpWorkflowQcComponent;
  let fixture: ComponentFixture<SearchFormExpWorkflowQcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFormExpWorkflowQcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormExpWorkflowQcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
