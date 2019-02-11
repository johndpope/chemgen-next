import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSheetReplicateViewComponent } from './contact-sheet-replicate-view.component';

describe('ContactSheetReplicateViewComponent', () => {
  let component: ContactSheetReplicateViewComponent;
  let fixture: ComponentFixture<ContactSheetReplicateViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactSheetReplicateViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactSheetReplicateViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
