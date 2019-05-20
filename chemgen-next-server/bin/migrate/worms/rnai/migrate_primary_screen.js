'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server");
var Promise = require('bluebird');
var fs = require('fs');
var readFile = Promise.promisify(require('fs')
    .readFile);
var jsonfile = require('jsonfile');
var path = require('path');
var deepcopy = require("deepcopy");
var lodash_1 = require("lodash");
var Papa = require("papaparse");
//mel-28 primary genome wide  screen
var minimal = jsonfile.readFileSync(path.resolve(__dirname, 'data', 'primary', 'minimal_primary.json'));
var controlBiosampleId = 4;
var controlBiosampleName = 'N2';
//mel-28 primary genome wide enhancer/permissive screen
// const primaryDataFile = path.resolve(__dirname, 'data', 'primary', 'primary_assays-2016-03--2016-09.json');
// let expBiosampleId = 5;
// let expBiosampleName = 'mel-28';
// console.log('Beginning permissive screen');
// const screenId = 1;
// const screenName = 'mel-28 Primary RNAi Genome Wide Permissive Screen';
// let workflowJsonName = 'mel-28_Primary_RNAi_Genome_Wide_Permissive_Screen--2016-03--2016-09';
// const temperature = "17.5";
// let conditionCode = 'E';
// let notThisCondition = 'S';
// let screenType = 'permissive';
//mel-28 primary genome wide restrictive screen
// console.log('Beginning restrictive screen');
// const screenId = 2;
// const screenName = 'mel-28 Primary RNAi Genome Wide Restrictive Screen';
// let workflowJsonName = 'mel-28_Primary_RNAi_Genome_Wide_Restrictive_Screen--2016-03--2016-09';
// const temperature = "23.3";
// let conditionCode = 'S';
// let notThisCondition = 'E';
// let screenType = 'restrictive';
//mip-1;mip2 primary genome wide
var primaryDataFile = path.resolve(__dirname, 'data', 'primary', 'mip-1-primary_assays-2017-12.json');
var primaryDataList = jsonfile.readFileSync(primaryDataFile);
var expBiosampleId = 6;
var expBiosampleName = 'mip-1;mip-2';
//mip-1;mip2 primary genome wide restrictive/permissive
// console.log('mip-1 restrictive');
// const screenId = 3;
// const screenName = 'mip-1;mip-2 Primary RNAi Restrictive Screen' ;
// let workflowJsonName = 'mip-1;mip-2_Primary_RNAi_Genome_Wide_Restrictive_Screen--2017-12';
// const temperature = "25";
// let conditionCode = 'S';
// let notThisCondition = 'E';
// let screenType = 'restrictive';
// console.log('mip-1 permissive');
var screenId = 4;
var screenName = 'mip-1;mip-2 Primary RNAi Permissive Screen';
var workflowJsonName = 'mip-1;mip-2_Primary_RNAi_Genome_Wide_Permissive_Screen--2017-12';
var temperature = "20";
var conditionCode = 'E';
var notThisCondition = 'S';
var screenType = 'permissive';
var newDataList = [];
console.log("Primary Data List: " + primaryDataList.length);
// primaryDataList = primaryDataList.slice(0, 10);
primaryDataList.map(function (primaryData) {
    var tDataList = findQuads(primaryData);
    tDataList.map(function (tData) {
        newDataList.push(tData);
    });
});
doStuff(newDataList);
function mapOldWorkflow(workflowData) {
    var primaryWorkflow = deepcopy(minimal);
    var quadrant = lodash_1.get(workflowData, ['search', 'library', 'rnai', 'ahringer', 'quadrant']);
    var chrom = lodash_1.get(workflowData, ['search', 'library', 'rnai', 'ahringer', 'chrom']);
    var plate = lodash_1.get(workflowData, ['search', 'library', 'rnai', 'ahringer', 'RnaiPlateNo']);
    [quadrant, chrom, plate].map(function (thing) {
        if (lodash_1.isEmpty(thing) || lodash_1.isNull(thing)) {
            console.error('Things are missing that should not be missing!');
            console.error(JSON.stringify(workflowData.search));
            process.exit(1);
        }
    });
    primaryWorkflow.search.rnaiLibrary.plate = plate;
    primaryWorkflow.search.rnaiLibrary.quadrant = quadrant;
    primaryWorkflow.search.rnaiLibrary.chrom = chrom;
    primaryWorkflow.stockPrepDate = workflowData.assayDate;
    primaryWorkflow.assayDates = [workflowData.assayDate];
    primaryWorkflow.replicates = workflowData.screenDesign.replicates;
    primaryWorkflow.screenName = screenName;
    primaryWorkflow.screenId = screenId;
    primaryWorkflow.temperature = temperature;
    primaryWorkflow.name = "AHR2 " + workflowData.assayDate + " " + expBiosampleName + " " + controlBiosampleName + " " + screenType + " Chr " + chrom + " Plate " + plate + " Q " + quadrant;
    primaryWorkflow.comment = "migration upload";
    primaryWorkflow.screenType = screenType;
    primaryWorkflow.experimentGroups.treat_rnai.plates = workflowData.screenDesign.treat_rnai_plates;
    primaryWorkflow.experimentGroups.treat_rnai.biosampleId = expBiosampleId;
    primaryWorkflow.experimentGroups.ctrl_rnai.plates = workflowData.screenDesign.n2_rnai_plates;
    primaryWorkflow.experimentGroups.ctrl_rnai.biosampleId = controlBiosampleId;
    primaryWorkflow.experimentGroups.ctrl_strain.plates = workflowData.screenDesign.treat_l4440_plates;
    primaryWorkflow.experimentGroups.ctrl_strain.biosampleId = expBiosampleId;
    primaryWorkflow.experimentGroups.ctrl_null.plates = workflowData.screenDesign.null_l4440_plates;
    primaryWorkflow.experimentGroups.ctrl_null.biosampleId = controlBiosampleId;
    primaryWorkflow.biosamples = {
        "experimentBiosample": {
            "id": expBiosampleId,
            "name": expBiosampleName
        },
        "ctrlBiosample": {
            "id": controlBiosampleId,
            "name": controlBiosampleName,
        }
    };
    return primaryWorkflow;
}
function doStuff(tDataList) {
    Promise.map(tDataList, function (tData) {
        return findPlates(tData)
            .then(function (results) {
            return results;
        })
            .catch(function (error) {
            return new Error(error);
        });
    }, { concurrency: 1 })
        .then(function (results) {
        //Get the valid contactSheetResults
        var filteredResults = lodash_1.filter(results, function (result) {
            return !lodash_1.isEmpty(result) && result.VALID;
        });
        filteredResults = lodash_1.uniqWith(filteredResults, lodash_1.isEqual);
        var workflows = filteredResults.map(function (workflowData) {
            return mapOldWorkflow(workflowData);
        });
        workflows = lodash_1.uniqWith(workflows, lodash_1.isEqual);
        console.log("Got # " + workflows.length + " workflows!");
        jsonfile.writeFileSync(path.resolve(__dirname, 'data', 'primary', workflowJsonName + ".json"), workflows, { spaces: 2 });
        //Get the invalid contactSheetResults
        var inValid = lodash_1.filter(results, function (result) {
            return !lodash_1.isEmpty(result) && !result.VALID;
        });
        var invalidSearch = inValid.map(function (row) {
            return { search: row.search, assayDate: row.assayDate };
        });
        console.log('Invalid Searches!!!');
        console.log(JSON.stringify(invalidSearch));
        //TODO Find all chr/plates in original workflow with no matching plates
        //All Chrom-Plate-Quadrants found and are valid
        var chromPlates = workflows.map(function (workflow) {
            var chrom = lodash_1.get(workflow, ['search', 'rnaiLibrary', 'chrom']);
            var plate = lodash_1.get(workflow, ['search', 'rnaiLibrary', 'plate']);
            var quadrant = lodash_1.get(workflow, ['search', 'rnaiLibrary', 'quadrant']);
            return { chrom: chrom, plate: plate, quadrant: quadrant, assayDate: workflow.stockPrepDate };
        });
        var uniqChromPlates = lodash_1.uniqWith(chromPlates, lodash_1.isEqual);
        uniqChromPlates = lodash_1.orderBy(uniqChromPlates, ['chrom'], ['asc']);
        var csv = Papa.unparse(uniqChromPlates);
        fs.writeFileSync(path.resolve(__dirname, 'data', 'primary', workflowJsonName + "_valid_workflows.csv"), csv);
        //All Chrom-Plate-Quadrants from the original workflow Data
        var AllChromPlates = workflows.map(function (workflow) {
            var chrom = lodash_1.get(workflow, ['search', 'library', 'rnai', 'ahringer', 'chrom']);
            var plate = lodash_1.get(workflow, ['search', 'library', 'rnai', 'ahringer', 'RnaiPlateNo']);
            return { chrom: chrom, plate: plate, assayDate: workflow.stockPrepDate };
        });
        AllChromPlates = lodash_1.uniqWith(AllChromPlates, lodash_1.isEqual);
        var notFound = [];
        AllChromPlates.map(function (search) {
            var found = lodash_1.find(uniqChromPlates, function (workflow) {
                return lodash_1.isEqual(search.plate, workflow.plate) && lodash_1.isEqual(search.chrom, workflow.chrom);
            });
            if (!found) {
                notFound.push(search);
            }
        });
        csv = Papa.unparse(notFound);
        fs.writeFileSync(path.resolve(__dirname, 'data', 'primary', workflowJsonName + "_not_found_workflows.csv"), csv);
        process.exit(0);
    })
        .catch(function (error) {
        process.exit(1);
    });
}
function findQuads(primaryData) {
    var searchNames = [];
    var chromosome = primaryData.search.library.rnai.ahringer.chrom;
    var libraryPlate = primaryData.search.library.rnai.ahringer.RnaiPlateNo;
    var dates = primaryData.imageDates;
    var copyList = [];
    if (lodash_1.get(primaryData, ['search', 'library', 'rnai', 'ahringer', 'quadrant'])) {
        var copy = deepcopy(primaryData);
        var libraryQuadrant = lodash_1.get(primaryData, ['search', 'library', 'rnai', 'ahringer', 'quadrant']);
        //Sometimes the expSetSearch term is RNA, sometimes RNAI
        // let searchNamePatterns = [`RN%${chromosome}.${libraryPlate}${libraryQuadrant}%${conditionCode}%`,
        //   `RN%${chromosome}${libraryPlate}${libraryQuadrant}%${conditionCode}%`, `L4440${conditionCode}%`];
        var searchNamePatterns = ["RN%" + chromosome + "." + libraryPlate + libraryQuadrant + "%",
            "RN%" + chromosome + libraryPlate + libraryQuadrant + "%", "L4440%"];
        searchNames = searchNamePatterns.map(function (name) {
            return { name: { like: name } };
        });
        var where = {
            and: [
                {
                    or: searchNames,
                },
                { name: { nlike: "%" + notThisCondition + "%" } },
                {
                    or: dates,
                }
            ]
        };
        copy.SEARCH = where;
        copyList.push(copy);
    }
    else {
        var quadrants = ['Q1', 'Q2', 'Q3', 'Q4', 'A1', 'A2', 'B1', 'B2'];
        quadrants.map(function (libraryQuadrant) {
            var copy = deepcopy(primaryData);
            //For E this si fine
            //For S we have to have a expSetSearch condition that is matches S or just does not match E
            //Some restrictive screens have the S, some don't
            copy.search.library.rnai.ahringer.quadrant = libraryQuadrant;
            var searchNamePatterns = ["RN%" + chromosome + "." + libraryPlate + libraryQuadrant + "%" + conditionCode + "%",
                "RN%" + chromosome + libraryPlate + libraryQuadrant + "%" + conditionCode + "%", "L4440" + conditionCode + "%",];
            searchNames = searchNamePatterns.map(function (name) {
                return { name: { like: name } };
            });
            var where = {
                and: [
                    {
                        or: searchNames,
                    },
                    { name: { nlike: "%" + notThisCondition + "%" } },
                    {
                        or: dates,
                    }
                ]
            };
            copy.SEARCH = where;
            copyList.push(copy);
        });
    }
    return copyList;
}
function findPlates(workflowData) {
    return new Promise(function (resolve, reject) {
        app.models.Plate.find({
            where: workflowData.SEARCH,
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
            .then(function (results) {
            var rnai_plates = lodash_1.find(results, function (result) {
                return result.name.match(/rnai/i);
            });
            if (lodash_1.isEmpty(rnai_plates) || lodash_1.isNull(rnai_plates)) {
                resolve([]);
            }
            else {
                workflowData.PLATES = results;
                var screenDesign = new RnaiScreenDesign();
                screenDesign.plates = results;
                screenDesign.sortPlates();
                workflowData.screenDesign = screenDesign;
                workflowData.VALID = lodash_1.isEqual(workflowData.screenDesign.replicates['1'].length, workflowData.screenDesign.replicates['2'].length);
                resolve(workflowData);
            }
        })
            .catch(function (error) {
            console.error(JSON.stringify(error));
            reject(new Error(error));
        });
    });
}
function validateWorkflow(workflowData) {
    var valid = true;
    var replcatesLength = lodash_1.isEqual(workflowData.screenDesign.replicates['1'].length, workflowData.screenDesign.replicates['2'].length);
    var numberOfReplicates = lodash_1.isEqual(Object.keys(workflowData.screenDesign.replicates).length, 2);
}
//The nicer version of this exists in the chemgen-next-ng codebase
//I just took this class
var RnaiScreenDesign = /** @class */ (function () {
    function RnaiScreenDesign() {
        this.treat_rnai_plates = [];
        this.n2_rnai_plates = [];
        this.treat_l4440_plates = [];
        this.null_l4440_plates = [];
        this.conditions = [{ code: 'E', condition: 'Permissive' }, { code: 'S', condition: 'Restrictive' }];
        /* Place plates in appropriate conditions */
        /* This is mostly done in the screen specific logic, but there are a few placeholders here to grab the plates */
        this.plates = [];
        this.replicates = {};
    }
    RnaiScreenDesign.prototype.clearPlates = function () {
        this.treat_rnai_plates = [];
        this.n2_rnai_plates = [];
        this.treat_l4440_plates = [];
        this.null_l4440_plates = [];
        this.replicates = {};
    };
    /**
     * This is pretty hacky. what should be done is to give each biosample a code, and then to check for that in the barcode
     * @returns {any[]}
     */
    RnaiScreenDesign.prototype.sortPlates = function () {
        var _this = this;
        this.clearPlates();
        var unSortedPlates = [];
        this.plates.map(function (plate) {
            if (plate.name.match(/Rna/gi) && plate.name.match('M')) {
                _this.treat_rnai_plates.push(plate);
            }
            else if (plate.name.match(/Rna/gi) && plate.name.match('mel')) {
                _this.treat_rnai_plates.push(plate);
            }
            else if (plate.name.match(/Rna/gi) && plate.name.match('mip')) {
                _this.treat_rnai_plates.push(plate);
            }
            else if (plate.name.match(/Rna/gi)) {
                _this.n2_rnai_plates.push(plate);
            }
            else if (plate.name.match('L4440') && plate.name.match('M')) {
                _this.treat_l4440_plates.push(plate);
            }
            else if (plate.name.match('L4440')) {
                _this.null_l4440_plates.push(plate);
            }
            else {
                unSortedPlates.push(plate);
            }
        });
        // Treat Plates are usually named L4440E_M, L4440_E_D_M
        // Null are Named L4440E, L4440E_D
        // Want first the L4440E, then the duplicate
        // TODO Will have to define different schemas for different barcode naming conventions
        // Now the team uses D to indicate a replicate, but at some point this will change to named replicates (1,2,..,8)
        this.treat_l4440_plates = lodash_1.orderBy(this.treat_l4440_plates, ['name'], ['desc']);
        this.null_l4440_plates = lodash_1.orderBy(this.null_l4440_plates, ['name'], ['asc']);
        this.splitIntoReplicates();
        return unSortedPlates;
    };
    RnaiScreenDesign.prototype.pushReplicate = function (plate, index) {
        if (!this.replicates.hasOwnProperty(index + 1)) {
            this.replicates[index + 1] = [];
        }
        this.replicates[index + 1].push(plate.csPlateid);
    };
    RnaiScreenDesign.prototype.splitIntoReplicates = function () {
        var _this = this;
        this.treat_rnai_plates.map(function (plate, index) {
            _this.pushReplicate(plate, index);
        });
        this.n2_rnai_plates.map(function (plate, index) {
            _this.pushReplicate(plate, index);
        });
        // Sometimes there is 1 L4440 per replicate, and sometimes 2
        // If its two we want the first half in the R1 replicates, and the second in the R2
        // Chunk each l4440 plate array into bins size of l4440_index
        var chunkSize = Math.ceil(this.treat_l4440_plates.length / this.treat_rnai_plates.length);
        var chunked_treat_l4440 = lodash_1.chunk(this.treat_l4440_plates, chunkSize);
        var chunked_null_l4440 = lodash_1.chunk(this.null_l4440_plates, chunkSize);
        chunked_treat_l4440.map(function (chunk, index) {
            chunk.map(function (plate) {
                _this.pushReplicate(plate, index);
            });
        });
        chunked_null_l4440.map(function (chunk, index) {
            chunk.map(function (plate) {
                _this.pushReplicate(plate, index);
            });
        });
    };
    return RnaiScreenDesign;
}());
exports.RnaiScreenDesign = RnaiScreenDesign;
//# sourceMappingURL=migrate_primary_screen.js.map