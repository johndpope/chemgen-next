import {Component, OnInit, EventEmitter, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import {ExpSetApi, ReactomeGraphApi} from "../../../types/sdk/services/custom";
import * as d3 from 'd3';
import {
    ExpAssay2reagentResultSet,
    ReactomeGraphResultSet,
    RnaiLibraryResultSet,
    RnaiWormbaseXrefsResultSet
} from "../../../types/sdk/models";
import {Node} from "../d3/node/node.component";
import {Link} from "../d3/link/link.component";
import {D3Service} from "../d3/d3.service";
import {ForceDirectedGraphModule} from "../d3/force-directed-graph/force-directed-graph.module";
import {uniqWith, get, find, compact, has, filter, isEqual} from 'lodash';
import {ExpSetSearchResults} from "../../../types/custom/ExpSetTypes";
import {NgxSpinnerService} from "ngx-spinner";
import {ReactomeEnityResultSet} from "../../../../../chemgen-next-server/common/types/sdk/models/ReactomeEnityResultSet";

@Component({
    // selector: 'app-pathway-directed-graph',
    templateUrl: './pathway-directed-graph.component.html',
    styleUrls: ['./pathway-directed-graph.component.css']
})
export class PathwayDirectedGraphComponent implements OnInit, AfterViewInit {

    public expSetScores: any;
    public reactomeGraph = new ReactomeGraphResultSet({
        "id": "5be14db44c8e8ad53ea03b59",
        "entityName": "UniProt:P91128",
        "nodes": [{
            "type": "Pathway",
            "id": "9721184",
            "dbId": "9721184",
            "displayName": "Cap-dependent Translation Initiation"
        }, {
            "type": "Pathway",
            "id": "9721770",
            "dbId": "9721770",
            "displayName": "Nonsense-Mediated Decay (NMD)"
        }, {"type": "Pathway", "id": "9721186", "dbId": "9721186", "displayName": "Translation"}, {
            "type": "Pathway",
            "id": "9721185",
            "dbId": "9721185",
            "displayName": "Eukaryotic Translation Initiation"
        }, {
            "dbId": 9721192,
            "displayName": "Formation of a pool of free 40S subunits",
            "stId": "R-CEL-72689",
            "stIdVersion": "R-CEL-72689.1",
            "isInDisease": false,
            "isInferred": true,
            "name": ["Formation of a pool of free 40S subunits"],
            "releaseDate": "2018-09-12",
            "speciesName": "Caenorhabditis elegans",
            "hasDiagram": false,
            "schemaClass": "Pathway",
            "className": "Pathway",
            "id": "9721192",
            "type": "Pathway"
        }, {
            "dbId": 9721191,
            "displayName": "GTP hydrolysis and joining of the 60S ribosomal subunit",
            "stId": "R-CEL-72706",
            "stIdVersion": "R-CEL-72706.1",
            "isInDisease": false,
            "isInferred": true,
            "name": ["GTP hydrolysis and joining of the 60S ribosomal subunit"],
            "releaseDate": "2018-09-12",
            "speciesName": "Caenorhabditis elegans",
            "hasDiagram": false,
            "schemaClass": "Pathway",
            "className": "Pathway",
            "id": "9721191",
            "type": "Pathway"
        }, {
            "dbId": 9721769,
            "displayName": "Nonsense Mediated Decay (NMD) independent of the Exon Junction Complex (EJC)",
            "stId": "R-CEL-975956",
            "stIdVersion": "R-CEL-975956.1",
            "isInDisease": false,
            "isInferred": true,
            "name": ["Nonsense Mediated Decay (NMD) independent of the Exon Junction Complex (EJC)"],
            "releaseDate": "2018-09-12",
            "speciesName": "Caenorhabditis elegans",
            "hasDiagram": false,
            "schemaClass": "Pathway",
            "className": "Pathway",
            "id": "9721769",
            "type": "Pathway"
        }, {
            "dbId": 9721771,
            "displayName": "Nonsense Mediated Decay (NMD) enhanced by the Exon Junction Complex (EJC)",
            "stId": "R-CEL-975957",
            "stIdVersion": "R-CEL-975957.1",
            "isInDisease": false,
            "isInferred": true,
            "name": ["Nonsense Mediated Decay (NMD) enhanced by the Exon Junction Complex (EJC)"],
            "releaseDate": "2018-09-12",
            "speciesName": "Caenorhabditis elegans",
            "hasDiagram": false,
            "schemaClass": "Pathway",
            "className": "Pathway",
            "id": "9721771",
            "type": "Pathway"
        }, {
            "dbId": 9721865,
            "displayName": "SRP-dependent cotranslational protein targeting to membrane",
            "stId": "R-CEL-1799339",
            "stIdVersion": "R-CEL-1799339.1",
            "isInDisease": false,
            "isInferred": true,
            "name": ["SRP-dependent cotranslational protein targeting to membrane"],
            "releaseDate": "2018-09-12",
            "speciesName": "Caenorhabditis elegans",
            "hasDiagram": true,
            "schemaClass": "Pathway",
            "className": "Pathway",
            "id": "9721865",
            "type": "Pathway"
        }, {
            "dbId": 9721359,
            "displayName": "L13a-mediated translational silencing of Ceruloplasmin expression",
            "stId": "R-CEL-156827",
            "stIdVersion": "R-CEL-156827.1",
            "isInDisease": false,
            "isInferred": true,
            "name": ["L13a-mediated translational silencing of Ceruloplasmin expression"],
            "releaseDate": "2018-09-12",
            "speciesName": "Caenorhabditis elegans",
            "hasDiagram": false,
            "schemaClass": "Pathway",
            "className": "Pathway",
            "id": "9721359",
            "type": "Pathway"
        }, {
            "dbId": "9682540",
            "stId": "R-CEL-72410",
            "name": "RPL13",
            "exactType": "ReferenceGeneProduct",
            "species": ["Caenorhabditis elegans"],
            "referenceIdentifier": "<span class=\"highlighting\" >UniProt:P91128</span>",
            "compartmentNames": ["cytosol"],
            "compartmentAccession": ["0005829"],
            "isDisease": false,
            "databaseName": "UniProt",
            "referenceURL": "http://www.uniprot.org/entry/P91128",
            "entityId": "R-CEL-72410",
            "wormbaseId": "UniProt:P91128",
            "id": "UniProt:P91128",
            "type": "Gene"
        }],
        "links": [{
            "source": "9721184",
            "target": "9721185",
            "childPathwayDisplayName": "Cap-dependent Translation Initiation",
            "parentPathwayDisplayName": "Eukaryotic Translation Initiation",
            "type": "Pathway"
        }, {
            "source": "9721191",
            "target": "9721184",
            "childPathwayDisplayName": "GTP hydrolysis and joining of the 60S ribosomal subunit",
            "parentPathwayDisplayName": "Cap-dependent Translation Initiation",
            "type": "Pathway"
        }, {
            "source": "9721192",
            "target": "9721184",
            "childPathwayDisplayName": "Formation of a pool of free 40S subunits",
            "parentPathwayDisplayName": "Cap-dependent Translation Initiation",
            "type": "Pathway"
        }, {
            "source": "9721769",
            "target": "9721770",
            "childPathwayDisplayName": "Nonsense Mediated Decay (NMD) independent of the Exon Junction Complex (EJC)",
            "parentPathwayDisplayName": "Nonsense-Mediated Decay (NMD)",
            "type": "Pathway"
        }, {
            "source": "9721771",
            "target": "9721770",
            "childPathwayDisplayName": "Nonsense Mediated Decay (NMD) enhanced by the Exon Junction Complex (EJC)",
            "parentPathwayDisplayName": "Nonsense-Mediated Decay (NMD)",
            "type": "Pathway"
        }, {
            "source": "9721865",
            "target": "9721186",
            "childPathwayDisplayName": "SRP-dependent cotranslational protein targeting to membrane",
            "parentPathwayDisplayName": "Translation",
            "type": "Pathway"
        }, {
            "source": "9721185",
            "target": "9721186",
            "childPathwayDisplayName": "Eukaryotic Translation Initiation",
            "parentPathwayDisplayName": "Translation",
            "type": "Pathway"
        }, {
            "source": "9721359",
            "target": "9721185",
            "childPathwayDisplayName": "L13a-mediated translational silencing of Ceruloplasmin expression",
            "parentPathwayDisplayName": "Eukaryotic Translation Initiation",
            "type": "Pathway"
        }, {"source": "UniProt:P91128", "target": "9721192"}, {
            "source": "UniProt:P91128",
            "target": "9721191"
        }, {"source": "UniProt:P91128", "target": "9721769"}, {
            "source": "UniProt:P91128",
            "target": "9721771"
        }, {"source": "UniProt:P91128", "target": "9721865"}, {"source": "UniProt:P91128", "target": "9721359"}],
        "pathways": [{
            "dbId": 9721192,
            "displayName": "Formation of a pool of free 40S subunits",
            "stId": "R-CEL-72689",
            "stIdVersion": "R-CEL-72689.1",
            "isInDisease": false,
            "isInferred": true,
            "name": ["Formation of a pool of free 40S subunits"],
            "releaseDate": "2018-09-12",
            "speciesName": "Caenorhabditis elegans",
            "hasDiagram": false,
            "schemaClass": "Pathway",
            "className": "Pathway",
            "id": "9721192",
            "type": "Pathway"
        }, {
            "dbId": 9721191,
            "displayName": "GTP hydrolysis and joining of the 60S ribosomal subunit",
            "stId": "R-CEL-72706",
            "stIdVersion": "R-CEL-72706.1",
            "isInDisease": false,
            "isInferred": true,
            "name": ["GTP hydrolysis and joining of the 60S ribosomal subunit"],
            "releaseDate": "2018-09-12",
            "speciesName": "Caenorhabditis elegans",
            "hasDiagram": false,
            "schemaClass": "Pathway",
            "className": "Pathway",
            "id": "9721191",
            "type": "Pathway"
        }, {
            "dbId": 9721769,
            "displayName": "Nonsense Mediated Decay (NMD) independent of the Exon Junction Complex (EJC)",
            "stId": "R-CEL-975956",
            "stIdVersion": "R-CEL-975956.1",
            "isInDisease": false,
            "isInferred": true,
            "name": ["Nonsense Mediated Decay (NMD) independent of the Exon Junction Complex (EJC)"],
            "releaseDate": "2018-09-12",
            "speciesName": "Caenorhabditis elegans",
            "hasDiagram": false,
            "schemaClass": "Pathway",
            "className": "Pathway",
            "id": "9721769",
            "type": "Pathway"
        }, {
            "dbId": 9721771,
            "displayName": "Nonsense Mediated Decay (NMD) enhanced by the Exon Junction Complex (EJC)",
            "stId": "R-CEL-975957",
            "stIdVersion": "R-CEL-975957.1",
            "isInDisease": false,
            "isInferred": true,
            "name": ["Nonsense Mediated Decay (NMD) enhanced by the Exon Junction Complex (EJC)"],
            "releaseDate": "2018-09-12",
            "speciesName": "Caenorhabditis elegans",
            "hasDiagram": false,
            "schemaClass": "Pathway",
            "className": "Pathway",
            "id": "9721771",
            "type": "Pathway"
        }, {
            "dbId": 9721865,
            "displayName": "SRP-dependent cotranslational protein targeting to membrane",
            "stId": "R-CEL-1799339",
            "stIdVersion": "R-CEL-1799339.1",
            "isInDisease": false,
            "isInferred": true,
            "name": ["SRP-dependent cotranslational protein targeting to membrane"],
            "releaseDate": "2018-09-12",
            "speciesName": "Caenorhabditis elegans",
            "hasDiagram": true,
            "schemaClass": "Pathway",
            "className": "Pathway",
            "id": "9721865",
            "type": "Pathway"
        }, {
            "dbId": 9721359,
            "displayName": "L13a-mediated translational silencing of Ceruloplasmin expression",
            "stId": "R-CEL-156827",
            "stIdVersion": "R-CEL-156827.1",
            "isInDisease": false,
            "isInferred": true,
            "name": ["L13a-mediated translational silencing of Ceruloplasmin expression"],
            "releaseDate": "2018-09-12",
            "speciesName": "Caenorhabditis elegans",
            "hasDiagram": false,
            "schemaClass": "Pathway",
            "className": "Pathway",
            "id": "9721359",
            "type": "Pathway"
        }],
        "entities": [{
            "dbId": "9682540",
            "stId": "R-CEL-72410",
            "name": "RPL13",
            "exactType": "ReferenceGeneProduct",
            "species": ["Caenorhabditis elegans"],
            "referenceIdentifier": "<span class=\"highlighting\" >UniProt:P91128</span>",
            "compartmentNames": ["cytosol"],
            "compartmentAccession": ["0005829"],
            "isDisease": false,
            "databaseName": "UniProt",
            "referenceURL": "http://www.uniprot.org/entry/P91128",
            "entityId": "R-CEL-72410",
            "wormbaseId": "UniProt:P91128",
            "id": "UniProt:P91128",
            "type": "Gene"
        }]
    });
    public link: any;
    public node: any;
    public simulation: any;
    public nodes: Array<any>;
    public links: Array<any>;

    public expSets: ExpSetSearchResults;
    public scoresDataFrame: Array<any>;
    graph: ForceDirectedGraphModule;
    public _options: { width, height } = {width: 800, height: 800};

    constructor(private expSetApi: ExpSetApi,
                private reactomeGraphApi: ReactomeGraphApi,
                private ref: ChangeDetectorRef,
                private d3Service: D3Service,
                private spinner: NgxSpinnerService) {
        // this.nodes = this.reactomeGraph.nodes;
        // this.links = this.reactomeGraph.links;
    }

    ngOnInit() {
        this.spinner.show();
        this.expSetApi.getTabularData({"method": "orderByExpManualScoresEmbLeth", screenSearch: [4]})
            .subscribe((results) => {
                this.expSets = results.results.expSets;
                this.nodes = this.expSets['reactomeGraph']['nodes'];
                this.links = this.expSets['reactomeGraph']['links'];
                this.scoresDataFrame = results.results.dataFrame;
                this.getReagentIdFromReactomeNode();
                this.initGraph();
                this.spinner.hide();
            }, (error) => {
                console.log(error);
            });
    }

    getReagentIdFromReactomeNode() {
        this.nodes.map((node: any) => {
            if (has(node, 'type') && isEqual(node.type, 'Gene')) {
                let id: string = node.id;
                id = id.replace('UniProt:', '');
                let rnaiXRef: RnaiWormbaseXrefsResultSet = find(this.expSets.rnaisXrefs, (rnaiXref) => {
                    return isEqual(rnaiXref.uniprotAccession, id) || isEqual(rnaiXref.wbGeneAccession, id);
                });
                let rnaiLibrary: RnaiLibraryResultSet = find(this.expSets.rnaisList, {geneName: rnaiXRef.wbGeneSequenceId});
                let expAssay2reagents: ExpAssay2reagentResultSet[] = filter(this.expSets.expAssay2reagents, {
                    reagentId: rnaiLibrary.rnaiId,
                    libraryId: rnaiLibrary.libraryId
                });
                let scores = filter(this.scoresDataFrame, {treatmentGroupId: expAssay2reagents[0].treatmentGroupId});
                node.scores = scores;
                node.displayName = `${rnaiXRef.wbGeneSequenceId} ${rnaiXRef.wbGeneCgcName}`;

                let links = filter(this.links, (link) => {
                    return isEqual(link.source, id) || isEqual(link.target, id);
                });
                scores.map((score: any) => {
                    let scoreId = `Score-${score.timestamp}-${score.treatment_group_id}-${score.manualscore_group}-${score.max_manualscore_value}`;
                    this.nodes.push({
                        id: `Score-${score.timestamp}-${score.treatment_group_id}-${score.manualscore_group}-${score.max_manualscore_value}`,
                        displayName: `${node.displayName} ${score.manualscore_group} ${score.max_manualscore_value}`,
                        type: 'Score',
                        manualscoreGroup: score.manualscore_group,
                        treatmentGroupId: score.treatment_group_id,
                        screenId: score.screen_id,
                        manualscore_value: score.max_manualscore_value,
                        color: this.getScoreColors(score.manualscore_group, score.max_manualscore_value),
                    });
                    links.map((link) => {
                        if (isEqual(link.source, id)) {
                            this.links.push({
                                source: scoreId,
                                target: link.target,
                            });
                        } else {
                            this.links.push({
                                source: link.source,
                                target: scoreId,
                            });
                        }
                    });
                });
            }
        });
        this.nodes = compact(this.nodes);
        this.links = compact(this.links);
        this.nodes = uniqWith(this.nodes, isEqual);
        this.links = uniqWith(this.links, isEqual);
    }

    getScoreColors(group: string, value: number) {
        if (isEqual(group, 'M_EMB_LETH')) {
            if (isEqual(value, 0)) {
                return '#FFC05D';
            } else if (isEqual(value, 1)) {
                return '#FFAF30';
            } else if (isEqual(value, 2)) {
                return '#ED9A25';
            } else if (isEqual(value, 3)) {
                return '#F26609';
            }
        }
        if (isEqual(group, 'WT_EMB_LETH')) {
            if (isEqual(value, 0)) {
                return '#756bb1';
            } else if (isEqual(value, 1)) {
                return '#bcbddc';
            } else if (isEqual(value, 2)) {
                return '#efedf5';
            } else if (isEqual(value, 3)) {
                return '#fff';
            }
        }
        else {
            return 'white';
        }

    }

    initGraph() {
        this.nodes = this.nodes.map((node) => {
            if (has(node, 'type') && isEqual(node.type, 'Pathway')) {
                node.color = '#1ABB9C';
            }
            else if (has(node, 'type') && isEqual(node.type, 'Reaction')) {
                node.color = '#99B3FF';
            }
            if (!get(node, 'displayName')) {
                console.log('tjhis node is wrong...');
            }
            return new Node(node.id, node);
        });
        this.graph = this.d3Service.getForceDirectedGraph(this.nodes, this.links, this.options);

        /** Binding change detection check on each tick
         * This along with an onPush change detection strategy should enforce checking only when relevant!
         * This improves scripting computation duration in a couple of tests I've made, consistently.
         * Also, it makes sense to avoid unnecessary checks when we are dealing only with simulations data binding.
         */
        this.graph.ticker.subscribe((d) => {
            this.ref.markForCheck();
        });
        // this.graph.initSimulation(this.options);
    }

    ngAfterViewInit() {
        this.graph.initSimulation(this.options);
    }

    get options() {
        return this._options = {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }
}

