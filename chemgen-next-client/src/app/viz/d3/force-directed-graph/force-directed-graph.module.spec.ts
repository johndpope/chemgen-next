import { ForceDirectedGraphModule } from './force-directed-graph.module';

describe('ForceDirectedGraphModule', () => {
  let forceDirectedGraphModule: ForceDirectedGraphModule;

  beforeEach(() => {
    forceDirectedGraphModule = new ForceDirectedGraphModule();
  });

  it('should create an instance', () => {
    expect(forceDirectedGraphModule).toBeTruthy();
  });
});
