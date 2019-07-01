import {
    ExpBiosampleApi,
    PlatePlan96Api,
    PlateApi,
    ExpScreenApi,
    ReagentLibraryApi
} from "../../../types/sdk/services/custom";
import {
    ExpBiosampleResultSet,
    PlatePlan96ResultSet,
    ExpScreenResultSet,
    RnaiScreenUploadWorkflowResultSet,
    ExpScreenUploadWorkflowResultSet,
    PlateResultSet,
    ReagentLibraryResultSet
} from "../../../types/sdk/models";

import {find, isNull, isEmpty, orderBy, padStart, chunk} from 'lodash';

/**
 * This has some helper classes and utilities for uploading screens
 * All screens have a primary id, an associated library, 1 or more biosamples, 1 or more assay dates
 * Along with some plates
 */

/**
 * This is just a helper class to expSetSearch for biosamples, mostly to return them to the screen upload form
 */
export class SearchExpBiosamples {
    // Choose Mutant and Control strains
    expBiosample: ExpBiosampleResultSet;
    ctrlBiosample: ExpBiosampleResultSet;
    allBiosamples: ExpBiosampleResultSet[] = [];

    constructor(private expBiosampleApi: ExpBiosampleApi) {
    }

    public searchSamples() {
        this.expBiosampleApi
            .find()
            .toPromise()
            .then((expBiosamples: ExpBiosampleResultSet[]) => {
                this.allBiosamples = expBiosamples;
                this.ctrlBiosample = find(this.allBiosamples, {biosampleName: 'N2'});
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
            });
    }

    public setDefaultCtrlBiosample() {
    }
}

export class ExperimentData {
    name: string;
    comment: string = '';
    expScreens: ExpScreenResultSet[] = [];
    expScreen: ExpScreenResultSet;
    library: ReagentLibraryResultSet;
    libraries: ReagentLibraryResultSet[] = [];
    assayDates: Array<any> = [new Date()];
    temperature: string | number;
    preparedBy: string;

    constructor(private reagentLibraryApi: ReagentLibraryApi, private expScreenApi: ExpScreenApi, private libraryType: string) {
        this.searchLibraries();
        this.searchScreens();
    }

    public searchLibraries() {
        this.reagentLibraryApi
            .find({where: {libraryType: this.libraryType}})
            .toPromise()
            .then((results: ReagentLibraryResultSet[]) => {
                this.libraries = results;
            })
            .catch((error) => {
                return new Error(error);
            });
    }

    public searchScreens() {
        this.expScreenApi
            .find()
            .toPromise()
            .then((results: ExpScreenResultSet[]) => {
                this.expScreens = results;
            })
            .catch((error) => {
                return new Error(error);
            });
    }

    // Transform
    addEmptyDate() {
        this.assayDates.push(this.assayDates[this.assayDates.length - 1]);
    }

    // Transform
    removeDate(index: number) {
        if (index > -1) {
            this.assayDates.splice(index, 1);
        }
    }
}

export class ScreenDesign {
    /* Search for Plates */
    creationDates: Array<any> = [new Date()];
    // The name expSetSearch parameter is created with these
    conditionCode: String = '';
    libraryPlate: string | number = '';
    collapse: Boolean = false;

    searchNamePatterns: Array<String> = [];

    /* Place plates in appropriate conditions */
    /* This is mostly done in the screen specific logic, but there are a few placeholders here to grab the plates */
    plates: PlateResultSet[] = [];
    replicates: any = {};
    submitted = false;

    constructor(private plateApi: PlateApi) {
    }

    public pushReplicate(plate, index) {
        if (!this.replicates.hasOwnProperty(index + 1)) {
            this.replicates[index + 1] = [];
        }
        this.replicates[index + 1].push(plate.csPlateid);
    }

    // Shared logic among screens
    // Load
    public getPlates() {
        const dates: Array<Object> = [];
        this.creationDates.map((date: Date) => {
            let month: number | string;
            month = date.getMonth() + 1;
            month = padStart(String(month), 2, '0');
            let day: number | string;
            day = date.getDate();
            day = padStart(String(day), 2, '0');
            dates.push({creationdate: `${date.getFullYear()}-${month}-${day}`});
        });

        const searchNames = this.searchNamePatterns.map((name: string) => {
            return {name: {like: name}};
        });

        const where = {
            and: [
                {
                    or: searchNames,
                },
                {
                    or: dates,
                }
            ]
        };

        this.plateApi.find({
            where: where,
            limit: 100,
            fields: {
                csPlateid: true,
                id: true,
                name: true,
                platebarcode: true,
                creationdate: true,
                imagepath: true
            }
        })
            .toPromise()
            .then((plates: PlateResultSet[]) => {
                // this.plates = plates;
                this.plates = JSON.parse(JSON.stringify(plates));

                plates.map((plate) => {
                    plate['instrumentPlateId'] = plate.csPlateid;
                });
                this.plates = this.sortPlates();
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
            });
    }

