import app = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');
import {uniqWith, isEqual} from 'lodash';
import {ReactomeGraphResultSet, RnaiWormbaseXrefsResultSet} from "../../../types/sdk/models";

const ReactomeGraph = app.models['ReactomeGraph'] as (typeof WorkflowModel);

ReactomeGraph.extract.workflows.getGraphFromXrefs = function (xrefs: RnaiWormbaseXrefsResultSet[]) {
  return new Promise((resolve, reject) => {
    let search = [];
    xrefs.map((xref: RnaiWormbaseXrefsResultSet) => {
      search.push(xref.wbGeneAccession);
      search.push(`UniProt:${xref.uniprotAccession}`);
    });
    app.models.ReactomeGraph
      .find({where: {entityName: {inq: search}}})
      .then((results: ReactomeGraphResultSet[]) =>{
        let nodes = [];
        let links = [];
        results.map((result: ReactomeGraphResultSet) =>{
          result.nodes.map((node) =>{
            nodes.push(node);
          });
        });
        results.map((result: ReactomeGraphResultSet) =>{
          result.links.map((node) =>{
            links.push(node);
          });
        });
        nodes = uniqWith(nodes, isEqual);
        links = uniqWith(links, isEqual);
        resolve({links: links, nodes: nodes});
      })
      .catch((error) =>{
        reject(new Error(error));
      })
  });
};
