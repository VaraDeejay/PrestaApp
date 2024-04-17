import { TestBed } from '@angular/core/testing';

import { EnvioDineroService } from './envio-dinero.service';

describe('EnvioDineroService', () => {
  let service: EnvioDineroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvioDineroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
