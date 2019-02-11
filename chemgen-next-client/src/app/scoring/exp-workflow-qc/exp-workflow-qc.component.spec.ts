import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpWorkflowQcComponent } from './exp-workflow-qc.component';

describe('ExpWorkflowQcComponent', () => {
  let component: ExpWorkflowQcComponent;
  let fixture: ComponentFixture<ExpWorkflowQcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpWorkflowQcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpWorkflowQcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
