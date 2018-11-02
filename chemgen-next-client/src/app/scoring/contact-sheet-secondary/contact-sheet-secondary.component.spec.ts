import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSheetSecondaryComponent } from './contact-sheet-by-expset.component';

describe('ContactSheetSecondaryComponent', () => {
  let component: ContactSheetSecondaryComponent;
  let fixture: ComponentFixture<ContactSheetSecondaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactSheetSecondaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactSheetSecondaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
