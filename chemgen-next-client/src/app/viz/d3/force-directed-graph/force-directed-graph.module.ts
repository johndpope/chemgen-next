import {NgModule, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import * as d3 from 'd3';
import {Node} from "../node/node.component";
import {Link} from "../link/link.component";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: []
})
export class ForceDirectedGraphModule {

    public FORCES: any = {
        LINKS: 1 / 50,
        COLLISION: 1,
        CHARGE: -1
    };
    public ticker: EventEmitter<d3.Simulation<Node, Link>> = new EventEmitter();
    public simulation: d3.Simulation<any, any>;

    public nodes: Node[] = [];
    public links: Link[] = [];

    constructor(nodes, links, options: { width, height }) {
        this.nodes = nodes;
        this.links = links;

        this.initSimulation(options);
    }

    connectNodes(source, target) {
        let link;

        if (!this.nodes[source] || !this.nodes[target]) {
            throw new Error('One of the nodes does not exist');
        }

        link = new Link(source, target);
        this.simulation.stop();
        this.links.push(link);
        this.simulation.alphaTarget(0.3).restart();

        this.initLinks();
    }

    initNodes() {
        if (!this.simulation) {
            throw new Error('simulation was not initialized yet');
        }

        this.simulation.nodes(this.nodes);
    }

    initLinks() {
        if (!this.simulation) {
            throw new Error('simulation was not initialized yet');
        }

        this.simulation.force('links',
            d3.forceLink(this.links)
                .id(d => String(d['id']))
                .strength(0.9)
        );
    }

    initSimulation(options) {
        if (!options || !options.width || !options.height) {
            throw new Error('missing options when initializing simulation');
        }

        /** Creating the simulation */
        if (!this.simulation) {
            const ticker = this.ticker;
            // Add "forces" to the simulation here
            this.simulation = d3.forceSimulation()
                .force("center", d3.forceCenter(options.width / 2, options.height / 2))
                .force("charge", d3.forceManyBody().strength(-5))
                .force("collide", d3.forceCollide(1).strength(0.5))
                .force("link", d3.forceLink().id(function (d) {
                    //@ts-ignore
                    return String(d['id']);
                }));

            // Connecting the d3 ticker to an angular event emitter
            this.simulation.on('tick', function () {
                ticker.emit(this);
            });

            this.initNodes();
            this.initLinks();
        }

        /** Updating the central force of the simulation */
        this.simulation.force('centers', d3.forceCenter(options.width / 2, options.height / 2));

        /** Restarting the simulation internal timer */
        this.simulation.restart();
    }

}
