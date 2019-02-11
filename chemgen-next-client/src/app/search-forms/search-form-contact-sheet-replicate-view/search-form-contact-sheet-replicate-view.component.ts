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
    // this.showProgress = false;
    // this.searchFormParams.onSubmit();
    this.searchFormParams.onSubmit();
    console.log('get some new exp sets');
  }

}
