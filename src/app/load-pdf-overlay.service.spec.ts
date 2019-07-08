import { TestBed } from '@angular/core/testing';

import { LoadPdfOverlayService } from './load-pdf-overlay.service';

describe('LoadPdfOverlayService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoadPdfOverlayService = TestBed.get(LoadPdfOverlayService);
    expect(service).toBeTruthy();
  });
});
