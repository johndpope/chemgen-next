#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios = require("axios");
var lodash_1 = require("lodash");
var Promise = require("bluebird");
var convert = require("xml-js");
var fs = require("fs");
var path = require("path");
var app = require("../server/server");
var graphlib = require("graphlib");
// https://reactome.org/ContentService/search/query?query=wbgene00000527&cluster=true
//@ts-ignore
var cElegansPathwaysXml = fs.readFileSync(path.join(__dirname, 'c_elegans_pathway.xml'));
var cElegansPathways = JSON.parse(convert.xml2json(cElegansPathwaysXml, { compact: true, spaces: 4 }));
var nodes = [];
var links = [];
var gene = 'wbgene00000527';
var g = new graphlib.Graph();
parsePathways()
    .then(function () {
    return getAllXRefs();
})
    .then(function () {
    process.exit(0);
})
    .catch(function (error) {
    console.log(error);
    process.exit(1);
});
function getSingleGene() {
    var gene = "UniProt:P91128";
    return new Promise(function (resolve, reject) {
        getGene(gene)
            .then(function (results) {
            return createReactomeData(gene, results);
        })
            .then(function (results) {
            return createDirectedGraphPerEntity(results);
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            reject(Error(error));
        });
    });
}
function getScoredXrefs() {
    return new Promise(function (resolve, reject) {
        app.models.ExpSet.extract.workflows.orderByExpManualScoresEmbLeth()
            .then(function (results) {
            //@ts-ignore
            return Promise.map(results.expSets.rnaisXrefs, function (gene) {
                app.winston.info("Getting gene " + gene.wbGeneAccession);
                app.winston.info("UniProt: " + gene.uniprotAccession);
                return getGene("UniProt:" + gene.uniprotAccession)
                    .then(function (results) {
                    return createReactomeData(gene, results);
                })
                    .then(function (results) {
                    return createDirectedGraphPerEntity(results);
                })
                    .then(function () {
                    return getGene(gene.wbGeneAccession)
                        .then(function (results) {
                        return createReactomeData(gene, results);
                    })
                        .then(function (results) {
                        return createDirectedGraphPerEntity(results);
                    })
                        .catch(function (error) {
                        return new Error(error);
                    });
                })
                    .catch(function (error) {
                    return new Error(error);
                });
            })
                .then(function () {
                return;
            })
                .catch(function (error) {
                return new Error(error);
            });
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
/**
 * This function look all up by Wormbase Accession
 * But the wormbase accession misses a LOT
 * So we also need to look them up by UniprotID
 */
function getAllXRefs() {
    return new Promise(function (resolve, reject) {
        app.paginateModel('RnaiWormbaseXrefs', {}, 50)
            .then(function (paginationResults) {
            app.winston.info("PaginationResults: " + JSON.stringify(paginationResults));
            // return Promise.map(shuffle(range(0, paginationResults.totalPages)), (page) => {
            // return Promise.map(shuffle(range(0, 2)), (page) => {
            //@ts-ignore
            return Promise.map(lodash_1.range(0, paginationResults.totalPages), function (page) {
                var skip = Number(page) * Number(paginationResults.limit);
                console.log("Page: " + page + " Skip: " + skip);
                return app.models.RnaiWormbaseXrefs
                    .find({ fields: { wbGeneAccession: true }, limit: paginationResults.limit, skip: skip })
                    .then(function (genes) {
                    //@ts-ignore
                    return Promise.map(lodash_1.shuffle(genes), function (gene) {
                        app.winston.info("Finding Gene: " + gene.wbGeneAccession);
                        return getGene(gene.wbGeneAccession)
                            .then(function (results) {
                            return createReactomeData(gene, results);
                        })
                            .then(function (results) {
                            return createDirectedGraphPerEntity(results);
                        })
                            .catch(function (error) {
                            return new Error(error);
                        });
                    }, { concurrency: 8 });
                });
            }, { concurrency: 1 })
                .then(function () {
                return;
            })
                .catch(function (error) {
                return new Error(error);
            });
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function createDirectedGraphPerEntity(results) {
    return new Promise(function (resolve, reject) {
        if (results.pathways.length) {
            var pathwayData = results.pathways.map(function (pathway) {
                return getPathwayNeighbors(pathway.dbId);
            });
            var geneNodes_1 = [];
            var geneLinks_1 = [];
            pathwayData.map(function (data) {
                data.nodes.map(function (node) {
                    geneNodes_1.push(node);
                });
            });
            pathwayData.map(function (data) {
                data.links.map(function (link) {
                    geneLinks_1.push(link);
                });
            });
            geneNodes_1 = lodash_1.uniqWith(geneNodes_1, lodash_1.isEqual);
            geneLinks_1 = lodash_1.uniqWith(geneLinks_1, lodash_1.isEqual);
            var geneGraph_1 = new graphlib.Graph();
            results.pathways.map(function (pathway) {
                pathway.id = String(pathway.dbId);
                pathway.type = 'Pathway';
                geneGraph_1.setNode(pathway.dbId, pathway.displayName);
                geneNodes_1.push(pathway);
            });
            results.pathways.map(function (pathway) {
                geneGraph_1.setEdge(results.gene, pathway.dbId);
                geneLinks_1.push({ source: String(results.gene), target: String(pathway.dbId) });
            });
            results.entities.map(function (entity) {
                entity.id = results.gene;
                entity.type = 'Gene';
                geneNodes_1.push(entity);
            });
            // geneNodes = geneNodes.filter((node) => {
            //   return find(geneLinks, (link) => {
            //     return isEqual(String(link.source), String(node.id)) || isEqual(String(link.target), String(node.id))
            //   });
            // });
            //
            geneLinks_1 = geneLinks_1.filter(function (link) {
                var foundSource = lodash_1.find(geneNodes_1, function (node) {
                    return lodash_1.isEqual(String(link.source), String(node.id));
                });
                var foundTarget = lodash_1.find(geneNodes_1, function (node) {
                    return lodash_1.isEqual(String(link.target), String(node.id));
                });
                return foundSource && foundTarget;
            });
            // geneLinks.map((geneLink) => {
            //   geneGraph.setEdge(geneLink.source, geneLink.target);
            // });
            // geneNodes.map((node) => {
            //   geneGraph.setNode(node.id, node.displayName);
            // });
            var distanceMatrix = graphlib.alg.dijkstraAll(geneGraph_1, function (e) {
                return geneGraph_1.edge(e);
            });
            app.models.ReactomeGraph
                .findOrCreate({ where: { entityName: results.gene } }, {
                entityName: results.gene,
                nodes: geneNodes_1,
                links: geneLinks_1,
                pathways: results.pathways,
                entities: results.entities
            })
                .then(function (results) {
                resolve();
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
        else {
            resolve();
        }
    });
}
function createReactomeData(gene, results) {
    return new Promise(function (resolve, reject) {
        createEntities(gene, results.entities)
            .then(function () {
            return createPathways(results.pathways);
        })
            .then(function () {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function parsePathways() {
    return new Promise(function (resolve, reject) {
        if (lodash_1.has(cElegansPathways, 'Pathways') && lodash_1.isObject(cElegansPathways.Pathways)) {
            var rootPathway = cElegansPathways.Pathways.Pathway;
            rootPathway.map(function (pathway) {
                return recursePathway(pathway, 0);
            });
            nodes = lodash_1.uniqWith(nodes, lodash_1.isEqual);
            links = lodash_1.uniqWith(links, lodash_1.isEqual);
            resolve();
        }
        else {
            throw new Error('Unknown pathway file type!');
        }
    });
}
function getPathwayNeighbors(pathwayId) {
    var connectedComponents = graphlib.alg.components(g);
    var neighbors = g.neighbors(String(pathwayId));
    var found = {};
    var neighborNodes = [];
    var neighborLinks = [];
    var getNeighbors = function (pathwayId) {
        if (lodash_1.has(found, pathwayId)) {
            return;
        }
        else {
            var tlinks = links.filter(function (link) {
                return lodash_1.isEqual(String(link.source), String(pathwayId)) || lodash_1.isEqual(String(link.target), String(pathwayId));
            });
            var tnodes = nodes.filter(function (node) {
                return lodash_1.isEqual(String(node.id), String(pathwayId));
            });
            tlinks.map(function (tlink) {
                neighborLinks.push(tlink);
            });
            tnodes.map(function (node) {
                neighborNodes.push(node);
            });
            found[pathwayId] = true;
            tlinks.map(function (link) {
                getNeighbors(link.source);
                getNeighbors(link.target);
            });
        }
    };
    // let thisPathwayComponents: Array<Array<any>> = connectedComponents.filter((component: Array<any>) => {
    //   return includes(component, String(pathwayId));
    // });
    var thisPathwayComponents = [neighbors];
    thisPathwayComponents.map(function (component) {
        component.map(function (dbId) {
            var node = lodash_1.find(nodes, { id: String(dbId) });
            if (node) {
                neighborNodes.push(node);
            }
            var tLinks = links.filter(function (link) {
                return lodash_1.isEqual(link.source, String(dbId)) || lodash_1.isEqual(link.target, String(dbId));
            });
            tLinks.map(function (link) {
                neighborLinks.push(link);
            });
        });
    });
    neighborNodes = lodash_1.uniqWith(neighborNodes, lodash_1.isEqual);
    neighborLinks = lodash_1.uniqWith(neighborLinks, lodash_1.isEqual);
    return { nodes: neighborNodes, links: neighborLinks, pathwayId: pathwayId };
}
function createEntities(gene, entities) {
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        Promise.map(entities, function (entity) {
            entity.entityId = entity.id;
            entity.wormbaseId = gene.wbGeneAccession;
            entity.uniProtId = gene.uniprotAccession;
            delete entity.id;
            return app.models.ReactomeEntity
                .findOrCreate({ where: { dbId: entity.dbId } }, entity);
        })
            .then(function (results) {
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function createPathways(pathways) {
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        Promise.map(pathways, function (pathway) {
            pathway.pathwayId = pathway.id;
            delete pathway.id;
            return app.models.ReactomePathway
                .findOrCreate({ where: { dbId: pathway.dbId } }, pathway);
        })
            .then(function (results) {
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function recursePathway(parentPathway, childPathway) {
    if (childPathway && lodash_1.isObject(childPathway) && lodash_1.has(childPathway, '_attributes')) {
        nodes.push({
            type: 'Pathway',
            id: childPathway._attributes.dbId,
            dbId: childPathway._attributes.dbId,
            displayName: childPathway._attributes.displayName
        });
        g.setNode(childPathway._attributes.dbId, childPathway._attributes.displayName);
    }
    else if (parentPathway && lodash_1.has(parentPathway, '_attributes')) {
        nodes.push({
            type: 'Pathway',
            dbId: parentPathway._attributes.dbId,
            id: parentPathway._attributes.dbId,
            displayName: parentPathway._attributes.displayName
        });
        g.setNode(parentPathway._attributes.dbId, parentPathway._attributes.displayName);
    }
    if (lodash_1.isObject(childPathway) && lodash_1.has(childPathway, '_attributes') && lodash_1.isObject(parentPathway) && lodash_1.has(parentPathway, '_attributes')) {
        g.setEdge(childPathway._attributes.dbId, parentPathway._attributes.dbId);
        links.push({
            source: childPathway._attributes.dbId,
            target: parentPathway._attributes.dbId,
            childPathwayDisplayName: childPathway._attributes.displayName,
            parentPathwayDisplayName: parentPathway._attributes.displayName,
            type: 'Pathway',
        });
    }
    if (childPathway) {
        if (lodash_1.isArray(childPathway)) {
            recursePathway(parentPathway, childPathway.pop());
        }
        else if (lodash_1.isObject(childPathway) && lodash_1.has(childPathway, 'Pathway')) {
            recursePathway(childPathway, childPathway.Pathway);
        }
        else if (lodash_1.isObject(childPathway) && lodash_1.has(childPathway, 'Reaction') && lodash_1.isObject(childPathway.Reaction)) {
            nodes.push({
                type: 'Reaction',
                dbId: childPathway._attributes.dbId,
                id: childPathway._attributes.dbId,
                displayName: childPathway._attributes.displayName
            });
            g.setNode(childPathway._attributes.dbId, childPathway._attributes.displayName);
            if (lodash_1.isObject(parentPathway) && lodash_1.has(parentPathway, '_attributes') && lodash_1.has(childPathway, ['Reaction', '_attributes'])) {
                g.setEdge(childPathway.Reaction._attributes.dbId, parentPathway._attributes.dbId);
                links.push({
                    source: childPathway.Reaction._attributes.dbId,
                    target: parentPathway._attributes.dbId,
                    childReactionDisplayName: childPathway.Reaction._attributes.displayName,
                    parentPathwayDisplayName: parentPathway._attributes.displayName,
                    type: 'Reaction',
                });
            }
        }
        else if (lodash_1.isObject(childPathway) && lodash_1.has(childPathway, 'Reaction') && lodash_1.isArray(childPathway.Reaction)) {
            recursePathway(parentPathway, childPathway.Reaction.pop());
        }
    }
    if (lodash_1.has(parentPathway, 'Pathway') && lodash_1.isArray(parentPathway.Pathway) && parentPathway.Pathway.length) {
        recursePathway(parentPathway, parentPathway.Pathway.pop());
    }
    else if (lodash_1.has(parentPathway, 'Pathway') && lodash_1.isArray(parentPathway.Pathway) && !parentPathway.Pathway.length) {
        return;
    }
}
function getGene(gene) {
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        axios.get('https://reactome.org/ContentService/search/query', { params: { query: lodash_1.toLower(gene), cluster: true } })
            .then(function (results) {
            var proteins = lodash_1.filter(results.data.results, { typeName: 'Protein' });
            proteins = lodash_1.flatten(proteins);
            var reactomeEntities = [];
            proteins.map(function (protein) {
                protein.entries.map(function (entry) {
                    reactomeEntities.push(new ReactomeEntity(entry));
                });
            });
            // nodes.push({id: gene, displayName: gene});
            // g.setNode(gene, gene);
            return getPathways(reactomeEntities)
                .then(function (pathways) {
                // pathways.map((pathway) => {
                //   links.push({source: gene, target: String(pathway.dbId), type: "Gene In Pathway"});
                //   g.setEdge(gene, String(pathway.dbId));
                // });
                return { gene: gene, pathways: pathways, entities: reactomeEntities };
            })
                .catch(function (error) {
                return new Error(error);
            });
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            // console.log(error);
            if (lodash_1.has(error, ['response', 'status']) && lodash_1.isEqual(error.response.status, 404)) {
                resolve({ gene: gene, pathways: [], entities: [] });
            }
            else {
                reject(new Error(error));
            }
        });
    });
}
function getPathways(reactomeEntities) {
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        Promise.map(reactomeEntities, function (reactomeEntity) {
            //@ts-ignore
            return axios.get("https://reactome.org/ContentService/data/pathways/low/entity/" + reactomeEntity.stId + "/allForms")
                .then(function (results) {
                if (results && lodash_1.has(results, 'data')) {
                    return results.data;
                }
                else {
                    return null;
                }
            })
                .catch(function (error) {
                // console.log(error);
                // return error;
                return null;
            });
        })
            .then(function (pathways) {
            // resolve(pathways);
            pathways = lodash_1.compact(pathways);
            pathways = lodash_1.flatten(pathways);
            pathways = lodash_1.uniqWith(pathways, lodash_1.isEqual);
            resolve(pathways);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
var ReactomeEntity = /** @class */ (function () {
    function ReactomeEntity(data) {
        Object.assign(this, data);
    }
    return ReactomeEntity;
}());
exports.ReactomeEntity = ReactomeEntity;
var ReactomePathway = /** @class */ (function () {
    function ReactomePathway(data) {
        Object.assign(this, data);
    }
    return ReactomePathway;
}());
exports.ReactomePathway = ReactomePathway;
//# sourceMappingURL=reactomeScratch.js.map