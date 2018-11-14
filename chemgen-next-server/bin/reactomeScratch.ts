#!/usr/bin/env node
import axios = require('axios');
import {
  includes,
  find,
  range,
  shuffle,
  filter,
  has,
  compact,
  toLower,
  flatten,
  uniqBy,
  isObject,
  isArray,
  uniqWith,
  isEqual
} from 'lodash';
import Promise = require('bluebird');
import convert = require('xml-js');
import fs = require('fs');
import path = require('path');
import app = require('../server/server');
import {RnaiWormbaseXrefsResultSet} from "../common/types/sdk/models";
import {ExpSetSearchResults} from "../common/types/custom/ExpSetTypes";
import * as graphlib from 'graphlib';

// https://reactome.org/ContentService/search/query?query=wbgene00000527&cluster=true
//@ts-ignore
let cElegansPathwaysXml: string = fs.readFileSync(path.join(__dirname, 'c_elegans_pathway.xml'));
let cElegansPathways = JSON.parse(convert.xml2json(cElegansPathwaysXml, {compact: true, spaces: 4}));
let nodes = [];
let links = [];
let gene = 'wbgene00000527';
let g = new graphlib.Graph();

parsePathways()
  // .then(() => {
  //   return getScoredXrefs();
  // })
  .then(() => {
    return getAllXRefs();
  })
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

function getSingleGene() {
  let gene = `UniProt:P91128`;

  return new Promise((resolve, reject) => {

    getGene(gene)
      .then((results: any) => {
        return createReactomeData(gene, results);
      })
      .then((results: any) => {
        return createDirectedGraphPerEntity(results);
      })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(Error(error));
      });
  });

}

