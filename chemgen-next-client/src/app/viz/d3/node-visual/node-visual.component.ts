import {Component, OnInit, Input} from '@angular/core';
import {Node} from "../node/node.component";

@Component({
    selector: '[nodeVisual]',
    template: `
        <svg:g [attr.transform]="'translate(' + node.x + ',' + node.y + ')'">
            <svg:circle
                    (click)="onClick()"
                    class="node"
                    [attr.fill]="node.color"
                    cx="0"
                    cy="0"
                    [attr.r]="10">
            </svg:circle>
            <svg:text
                    class="node-name"
                    [attr.font-size]="node.fontSize">
                {{node.displayName}}
            </svg:text>
        </svg:g>
    `,
    styleUrls: ['./node-visual.component.css']
})
export class NodeVisualComponent implements OnInit {
    @Input('nodeVisual') node: Node;

    constructor() {
    }

    ngOnInit() {
    }

    onClick(){
        console.log('clicked this!');
    }
}
