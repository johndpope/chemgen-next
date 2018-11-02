"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ExpDesignResultSet = /** @class */ (function () {
    function ExpDesignResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ExpDesignResultSet`.
     */
    ExpDesignResultSet.getModelName = function () {
        return "ExpDesign";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ExpDesignResultSet for dynamic purposes.
    **/
    ExpDesignResultSet.factory = function (data) {
        return new ExpDesignResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ExpDesignResultSet.getModelDefinition = function () {
        return {
            name: 'ExpDesignResultSet',
            plural: 'ExpDesignsResultSets',
            path: 'ExpDesigns',
            idName: 'expDesignId',
            properties: {
                "expDesignId": {
                    name: 'expDesignId',
                    type: 'number'
                },
                "screenId": {
                    name: 'screenId',
                    type: 'number'
                },
                "expWorkflowId": {
                    name: 'expWorkflowId',
                    type: 'string'
                },
                "treatmentGroupId": {
                    name: 'treatmentGroupId',
                    type: 'number'
                },
                "controlGroupId": {
                    name: 'controlGroupId',
                    type: 'number'
                },
                "controlGroupReagentType": {
                    name: 'controlGroupReagentType',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return ExpDesignResultSet;
}());
exports.ExpDesignResultSet = ExpDesignResultSet;
//# sourceMappingURL=ExpDesignResultSet.js.map