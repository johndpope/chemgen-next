import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpsetTabViewComponent } from './expset-tab-view.component';

describe('ExpsetTabViewComponent', () => {
  let component: ExpsetTabViewComponent;
  let fixture: ComponentFixture<ExpsetTabViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpsetTabViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpsetTabViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
