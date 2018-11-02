import { ContactSheetModule } from './contact-sheet.module';

describe('ContactSheetModule', () => {
  let contactSheetModule: ContactSheetModule;

  beforeEach(() => {
    contactSheetModule = new ContactSheetModule();
  });

  it('should create an instance', () => {
    expect(contactSheetModule).toBeTruthy();
  });
});
