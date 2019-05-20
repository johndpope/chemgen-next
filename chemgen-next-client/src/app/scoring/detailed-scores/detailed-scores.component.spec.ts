import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedScoresComponent } from './detailed-scores.component';

describe('DetailedScoresComponent', () => {
  let component: DetailedScoresComponent;
  let fixture: ComponentFixture<DetailedScoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailedScoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailedScoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
