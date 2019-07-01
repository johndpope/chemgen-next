import { Component, OnInit, Input } from '@angular/core';
import {ExpSetDeNorm} from "../../../../../../chemgen-next-server/common/types/custom/ExpSetTypes";

@Component({
  selector: 'app-batch-data',
  templateUrl: './batch-data.component.html',
  styleUrls: ['./batch-data.component.css']
})
export class BatchDataComponent implements OnInit {
  //TODO Create a type for the single expSet!
  @Input() expSet: ExpSetDeNorm;

  constructor() { }

  ngOnInit() {
  }

}
