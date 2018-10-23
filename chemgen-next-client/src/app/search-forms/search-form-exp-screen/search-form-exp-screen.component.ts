import {Component, OnInit, Output, Input} from '@angular/core';
import {ExpScreenApi, ExpScreenUploadWorkflowApi} from '../../../types/sdk/services/custom';
import {ExpScreenResultSet, ExpScreenUploadWorkflowResultSet} from '../../../types/sdk/models';
// import {TypeaheadMatch} from 'ngx-bootstrap/typeahead';
import {get, uniq, orderBy} from 'lodash';

@Component({
    selector: 'app-search-form-exp-screen',
    templateUrl: './search-form-exp-screen.component.html',
    styleUrls: ['./search-form-exp-screen.component.css']
})
export class SearchFormExpScreenComponent implements OnInit {

    @Input('expScreenWhere') expScreenWhere: any = {};
    @Input('formResults') formResults: SearchFormExpScreenFormResults;
    expScreens: ExpScreenResultSet[];
    expScreenWorkflows: ExpScreenUploadWorkflowResultSet[];
    temperatures: Array<number>;
    // expScreenFormResults: SearchFormExpScreenFormResults = new SearchFormExpScreenFormResults();


    constructor(private expScreenApi: ExpScreenApi, private expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi) {
        this.expScreens = [];
        this.expScreenWorkflows = [];
        this.temperatures = [];
        this.getExpScreens();
    }

    ngOnInit() {
        this.getExpScreens();
    }

    getExpScreens() {
        this.expScreenApi
            .find(this.expScreenWhere)
            .subscribe((results: ExpScreenResultSet[]) => {
                this.expScreens = results;
                return;
            }, (error) => {
                console.log(error);
                return new Error(error);
            });
    }

    getExpScreenWorkflows() {
        this.expScreenWorkflows = [];
        this.formResults.expScreenWorkflow = null;
        const where: any = {
            screenName: this.formResults.expScreen.screenName
        };
        this.expScreenUploadWorkflowApi
            .find({
                where: where,
                fields: {
                    id: true,
                    screenId: true,
                    temperature: true,
                    screenName: true,
                    assayDates: true,
                    name: true,
                },
            })
            .subscribe((results: ExpScreenUploadWorkflowResultSet[]) => {
                results.map((expWorkflow) => {
                    if (get(expWorkflow, "temperature.$numberDouble")) {
                        expWorkflow.temperature = expWorkflow.temperature["$numberDouble"];
                    }
                });
                this.expScreenWorkflows = orderBy(results, 'name');
                this.temperatures = uniq(results.map((result) => {
                    return result.temperature;
                }));
                this.temperatures = uniq(this.temperatures);
                return;
            });

    }
}

export class SearchFormExpScreenFormResults {
    expScreen ?: ExpScreenResultSet;
    expScreenWorkflow ?: ExpScreenUploadWorkflowResultSet;
    temperatures ?: Array<number>;
}