function getScoredXrefs() {
  return new Promise((resolve, reject) => {
    app.models.ExpSet.extract.workflows.orderByExpManualScoresEmbLeth()
      .then((results: any) => {
        //@ts-ignore
        return Promise.map(results.expSets.rnaisXrefs, (gene: RnaiWormbaseXrefsResultSet) => {
          app.winston.info(`Getting gene ${gene.wbGeneAccession}`);
          app.winston.info(`UniProt: ${gene.uniprotAccession}`);
          return getGene(`UniProt:${gene.uniprotAccession}`)
            .then((results: any) => {
              return createReactomeData(gene, results);
            })
            .then((results: any) => {
              return createDirectedGraphPerEntity(results);
            })
            .then(() => {
              return getGene(gene.wbGeneAccession)
                .then((results: any) => {
                  return createReactomeData(gene, results);
                })
                .then((results: any) => {
                  return createDirectedGraphPerEntity(results);
                })
                .catch((error) => {
                  return new Error(error);
                });
            })
            .catch((error) => {
              return new Error(error);
            });
        })
          .then(() => {
            return;
          })
          .catch((error) => {
            return new Error(error);
          });
      })
      .then(() => {
        resolve();
      })
      .catch((error) => {
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
  return new Promise((resolve, reject) => {
    app.paginateModel('RnaiWormbaseXrefs', {}, 50)
      .then((paginationResults) => {
        app.winston.info(`PaginationResults: ${JSON.stringify(paginationResults)}`);
        // return Promise.map(shuffle(range(0, paginationResults.totalPages)), (page) => {
        // return Promise.map(shuffle(range(0, 2)), (page) => {
        //@ts-ignore
        return Promise.map(range(0, paginationResults.totalPages), (page) => {
          let skip = Number(page) * Number(paginationResults.limit);
          console.log(`Page: ${page} Skip: ${skip}`);
          return app.models.RnaiWormbaseXrefs
            .find({fields: {wbGeneAccession: true}, limit: paginationResults.limit, skip: skip})
            .then((genes: RnaiWormbaseXrefsResultSet[]) => {
              //@ts-ignore
              return Promise.map(shuffle(genes), (gene: RnaiWormbaseXrefsResultSet) => {
                app.winston.info(`Finding Gene: ${gene.wbGeneAccession}`);
                return getGene(gene.wbGeneAccession)
                  .then((results: any) => {
                    return createReactomeData(gene, results);
                  })
                  .then((results: any) => {
                    return createDirectedGraphPerEntity(results);
                  })
                  .catch((error) => {
                    return new Error(error);
                  });
              }, {concurrency: 8});
            })
        }, {concurrency: 1})
          .then(() => {
            return;
          })
          .catch((error) => {
            return new Error(error);
          });
      })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function createDirectedGraphPerEntity(results) {
  return new Promise((resolve, reject) => {
    if (results.pathways.length) {
      let pathwayData = results.pathways.map((pathway: ReactomePathway) => {
        return getPathwayNeighbors(pathway.dbId);
      });
      let geneNodes = [];
      let geneLinks = [];
      pathwayData.map((data: any) => {
        data.nodes.map((node: any) => {
          geneNodes.push(node);
        });
      });
      pathwayData.map((data: any) => {
        data.links.map((link) => {
          geneLinks.push(link);
        });
      });
      geneNodes = uniqWith(geneNodes, isEqual);
      geneLinks = uniqWith(geneLinks, isEqual);

      let geneGraph = new graphlib.Graph();
      results.pathways.map((pathway: any) => {
        pathway.id = String(pathway.dbId);
        pathway.type = 'Pathway';
        geneGraph.setNode(pathway.dbId, pathway.displayName);
        geneNodes.push(pathway);
      });
      results.pathways.map((pathway: any) => {
        geneGraph.setEdge(results.gene, pathway.dbId);
        geneLinks.push({source: String(results.gene), target: String(pathway.dbId)});
      });

      results.entities.map((entity) => {
        entity.id = results.gene;
        entity.type = 'Gene';
        geneNodes.push(entity);
      });

      // geneNodes = geneNodes.filter((node) => {
      //   return find(geneLinks, (link) => {
      //     return isEqual(String(link.source), String(node.id)) || isEqual(String(link.target), String(node.id))
      //   });
      // });
      //
      geneLinks = geneLinks.filter((link) => {
        let foundSource = find(geneNodes, (node) => {
          return isEqual(String(link.source), String(node.id))
        });
        let foundTarget = find(geneNodes, (node) => {
          return isEqual(String(link.target), String(node.id))
        });
        return foundSource && foundTarget;
      });
      // geneLinks.map((geneLink) => {
      //   geneGraph.setEdge(geneLink.source, geneLink.target);
      // });
      // geneNodes.map((node) => {
      //   geneGraph.setNode(node.id, node.displayName);
      // });
      let distanceMatrix = graphlib.alg.dijkstraAll(geneGraph, function (e) {
        return geneGraph.edge(e);
      });
      app.models.ReactomeGraph
        .findOrCreate({where: {entityName: results.gene}}, {
          entityName: results.gene,
          nodes: geneNodes,
          links: geneLinks,
          pathways: results.pathways,
          entities: results.entities
        })
        .then((results) => {
          resolve();
        })
        .catch((error) => {
          reject(new Error(error));
        });
    }
    else {
      resolve();
    }
  });
}

function createReactomeData(gene, results: any) {
  return new Promise((resolve, reject) => {
    createEntities(gene, results.entities)
      .then(() => {
        return createPathways(results.pathways);
      })
      .then(() => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function parsePathways() {
  return new Promise((resolve, reject) => {
    if (has(cElegansPathways, 'Pathways') && isObject(cElegansPathways.Pathways)) {
      let rootPathway: Array<any> = cElegansPathways.Pathways.Pathway;

      rootPathway.map((pathway: ReactomePathway) => {
        return recursePathway(pathway, 0);
      });
      nodes = uniqWith(nodes, isEqual);
      links = uniqWith(links, isEqual);
      resolve();
    } else {
      throw new Error('Unknown pathway file type!');
    }
  });
}


function getPathwayNeighbors(pathwayId) {

  let connectedComponents = graphlib.alg.components(g);
  let neighbors = g.neighbors(String(pathwayId));

  let found = {};
  let neighborNodes = [];
  let neighborLinks = [];
  const getNeighbors = function (pathwayId: string) {
    if (has(found, pathwayId)) {
      return;
    } else {
      let tlinks = links.filter((link) => {
        return isEqual(String(link.source), String(pathwayId)) || isEqual(String(link.target), String(pathwayId));
      });
      let tnodes = nodes.filter((node) => {
        return isEqual(String(node.id), String(pathwayId));
      });
      tlinks.map((tlink) => {
        neighborLinks.push(tlink);
      });
      tnodes.map((node) => {
        neighborNodes.push(node);
      });
      found[pathwayId] = true;
      tlinks.map((link) => {
        getNeighbors(link.source);
        getNeighbors(link.target);
      });
    }
  };

  // let thisPathwayComponents: Array<Array<any>> = connectedComponents.filter((component: Array<any>) => {
  //   return includes(component, String(pathwayId));
  // });
  let thisPathwayComponents = [neighbors];

  thisPathwayComponents.map((component: Array<any>) => {
    component.map((dbId: string | number) => {
      let node = find(nodes, {id: String(dbId)});
      if (node) {
        neighborNodes.push(node);
      }
      let tLinks = links.filter((link) => {
        return isEqual(link.source, String(dbId)) || isEqual(link.target, String(dbId));
      });
      tLinks.map((link) => {
        neighborLinks.push(link);
      });
    });
  });

  neighborNodes = uniqWith(neighborNodes, isEqual);
  neighborLinks = uniqWith(neighborLinks, isEqual);

  return {nodes: neighborNodes, links: neighborLinks, pathwayId: pathwayId};
}

function createEntities(gene, entities: ReactomeEntity[]) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    Promise.map(entities, (entity) => {
      entity.entityId = entity.id;
      entity.wormbaseId = gene.wbGeneAccession;
      entity.uniProtId = gene.uniprotAccession;
      delete entity.id;
      return app.models.ReactomeEntity
        .findOrCreate({where: {dbId: entity.dbId}}, entity)
    })
      .then((results) => {
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
}

function createPathways(pathways: ReactomePathway[]) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    Promise.map(pathways, (pathway) => {
      pathway.pathwayId = pathway.id;
      delete pathway.id;
      return app.models.ReactomePathway
        .findOrCreate({where: {dbId: pathway.dbId}}, pathway)
    })
      .then((results) => {
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
}


function recursePathway(parentPathway: any, childPathway: any) {
  if (childPathway && isObject(childPathway) && has(childPathway, '_attributes')) {
    nodes.push({
      type: 'Pathway',
      id: childPathway._attributes.dbId,
      dbId: childPathway._attributes.dbId,
      displayName: childPathway._attributes.displayName
    });
    g.setNode(childPathway._attributes.dbId, childPathway._attributes.displayName);
  } else if (parentPathway && has(parentPathway, '_attributes')) {
    nodes.push({
      type: 'Pathway',
      dbId: parentPathway._attributes.dbId,
      id: parentPathway._attributes.dbId,
      displayName: parentPathway._attributes.displayName
    });
    g.setNode(parentPathway._attributes.dbId, parentPathway._attributes.displayName);
  }

  if (isObject(childPathway) && has(childPathway, '_attributes') && isObject(parentPathway) && has(parentPathway, '_attributes')) {
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
    if (isArray(childPathway)) {
      recursePathway(parentPathway, childPathway.pop());
    } else if (isObject(childPathway) && has(childPathway, 'Pathway')) {
      recursePathway(childPathway, childPathway.Pathway);
    } else if (isObject(childPathway) && has(childPathway, 'Reaction') && isObject(childPathway.Reaction)) {
      nodes.push({
        type: 'Reaction',
        dbId: childPathway._attributes.dbId,
        id: childPathway._attributes.dbId,
        displayName: childPathway._attributes.displayName
      });
      g.setNode(childPathway._attributes.dbId, childPathway._attributes.displayName);
      if (isObject(parentPathway) && has(parentPathway, '_attributes') && has(childPathway, ['Reaction', '_attributes'])) {
        g.setEdge(childPathway.Reaction._attributes.dbId, parentPathway._attributes.dbId);
        links.push({
          source: childPathway.Reaction._attributes.dbId,
          target: parentPathway._attributes.dbId,
          childReactionDisplayName: childPathway.Reaction._attributes.displayName,
          parentPathwayDisplayName: parentPathway._attributes.displayName,
          type: 'Reaction',
        });
      }
    } else if (isObject(childPathway) && has(childPathway, 'Reaction') && isArray(childPathway.Reaction)) {
      recursePathway(parentPathway, childPathway.Reaction.pop());
    }
  }
  if (has(parentPathway, 'Pathway') && isArray(parentPathway.Pathway) && parentPathway.Pathway.length) {
    recursePathway(parentPathway, parentPathway.Pathway.pop());
  } else if (has(parentPathway, 'Pathway') && isArray(parentPathway.Pathway) && !parentPathway.Pathway.length) {
    return;
  }
}

function getGene(gene: string) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    axios.get('https://reactome.org/ContentService/search/query', {params: {query: toLower(gene), cluster: true}})
      .then((results) => {
        let proteins: any = filter(results.data.results, {typeName: 'Protein'});
        proteins = flatten(proteins);
        let reactomeEntities: ReactomeEntity[] = [];
        proteins.map((protein) => {
          protein.entries.map((entry) => {
            reactomeEntities.push(new ReactomeEntity(entry));
          })
        });
        // nodes.push({id: gene, displayName: gene});
        // g.setNode(gene, gene);
        return getPathways(reactomeEntities)
          .then((pathways: ReactomePathway[]) => {
            // pathways.map((pathway) => {
            //   links.push({source: gene, target: String(pathway.dbId), type: "Gene In Pathway"});
            //   g.setEdge(gene, String(pathway.dbId));
            // });
            return {gene: gene, pathways: pathways, entities: reactomeEntities};
          })
          .catch((error) => {
            return new Error(error);
          });
      })
      .then((results: any) => {
        resolve(results);
      })
      .catch((error) => {
        // console.log(error);
        if (has(error, ['response', 'status']) && isEqual(error.response.status, 404)) {
          resolve({gene: gene, pathways: [], entities: []});
        } else {
          reject(new Error(error));
        }
      });

  });
}


function getPathways(reactomeEntities: ReactomeEntity[]) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    Promise.map(reactomeEntities, (reactomeEntity: ReactomeEntity) => {
      //@ts-ignore
      return axios.get(`https://reactome.org/ContentService/data/pathways/low/entity/${reactomeEntity.stId}/allForms`)
        .then((results) => {
          if (results && has(results, 'data')) {
            return results.data;
          } else {
            return null;
          }
        })
        .catch((error) => {
          // console.log(error);
          // return error;
          return null;
        })
    })
      .then((pathways) => {
        // resolve(pathways);
        pathways = compact(pathways);
        pathways = flatten(pathways);
        pathways = uniqWith(pathways, isEqual);
        resolve(pathways);
      })
      .catch((error) => {
        reject(new Error(error));
      });


  });
}

declare var Object: any;

export interface ReactomeEntityInterface {
  dbId: number;
  // stId: R-CEL-2470901,
  stId: string;
  id: string;
  // name: 5Hyl-COL18A1(?-1754);
  name: string;
  // exactType: ReferenceGeneProduct;
  exactType: string;
  // species: [
  //   Caenorhabditis elegans
  //   ],
  species: Array<string>;
  referenceIdentifier: string;
  // compartmentNames: [
  //   extracellular region
  //   ],
  compartmentNames: Array<string>;
  // compartmentAccession: [
  //   0005576
  //   ],
  compartmentAccession: Array<any>;
  isDisease: boolean;
  databaseName: string;
  referenceURL: string;
}

export class ReactomeEntity {
  dbId: number;
  // stId: R-CEL-2470901,
  stId: string;
  id: string;
  // name: 5Hyl-COL18A1(?-1754);
  name: string;
  // exactType: ReferenceGeneProduct;
  exactType: string;
  // species: [
  //   Caenorhabditis elegans
  //   ],
  species: Array<string>;
  referenceIdentifier: string;
  // compartmentNames: [
  //   extracellular region
  //   ],
  compartmentNames: Array<string>;
  // compartmentAccession: [
  //   0005576
  //   ],
  compartmentAccession: Array<any>;
  isDisease: boolean;
  databaseName: string;
  referenceURL: string;

  constructor(data?: ReactomeEntityInterface) {
    Object.assign(this, data);
  }
}

export interface ReactomePathwayInterface {
  dbId: string | number;
  displayName: string;
  stId: string;
  stIdVersion: string;
  isInDisease: false;
  isInferred: true;
  name: Array<string>;
  releaseDate: string;
  speciesName: string;
  hasDiagram: boolean;
  schemaClass: string;
  className: string;
}

export class ReactomePathway {
  dbId: string | number;
  displayName: string;
  stId: string;
  stIdVersion: string;
  isInDisease: false;
  isInferred: true;
  name: Array<string>;
  releaseDate: string;
  speciesName: string;
  hasDiagram: boolean;
  schemaClass: string;
  className: string;

  constructor(data?: ReactomePathwayInterface) {
    Object.assign(this, data);
  }
}

