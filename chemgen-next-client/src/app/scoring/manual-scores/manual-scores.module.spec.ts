import { ManualScoresModule } from './manual-scores.module';

describe('ManualScoresModule', () => {
  let manualScoresModule: ManualScoresModule;

  beforeEach(() => {
    manualScoresModule = new ManualScoresModule();
  });

  it('should create an instance', () => {
    expect(manualScoresModule).toBeTruthy();
  });
});
