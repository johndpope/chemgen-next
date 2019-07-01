import { GridBaseModule } from './grid-base.module';

describe('GridBaseModule', () => {
  let gridBaseModule: GridBaseModule;

  beforeEach(() => {
    gridBaseModule = new GridBaseModule();
  });

  it('should create an instance', () => {
    expect(gridBaseModule).toBeTruthy();
  });
});
