import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualScoresTablesComponent } from './manual-scores-tables.component';

describe('ManualScoresTablesComponent', () => {
  let component: ManualScoresTablesComponent;
  let fixture: ComponentFixture<ManualScoresTablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualScoresTablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualScoresTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
