import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReagentDataComponent } from './reagent-data.component';

describe('ReagentDataComponent', () => {
  let component: ReagentDataComponent;
  let fixture: ComponentFixture<ReagentDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReagentDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReagentDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
