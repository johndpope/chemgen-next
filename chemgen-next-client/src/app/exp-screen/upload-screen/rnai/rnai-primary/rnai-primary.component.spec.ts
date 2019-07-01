import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {Component, Input} from "@angular/core";
import {RnaiPrimaryComponent} from './rnai-primary.component';
import {FormsModule} from "@angular/forms";
import {DndModule} from "ng2-dnd";
import {SDKBrowserModule} from "../../../../../../../chemgen-next-server/common/types/custom/types/sdk";
import {MockExpScreenInfoComponent, MockPlateImagingDatesComponent} from "../../../../../../test/MockComponents";

describe('RnaiPrimaryComponent', () => {
    let component: RnaiPrimaryComponent;
    let fixture: ComponentFixture<RnaiPrimaryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, DndModule.forRoot(), SDKBrowserModule.forRoot()],
            declarations: [RnaiPrimaryComponent, MockExpScreenInfoComponent, MockPlateImagingDatesComponent],
            // providers: [DragDropSortableService, DragDropService, DragDropConfig, ReagentLibraryApi, ExpScreenUploadWorkflowApi, ExpScreenApi,
            //     HttpClient, HttpHandler, ErrorHandler, SocketConnection, SocketDriver, SDKModels, LoopBackAuth, InternalStorage]
            // providers: [DragDropSortableService, DragDropService, DragDropConfig, ReagentLibraryApi, ExpScreenUploadWorkflowApi, ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RnaiPrimaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
