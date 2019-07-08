import { TestBed } from '@angular/core/testing';

import { LoadPdfService } from './load-pdf.service';

describe('LoadPdfService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoadPdfService = TestBed.get(LoadPdfService);
    expect(service).toBeTruthy();
  });
});
