import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedExpsetsRouteComponent } from './related-expsets-route.component';

describe('RelatedExpsetsRouteComponent', () => {
  let component: RelatedExpsetsRouteComponent;
  let fixture: ComponentFixture<RelatedExpsetsRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatedExpsetsRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatedExpsetsRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
