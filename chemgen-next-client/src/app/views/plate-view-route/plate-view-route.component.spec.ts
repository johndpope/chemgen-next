import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlateViewRouteComponent } from './plate-view-route.component';

describe('PlateViewRouteComponent', () => {
  let component: PlateViewRouteComponent;
  let fixture: ComponentFixture<PlateViewRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlateViewRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlateViewRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
