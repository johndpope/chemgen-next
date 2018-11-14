import { Component, OnInit } from '@angular/core';

import {Node} from "../node/node.component";
import * as d3 from 'd3';

export class Link implements d3.SimulationLinkDatum<Node> {
    // optional - defining optional implementation properties - required for relevant typing assistance
    index?: number;

    // must - defining enforced implementation properties
    source: Node | string | number;
    target: Node | string | number;

    constructor(source: any, target: any) {
        this.source = source;
        this.target = target;
    }
}
