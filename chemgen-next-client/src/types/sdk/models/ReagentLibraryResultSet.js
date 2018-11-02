"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ReagentLibraryResultSet = /** @class */ (function () {
    function ReagentLibraryResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ReagentLibraryResultSet`.
     */
    ReagentLibraryResultSet.getModelName = function () {
        return "ReagentLibrary";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ReagentLibraryResultSet for dynamic purposes.
    **/
    ReagentLibraryResultSet.factory = function (data) {
        return new ReagentLibraryResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ReagentLibraryResultSet.getModelDefinition = function () {
        return {
            name: 'ReagentLibraryResultSet',
            plural: 'ReagentLibrariesResultSets',
            path: 'ReagentLibraries',
            idName: 'libraryId',
            properties: {
                "libraryId": {
                    name: 'libraryId',
                    type: 'number'
                },
                "libraryFullName": {
                    name: 'libraryFullName',
                    type: 'string'
                },
                "libraryShortName": {
                    name: 'libraryShortName',
                    type: 'string'
                },
                "libraryType": {
                    name: 'libraryType',
                    type: 'string'
                },
                "librarySource": {
                    name: 'librarySource',
                    type: 'string'
                },
                "libraryVendor": {
                    name: 'libraryVendor',
                    type: 'string'
                },
                "libraryVendorId": {
                    name: 'libraryVendorId',
                    type: 'string'
                },
                "dateObtained": {
                    name: 'dateObtained',
                    type: 'Date'
                },
                "libraryDescription": {
                    name: 'libraryDescription',
                    type: 'string'
                },
                "libraryLabContact": {
                    name: 'libraryLabContact',
                    type: 'string'
                },
                "libraryMeta": {
                    name: 'libraryMeta',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return ReagentLibraryResultSet;
}());
exports.ReagentLibraryResultSet = ReagentLibraryResultSet;
//# sourceMappingURL=ReagentLibraryResultSet.js.map