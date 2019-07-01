import {Component, OnInit} from '@angular/core';
import {LoopBackConfig} from "../../types/sdk";
import {ExpBiosampleResultSet} from "../../types/sdk";
import {ExpBiosampleApi} from "../../types/sdk";

@Component({
  // Be sure to get rid of the selector when using the router in the component
  // OMG THIS TOOK ME FOREVER TO FIGURE OUT
  // selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css'],
  // providers: [ExpBiosampleApi]
})
export class PagesComponent implements OnInit {

  private expBiosample: ExpBiosampleResultSet = new ExpBiosampleResultSet();
  public message: String = '';

  constructor(private expBiosampleApi: ExpBiosampleApi) {
  }

  getExpBiosampleResultSet(id: any): void {
    this.expBiosampleApi.findById(id, {
      include: [
        {
          scope: {order: 'biosampleId DESC'}
        }
      ]
    }).subscribe((expBiosample: ExpBiosampleResultSet) => {
      this.expBiosample = expBiosample;
      // console.log(JSON.stringify(expBiosample));
    });
  }

  findExpBiosampleResultSet(): void {
    this.expBiosampleApi.find({
      where:
        {
          biosampleId: 4
        }
    }).subscribe((expBiosamples: ExpBiosampleResultSet[]) => {
      console.log('searching...');
      console.log(JSON.stringify(expBiosamples));
    });
  }

  model = new ExpBiosampleResultSet();
  submitted = false;

  onSubmit() {
    console.log('Submitted the form!');
    console.log(JSON.stringify(this.model));
    this.submitted = true;
    this.expBiosampleApi.create(this.model)
      .toPromise()
      .then((expBiosample: ExpBiosampleResultSet) => {
        this.expBiosample = expBiosample;
        this.message = 'Mission successful!';
        this.model = new ExpBiosampleResultSet();
        console.log(JSON.stringify(expBiosample));
      })
      .catch((error) => {
        this.message = `ABORT THE MISSION! ${JSON.stringify(error.name)}`;
        console.log('THERE WAS AN ERROR!');
      });
  }

  getModelName() {
    let name = this.expBiosampleApi.getModelName();
    console.log(`Name ${name}`);
  }

  resetForm() {
    this.model = new ExpBiosampleResultSet();
  }

  // TODO: Remove this when we're done
  get diagnostic() {
    return JSON.stringify(this.model);
  }

  ngOnInit() {
  }
}
