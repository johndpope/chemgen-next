"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var ReactomeGraph = app.models['ReactomeGraph'];
ReactomeGraph.extract.workflows.getGraphFromXrefs = function (xrefs) {
    return new Promise(function (resolve, reject) {
        var search = [];
        xrefs.map(function (xref) {
            search.push(xref.wbGeneAccession);
            search.push("UniProt:" + xref.uniprotAccession);
        });
        app.models.ReactomeGraph
            .find({ where: { entityName: { inq: search } } })
            .then(function (results) {
            var nodes = [];
            var links = [];
            results.map(function (result) {
                result.nodes.map(function (node) {
                    nodes.push(node);
                });
            });
            results.map(function (result) {
                result.links.map(function (node) {
                    links.push(node);
                });
            });
            nodes = lodash_1.uniqWith(nodes, lodash_1.isEqual);
            links = lodash_1.uniqWith(links, lodash_1.isEqual);
            resolve({ links: links, nodes: nodes });
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ReactomeGraph.js.map