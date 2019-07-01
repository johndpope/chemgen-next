"use strict";
/* tslint:disable */
Object.defineProperty(exports, "__esModule", { value: true });
var ExpScreenResultSet = /** @class */ (function () {
    function ExpScreenResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `ExpScreenResultSet`.
     */
    ExpScreenResultSet.getModelName = function () {
        return "ExpScreen";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of ExpScreenResultSet for dynamic purposes.
    **/
    ExpScreenResultSet.factory = function (data) {
        return new ExpScreenResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    ExpScreenResultSet.getModelDefinition = function () {
        return {
            name: 'ExpScreenResultSet',
            plural: 'ExpScreensResultSets',
            path: 'ExpScreens',
            idName: 'screenId',
            properties: {
                "screenId": {
                    name: 'screenId',
                    type: 'number'
                },
                "screenName": {
                    name: 'screenName',
                    type: 'string'
                },
                "screenMoniker": {
                    name: 'screenMoniker',
                    type: 'string'
                },
                "screenType": {
                    name: 'screenType',
                    type: 'string'
                },
                "screenStage": {
                    name: 'screenStage',
                    type: 'string'
                },
                "screenDescription": {
                    name: 'screenDescription',
                    type: 'string'
                },
                "screenProtocol": {
                    name: 'screenProtocol',
                    type: 'string'
                },
                "screenParentId": {
                    name: 'screenParentId',
                    type: 'number'
                },
                "screenPerformedBy": {
                    name: 'screenPerformedBy',
                    type: 'string'
                },
                "screenMeta": {
                    name: 'screenMeta',
                    type: 'string'
                },
            },
            relations: {}
        };
    };
    return ExpScreenResultSet;
}());
exports.ExpScreenResultSet = ExpScreenResultSet;
//# sourceMappingURL=ExpScreenResultSet.js.map