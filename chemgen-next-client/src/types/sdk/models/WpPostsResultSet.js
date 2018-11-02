"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WpPostsResultSet = /** @class */ (function () {
    function WpPostsResultSet(data) {
        Object.assign(this, data);
    }
    /**
     * The name of the model represented by this $resource,
     * i.e. `WpPostsResultSet`.
     */
    WpPostsResultSet.getModelName = function () {
        return "WpPosts";
    };
    /**
    * @method factory
    * @author Jonathan Casarrubias
    * @license MIT
    * This method creates an instance of WpPostsResultSet for dynamic purposes.
    **/
    WpPostsResultSet.factory = function (data) {
        return new WpPostsResultSet(data);
    };
    /**
    * @method getModelDefinition
    * @author Julien Ledun
    * @license MIT
    * This method returns an object that represents some of the model
    * definitions.
    **/
    WpPostsResultSet.getModelDefinition = function () {
        return {
            name: 'WpPostsResultSet',
            plural: 'WpPostsResultSets',
            path: 'WpPosts',
            idName: 'id',
            properties: {
                "id": {
                    name: 'id',
                    type: 'number'
                },
                "postAuthor": {
                    name: 'postAuthor',
                    type: 'number'
                },
                "postDate": {
                    name: 'postDate',
                    type: 'Date'
                },
                "postDateGmt": {
                    name: 'postDateGmt',
                    type: 'Date'
                },
                "postContent": {
                    name: 'postContent',
                    type: 'string'
                },
                "postTitle": {
                    name: 'postTitle',
                    type: 'string'
                },
                "postExcerpt": {
                    name: 'postExcerpt',
                    type: 'string'
                },
                "postStatus": {
                    name: 'postStatus',
                    type: 'string'
                },
                "commentStatus": {
                    name: 'commentStatus',
                    type: 'string'
                },
                "pingStatus": {
                    name: 'pingStatus',
                    type: 'string'
                },
                "postPassword": {
                    name: 'postPassword',
                    type: 'string'
                },
                "postName": {
                    name: 'postName',
                    type: 'string'
                },
                "toPing": {
                    name: 'toPing',
                    type: 'string'
                },
                "pinged": {
                    name: 'pinged',
                    type: 'string'
                },
                "postModified": {
                    name: 'postModified',
                    type: 'Date'
                },
                "postModifiedGmt": {
                    name: 'postModifiedGmt',
                    type: 'Date'
                },
                "postContentFiltered": {
                    name: 'postContentFiltered',
                    type: 'string'
                },
                "postParent": {
                    name: 'postParent',
                    type: 'number'
                },
                "guid": {
                    name: 'guid',
                    type: 'string'
                },
                "menuOrder": {
                    name: 'menuOrder',
                    type: 'number'
                },
                "postType": {
                    name: 'postType',
                    type: 'string'
                },
                "postMimeType": {
                    name: 'postMimeType',
                    type: 'string'
                },
                "commentCount": {
                    name: 'commentCount',
                    type: 'number'
                },
            },
            relations: {
                wpTermRelationships: {
                    name: 'wpTermRelationships',
                    type: 'WpTermRelationshipsResultSet[]',
                    model: 'WpTermRelationships',
                    relationType: 'hasMany',
                    keyFrom: 'id',
                    keyTo: 'objectId'
                },
            }
        };
    };
    return WpPostsResultSet;
}());
exports.WpPostsResultSet = WpPostsResultSet;
//# sourceMappingURL=WpPostsResultSet.js.map