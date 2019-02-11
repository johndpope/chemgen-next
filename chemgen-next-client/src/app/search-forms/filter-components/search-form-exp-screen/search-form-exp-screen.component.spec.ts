import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchFormExpScreenComponent} from './search-form-exp-screen.component';
import {FormsModule} from '@angular/forms';
import {ExpScreenApi, ExpScreenUploadWorkflowApi, SDKModels} from '../../../../types/sdk/services/custom';
import {SearchFormExpScreenFormResults} from "../../../search/search.module";
import {SDKBrowserModule} from "../../../../types/sdk";

describe('SearchFormExpScreenComponent', () => {
  let component: SearchFormExpScreenComponent;
  let fixture: ComponentFixture<SearchFormExpScreenComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [FormsModule, SDKBrowserModule.forRoot()],
      declarations: [SearchFormExpScreenComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormExpScreenComponent);
    component = fixture.componentInstance;
    component.formResults = new SearchFormExpScreenFormResults();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

