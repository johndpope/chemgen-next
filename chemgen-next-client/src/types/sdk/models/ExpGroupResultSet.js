"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ExpGroupResultSet = /** @class */ (function () {
    function ExpGroupResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ExpGroupResultSet`.
     */
    ExpGroupResultSet.getModelName = function () {
        return "ExpGroup";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ExpGroupResultSet for dynamic purposes.
    **/
    ExpGroupResultSet.factory = function (data) {
        return new ExpGroupResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ExpGroupResultSet.getModelDefinition = function () {
        return {
            name: 'ExpGroupResultSet',
            plural: 'ExpGroupsResultSets',
            path: 'ExpGroups',
            idName: 'expGroupId',
            properties: {
                "expGroupId": {
                    name: 'expGroupId',
                    type: 'number'
                },
                "expGroupType": {
                    name: 'expGroupType',
                    type: 'string'
                },
                "screenId": {
                    name: 'screenId',
                    type: 'number'
                },
                "libraryId": {
                    name: 'libraryId',
                    type: 'number'
                },
                "biosampleId": {
                    name: 'biosampleId',
                    type: 'number'
                },
                "well": {
                    name: 'well',
                    type: 'string'
                },
                "expWorkflowId": {
                    name: 'expWorkflowId',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return ExpGroupResultSet;
}());
exports.ExpGroupResultSet = ExpGroupResultSet;
//# sourceMappingURL=ExpGroupResultSet.js.map