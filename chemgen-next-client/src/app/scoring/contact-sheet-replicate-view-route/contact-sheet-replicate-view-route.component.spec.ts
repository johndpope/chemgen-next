import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSheetReplicateViewRouteComponent } from './contact-sheet-replicate-view-route.component';

describe('ContactSheetReplicateViewRouteComponent', () => {
  let component: ContactSheetReplicateViewRouteComponent;
  let fixture: ComponentFixture<ContactSheetReplicateViewRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactSheetReplicateViewRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactSheetReplicateViewRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
