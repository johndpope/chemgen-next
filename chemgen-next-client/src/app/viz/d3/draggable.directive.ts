import { Directive, Input, ElementRef } from '@angular/core';
import {D3Service} from "./d3.service";
import {Node} from "./node/node.component";
import {ForceDirectedGraphModule} from "./force-directed-graph/force-directed-graph.module";

@Directive({
  selector: '[draggableNode]'
})
export class DraggableDirective {

    @Input('draggableNode') draggableNode: Node;
    @Input('draggableInGraph') draggableInGraph: ForceDirectedGraphModule;

    constructor(private d3Service: D3Service, private _element: ElementRef) { }

    ngOnInit() {
        this.d3Service.applyDraggableBehaviour(this._element.nativeElement, this.draggableNode, this.draggableInGraph);
    }

}
