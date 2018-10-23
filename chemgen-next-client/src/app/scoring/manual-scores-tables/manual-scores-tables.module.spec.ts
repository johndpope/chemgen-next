import { ManualScoresTablesModule } from './manual-scores-tables.module';

describe('ManualScoresTablesModule', () => {
  let manualScoresTablesModule: ManualScoresTablesModule;

  beforeEach(() => {
    manualScoresTablesModule = new ManualScoresTablesModule();
  });

  it('should create an instance', () => {
    expect(manualScoresTablesModule).toBeTruthy();
  });
});
