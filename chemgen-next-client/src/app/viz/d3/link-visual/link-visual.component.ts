import { Component, OnInit, Input } from '@angular/core';
import {Link} from "../link/link.component";

@Component({
    selector: '[linkVisual]',
    //@ts-ignore
    template: `
    <svg:line
        class="link"
        [attr.x1]="link.source.x"
        [attr.y1]="link.source.y"
        [attr.x2]="link.target.x"
        [attr.y2]="link.target.y"
    ></svg:line>
  `,
    styleUrls: ['./link-visual.component.css']
})
export class LinkVisualComponent  {
    @Input('linkVisual') link: Link;
}
