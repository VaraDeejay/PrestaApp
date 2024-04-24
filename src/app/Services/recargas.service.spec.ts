import { TestBed } from '@angular/core/testing';

import { RecargasService } from './recargas.service';

describe('RecargasService', () => {
  let service: RecargasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecargasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
