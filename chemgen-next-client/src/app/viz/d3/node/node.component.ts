import * as d3 from 'd3';
import {get} from 'lodash';

export class Node implements d3.SimulationNodeDatum {
    index?: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;

    id: string;
    linkCount: number = 0;
    type: string;
    data: { displayName, type, color } = {displayName: '', color: null, type: null};

    constructor(id, data) {
        this.id = id;
        this.data = data;
    }

    normal = () => {
        return Math.sqrt(this.linkCount / 50);
    };

    get r() {
        return 50 * this.normal() + 10;
    }

    get fontSize() {
        return (30 * this.normal() + 10) + 'px';
    }

    get color() {
        return get(this.data, 'color') || 'white';
    }

    get displayName(){
        return get(this.data, 'displayName') || this.id;
    }

    onClick() {
        console.log('clicked this');
    }
}
