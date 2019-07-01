import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {PlateGrid, ScreenUploadResults} from "../upload-rnai-primary/upload-rnai-primary.component";

@Component({
    selector: 'app-upload-rnai-primary-exp-group-plate-selection',
    templateUrl: './upload-rnai-primary-exp-group-plate-selection.component.html',
    styleUrls: ['./upload-rnai-primary-exp-group-plate-selection.component.css']
})
export class UploadRnaiPrimaryExpGroupPlateSelectionComponent implements OnInit {

    @Input() title: string;
    @Input() plateGridTable: PlateGrid;
    @Input() screenUploadResults: ScreenUploadResults;
    @Input() class: string;
    @Output() searchPlates = new EventEmitter<boolean>();

    constructor() {
    }

    ngOnInit() {
    }

    search() {
        console.log('should be emitting');
        this.searchPlates.emit(true);
    }

}