    // This is only a placeholder
    // It should be filled in by the logic per screen
    public sortPlates() {
        return this.plates;
    }

    /* Transform */
    addEmptyDate() {
        this.creationDates.push(this.creationDates[this.creationDates.length - 1]);
    }

    /* Transform */
    removeDate(index: number) {
        if (index > -1) {
            this.creationDates.splice(index, 1);
        }
    }

    /* Transform */
    removeSearchTerm(index: number) {
        if (index > -1) {
            this.searchNamePatterns.splice(index, 1);
        }
    }
}

export class RnaiScreenDesign extends ScreenDesign {

    treat_rnai_plates: PlateResultSet[] = [];
    ctrl_rnai_plates: PlateResultSet[] = [];
    ctrl_strain_plates: PlateResultSet[] = [];
    ctrl_null_plates: PlateResultSet[] = [];
    libraryQuadrant = '';
    chromosome: string | number = '';
    conditions: Array<Object> = [{code: 'E', condition: 'Permissive'}, {code: 'S', condition: 'Restrictive'}];

    clearForm() {
        this.plates = [];
        this.creationDates = [new Date()];
        this.conditionCode = '';
        this.libraryPlate = '';
        this.chromosome = '';
    }


    /**
     * This is pretty hacky. what should be done is to give each biosample a code, and then to check for that in the barcode
     * @returns {any[]}
     */
    public sortPlates() {
        this.clearPlates();
        const unSortedPlates = [];
        this.plates.map((plate: PlateResultSet) => {
            console.log(plate.name);
            if (plate.name.match(/Rnai/gi) && plate.name.match('M')) {
                this.treat_rnai_plates.push(plate);
            } else if (plate.name.match(/Rnai/gi) && plate.name.match('mel')) {
                this.treat_rnai_plates.push(plate);
            } else if (plate.name.match(/Rnai/gi) && plate.name.match('mip')) {
                this.treat_rnai_plates.push(plate);
            } else if (plate.name.match(/Rnai/gi) && plate.name.match('_am')) {
                this.treat_rnai_plates.push(plate);
            } else if (plate.name.match(/Rnai/gi) && plate.name.match('_vi')) {
                this.treat_rnai_plates.push(plate);
            } else if (plate.name.match(/Rnai/gi)) {
                this.ctrl_rnai_plates.push(plate);
            } else if (plate.name.match('L4440') && plate.name.match('M')) {
                this.ctrl_strain_plates.push(plate);
            } else if (plate.name.match('L4440')) {
                this.ctrl_null_plates.push(plate);
            } else {
                unSortedPlates.push(plate);
            }
        });
        // Treat Plates are usually named L4440E_M, L4440_E_D_M
        // Null are Named L4440E, L4440E_D
        // Want first the L4440E, then the duplicate
        // TODO Will have to define different schemas for different barcode naming conventions
        // Now the team uses D to indicate a replicate, but at some point this will change to named replicates (1,2,..,8)
        this.ctrl_strain_plates = orderBy(this.ctrl_strain_plates, ['name'], ['desc']);
        this.ctrl_null_plates = orderBy(this.ctrl_null_plates, ['name'], ['asc']);
        this.splitIntoReplicates();
        return unSortedPlates;
    }

    public splitIntoReplicates() {
        this.treat_rnai_plates.map((plate, index) => {
            this.pushReplicate(plate, index);
        });
        this.ctrl_rnai_plates.map((plate, index) => {
            this.pushReplicate(plate, index);
        });
        // Sometimes there is 1 L4440 per replicate, and sometimes 2
        // If its two we want the first half in the R1 replicates, and the second in the R2
        // Chunk each l4440 plate array into bins size of l4440_index
        const chunkSize = Math.ceil(this.ctrl_strain_plates.length / this.treat_rnai_plates.length);
        const chunked_treat_l4440 = chunk(this.ctrl_strain_plates, chunkSize);
        const chunked_null_l4440 = chunk(this.ctrl_null_plates, chunkSize);

        chunked_treat_l4440.map((chunk, index) => {
            chunk.map((plate) => {
                this.pushReplicate(plate, index);
            });
        });

        chunked_null_l4440.map((chunk, index) => {
            chunk.map((plate) => {
                this.pushReplicate(plate, index);
            });
        });
    }

