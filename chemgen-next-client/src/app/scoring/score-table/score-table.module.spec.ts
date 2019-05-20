import { ScoreTableModule } from './score-table.module';

describe('ScoreTableModule', () => {
  let scoreTableModule: ScoreTableModule;

  beforeEach(() => {
    scoreTableModule = new ScoreTableModule();
  });

  it('should create an instance', () => {
    expect(scoreTableModule).toBeTruthy();
  });
});
