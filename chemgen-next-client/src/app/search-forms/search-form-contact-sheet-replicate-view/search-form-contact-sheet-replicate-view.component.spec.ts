import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormContactSheetReplicateViewComponent } from './search-form-contact-sheet-replicate-view.component';

describe('SearchFormContactSheetReplicateViewComponent', () => {
  let component: SearchFormContactSheetReplicateViewComponent;
  let fixture: ComponentFixture<SearchFormContactSheetReplicateViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFormContactSheetReplicateViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormContactSheetReplicateViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