    public clearPlates() {
        this.treat_rnai_plates = [];
        this.ctrl_rnai_plates = [];
        this.ctrl_strain_plates = [];
        this.ctrl_null_plates = [];
        this.replicates = {};
    }

    public buildSearchNames() {
        this.searchNamePatterns = [`RNAi${this.chromosome}.${this.libraryPlate}${this.libraryQuadrant}%${this.conditionCode}%`,
            `RNAi${this.chromosome}${this.libraryPlate}${this.libraryQuadrant}%${this.conditionCode}%`, `L4440${this.conditionCode}%`];
    }
}

export class RNAiExpUpload {

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
        // NY Specific ArrayScan
        model.instrumentId = 1;
        model.instrumentLookUp = 'arrayScan';
        model.instrumentPlateIdLookup = 'csPlateid';

        model.libraryModel = 'RnaiLibrary';
        model.libraryStockModel = 'RnaiLibraryStock';
        model.librarycode = 'ahringer2';
        model.biosampleType = 'worm';
        model.reagentLookUp = 'rnaiId';
        model.assayViewType = 'exp_assay_ahringer2';
        model.plateViewType = 'exp_plate_ahringer2';
        model.conditions = [
            'treat_rnai',
            'ctrl_rnai',
            'ctrl_null',
            'ctrl_strain'
        ];
        model.controlConditions = [
            'ctrl_strain',
            'ctrl_null'
        ];
        model.experimentConditions = [
            'treat_rnai',
            'ctrl_rnai'
        ];
        model.experimentMatchConditions = {
            'treat_rnai': 'ctrl_rnai'
        };
        model.biosampleMatchConditions = {
            'treat_rnai': 'ctrl_strain',
            'ctrl_rnai': 'ctrl_null'
        };
        model.experimentDesign = {
            'treat_rnai': [
                'ctrl_rnai',
                'ctrl_strain',
                'ctrl_null'
            ]
        };

        // TODO Make Naming Consistent
        model.experimentGroups = {};
        model.experimentGroups.treat_rnai = {};
        model.experimentGroups.ctrl_rnai = {};
        model.experimentGroups.ctrl_strain = {};
        model.experimentGroups.ctrl_null = {};
        model.experimentGroups.treat_rnai.plates = plateModel.treat_rnai_plates;
        model.experimentGroups.treat_rnai.biosampleId = expBiosampleModel.expBiosample.biosampleId;
        model.experimentGroups.ctrl_rnai['plates'] = plateModel.ctrl_rnai_plates;
        model.experimentGroups.ctrl_rnai['biosampleId'] = expBiosampleModel.ctrlBiosample.biosampleId;
        model.experimentGroups.ctrl_strain.plates = plateModel.ctrl_strain_plates;
        model.experimentGroups.ctrl_strain.biosampleId = expBiosampleModel.expBiosample.biosampleId;
        model.experimentGroups.ctrl_null.plates = plateModel.ctrl_null_plates;
        model.experimentGroups.ctrl_null.biosampleId = expBiosampleModel.ctrlBiosample.biosampleId;
        return model;
    }

    validateWorkflowData(model: RnaiScreenUploadWorkflowResultSet, errorMessages: Array<any>) {
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
        if (isEmpty(model.experimentGroups.treat_rnai.plates)) {
            errorMessages.push('There must be one or more Mutant + RNAi plates!');
        }
        if (isEmpty(model.experimentGroups.ctrl_rnai.plates)) {
            errorMessages.push('There must be one or more N2 + RNAi plates!');
        }
        return errorMessages;
    }
}

/**
 * Secondary screens have an explicitly defined plate plan
 * The plate plan must exist for the screen to be valid
 * TODO libraryId should go in the constructor!!!
 */
export class SearchPlatePlans {
    public platePlans: PlatePlan96ResultSet[];

    constructor(private platePlan96Api: PlatePlan96Api, public libraryId) {
        this.findPlatePlans();
    }

    findPlatePlans() {
        this.platePlan96Api.find({where: {libraryId: this.libraryId}})
            .toPromise()
            .then((results: PlatePlan96ResultSet[]) => {
                this.platePlans = results;
            })
            .catch((error) => {
                return new Error(error);
            });
    }
}
