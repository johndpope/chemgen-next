import {Component, OnInit} from '@angular/core';
import {Input} from '@angular/core';
import {ExperimentData, SearchExpBiosamples} from '../helpers';

@Component({
    selector: 'app-exp-screen-info',
    templateUrl: './exp-screen-info.component.html',
    styleUrls: ['./exp-screen-info.component.css']
})
/**
 * This is the all the information shared among screens
 * All screens have a screen, a library
 * Exp Biosample / Ctrl BioSample
 * A temperature and an Assay Dates
 *
 * The rest is (mostly) library/screenStage specific
 */
export class ExpScreenInfoComponent implements OnInit {

    @Input() expDataModel: ExperimentData;
    @Input() expBiosampleModel: SearchExpBiosamples;

    constructor() {
    }

    ngOnInit() {
    }


}
