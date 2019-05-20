import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreDataComponent } from './score-data.component';

describe('ScoreDataComponent', () => {
  let component: ScoreDataComponent;
  let fixture: ComponentFixture<ScoreDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoreDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
