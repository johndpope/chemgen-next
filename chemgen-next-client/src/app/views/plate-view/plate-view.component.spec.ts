import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlateViewComponent } from './plate-view.component';

describe('PlateViewComponent', () => {
  let component: PlateViewComponent;
  let fixture: ComponentFixture<PlateViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlateViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlateViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
