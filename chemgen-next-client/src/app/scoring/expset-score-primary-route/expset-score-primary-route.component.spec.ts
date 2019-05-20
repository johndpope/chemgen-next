import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpsetScorePrimaryRouteComponent } from './expset-score-primary-route.component';

describe('ExpsetScorePrimaryRouteComponent', () => {
  let component: ExpsetScorePrimaryRouteComponent;
  let fixture: ComponentFixture<ExpsetScorePrimaryRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpsetScorePrimaryRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpsetScorePrimaryRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
