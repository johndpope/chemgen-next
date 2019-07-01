import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlateDataComponent } from './plate-data.component';

describe('PlateDataComponent', () => {
  let component: PlateDataComponent;
  let fixture: ComponentFixture<PlateDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlateDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlateDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
