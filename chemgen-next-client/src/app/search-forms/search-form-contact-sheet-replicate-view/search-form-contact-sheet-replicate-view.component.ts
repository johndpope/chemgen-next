import { Component, OnInit } from '@angular/core';
import {ExpSetApi} from '../../../types/sdk/services/custom';
import {NgxSpinnerService} from "ngx-spinner";
import {ExpScreenApi, ExpBiosampleApi, ExpScreenUploadWorkflowApi} from "../../../types/sdk/services/custom";
import {SearchFormParamsFilterByNotScoredContactSheet} from "../../search/search.module";

@Component({
  selector: 'app-search-form-contact-sheet-replicate-view',
  templateUrl: './search-form-contact-sheet-replicate-view.component.html',
  styleUrls: ['./search-form-contact-sheet-replicate-view.component.css']
})
export class SearchFormContactSheetReplicateViewComponent implements OnInit {
  public searchFormParams: SearchFormParamsFilterByNotScoredContactSheet;

  constructor(expSetApi: ExpSetApi, expScreenApi: ExpScreenApi,
              expBiosampleApi: ExpBiosampleApi, expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
              spinner: NgxSpinnerService,) {
    this.searchFormParams = new SearchFormParamsFilterByNotScoredContactSheet(expSetApi, expScreenApi, expBiosampleApi, expScreenUploadWorkflowApi, spinner,)
  }

  ngOnInit() {
  }

  getNewExpSets() {
    //Ensure the list of expWorkflowIds is up to date
    //Once a batch is finished it will be removed from the list
    this.searchFormParams.searchModule.getExpWorkflows();
    this.searchFormParams.expSets = null;
    this.searchFormParams.formSubmitted = false;
    this.searchFormParams.onSubmit();
  }

}
