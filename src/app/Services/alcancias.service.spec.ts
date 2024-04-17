import { TestBed } from '@angular/core/testing';

import { AlcanciasService } from './alcancias.service';

describe('AlcanciasService', () => {
  let service: AlcanciasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlcanciasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
