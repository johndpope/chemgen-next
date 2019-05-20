import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScreenDesign} from '../../helpers';
import {PlateResultSet, ExpScreenUploadWorkflowResultSet} from "../../../../../types/sdk/models";
import {isEmpty, isNull} from 'lodash';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class ExpScreenUploadScreenChemicalHelpersModule {
}

export class ChemicalScreenDesign extends ScreenDesign {
  // treat_chemical_plates: PlateResultSet[] = [];
  // control_chemical_plates: PlateResultSet[] = [];
  treat_chemical_plates: PlateResultSet[] = [];
  ctrl_chemical_plates: PlateResultSet[] = [];
  ctrl_strain_plates: PlateResultSet[] = [];
  ctrl_null_plates: PlateResultSet[] = [];


  /**
   * This is fine for later screens, but primary chembbridge screens done ~2016 are different, and have nothing
   * in the barcode to denote the wormstrain
   * This is pretty hacky. what should be done is to give each biosample a code, and then to check for that in the barcode
   * @returns {any[]}
   */
  public sortPlates() {
    this.clearPlates();
    const unSortedPlates = [];
    this.plates.map((plate: PlateResultSet) => {
      console.log(`Plate Name: ${plate.name}`);
      if (plate.name.match('M')) {
        this.treat_chemical_plates.push(plate);
      } else if (plate.name.match('mel')) {
        this.treat_chemical_plates.push(plate);
      } else if (plate.name.match('mip')) {
        this.treat_chemical_plates.push(plate);
      } else if (plate.name.match(/N/gi)) {
        this.ctrl_chemical_plates.push(plate);
      } else {
        unSortedPlates.push(plate);
      }
    });
    this.splitIntoReplicates();
    return unSortedPlates;
  }

  public splitIntoReplicates() {
    this.treat_chemical_plates.map((plate, index) => {
      this.pushReplicate(plate, index);
    });
    this.ctrl_chemical_plates.map((plate, index) => {
      this.pushReplicate(plate, index);
    });
  }

  public clearPlates() {
    this.treat_chemical_plates = [];
    this.ctrl_chemical_plates = [];
    this.replicates = {};
  }

  public buildSearchNames() {
    //TODO if its Chembridge it has an M, if its FDA it has FDA
    this.searchNamePatterns = [`M%${this.libraryPlate}%`, `FDA%${this.libraryPlate}%`];
  }

}

export class ChemicalExpUpload {

  public setDefaults(plateModel, expDataModel, expBiosampleModel) {

    const model = new ExpScreenUploadWorkflowResultSet();

    // These are just general model things
    model.name = expDataModel.name;
    model.comment = expDataModel.comment;
    model.screenId = expDataModel.expScreen.screenId;
    model.screenName = expDataModel.expScreen.screenName;
    model.screenType = expDataModel.expScreen.screenType;
    model.libraryId = expDataModel.library.libraryId;
    const biosamples = {
      'experimentBiosample': {
        'id': expBiosampleModel.expBiosample.biosampleId,
        'name': expBiosampleModel.expBiosample.biosampleName
      },
      'ctrlBiosample': {
        'id': expBiosampleModel.ctrlBiosample.biosampleId,
        'name': expBiosampleModel.ctrlBiosample.biosampleName
      },
    };
    // model.stockPrepDate = expDataModel.assayDates[0];
    // model.assayDates = expDataModel.assayDates;
    model.stockPrepDate = expDataModel.assayDates[0].toISOString();
    model.assayDates = [];

    expDataModel.assayDates.map((date) => {
      model.assayDates.push(date.toISOString());
    });
    model.biosamples = biosamples;
    model.temperature = expDataModel.temperature;
    model.replicates = plateModel.replicates;
    // Begin AD Specific Login
    model.instrumentId = 1;
    model.instrumentLookUp = 'arrayScan';
    model.instrumentPlateIdLookup = 'csPlateid';
    // End AD Specific Login

    model.libraryModel = 'ChemicalLibrary';
    model.libraryStockModel = 'ChemicalLibraryStock';
    // TODO THIS SHOULD BE EITHER FDA OR CHEMBRIDGE
    model.librarycode = 'fda';
    model.biosampleType = 'worm';
    model.reagentLookUp = 'compoundId';
    model.assayViewType = 'exp_assay_fda';
    model.plateViewType = 'exp_plate_fda';
    model.conditions = [
      'treat_chemical',
      'ctrl_chemical',
      'ctrl_null',
      'ctrl_strain'
    ];
    model.controlConditions = [
      'ctrl_strain',
      'ctrl_null'
    ];
    model.experimentConditions = [
      'treat_chemical',
      'ctrl_chemical'
    ];
    model.experimentMatchConditions = {
      'treat_chemical': 'ctrl_chemical'
    };
    model.biosampleMatchConditions = {
      'treat_chemical': 'ctrl_strain',
      'ctrl_chemical': 'ctrl_null'
    };
    model.experimentDesign = {
      'treat_chemical': [
        'ctrl_chemical',
        'ctrl_strain',
        'ctrl_null'
      ]
    };

    // TODO Make Naming Consistent
    model.experimentGroups = {};
    model.experimentGroups.treat_chemical = {};
    model.experimentGroups.ctrl_chemical = {};
    model.experimentGroups.ctrl_strain = {};
    model.experimentGroups.ctrl_null = {};
    model.experimentGroups.treat_chemical.plates = plateModel.treat_chemical_plates;
    model.experimentGroups.treat_chemical.biosampleId = expBiosampleModel.expBiosample.biosampleId;
    model.experimentGroups.ctrl_chemical.plates = plateModel.ctrl_chemical_plates;
    model.experimentGroups.ctrl_chemical.biosampleId = expBiosampleModel.ctrlBiosample.biosampleId;

    // Most Chemical Screens in AD DO NOT have separate DMSO plates
    // Instead Columns 1 and 12 have DMSO
    // In the secondary screens they are specifically marked DMSO
    model.experimentGroups.ctrl_strain.plates = plateModel.ctrl_strain_plates;
    model.experimentGroups.ctrl_strain.biosampleId = expBiosampleModel.expBiosample.biosampleId;
    model.experimentGroups.ctrl_null.plates = plateModel.ctrl_null_plates;
    model.experimentGroups.ctrl_null.biosampleId = expBiosampleModel.ctrlBiosample.biosampleId;
    return model;
  }

  validateWorkflowData(model: ExpScreenUploadWorkflowResultSet, errorMessages: Array<any>) {
    if (isEmpty(model.name)) {
      errorMessages.push('You must enter a screen name!');
    }
    if (isEmpty(model.temperature)) {
      errorMessages.push('You must enter a temperature!');
    }
    if (isNull(model.screenId)) {
      errorMessages.push('You must choose a screen!');
    }
    if (isNull(model.libraryId)) {
      errorMessages.push('You must choose a library!');
    }
    if (isEmpty(model.experimentGroups.treat_chemical.plates)) {
      errorMessages.push('There must be one or more Mutant + Chemical plates!');
    }
    if (isEmpty(model.experimentGroups.ctrl_chemical.plates)) {
      errorMessages.push('There must be one or more N2 + Chemical plates!');
    }
    return errorMessages;
  }
}

