import { TestBed } from '@angular/core/testing';

import { HttpUrlsService } from './http-urls.service';

describe('HttpUrlsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HttpUrlsService = TestBed.get(HttpUrlsService);
    expect(service).toBeTruthy();
  });
});
