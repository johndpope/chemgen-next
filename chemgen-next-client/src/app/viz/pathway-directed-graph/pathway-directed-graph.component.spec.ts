import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PathwayDirectedGraphComponent } from './pathway-directed-graph.component';

describe('PathwayDirectedGraphComponent', () => {
  let component: PathwayDirectedGraphComponent;
  let fixture: ComponentFixture<PathwayDirectedGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PathwayDirectedGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PathwayDirectedGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
