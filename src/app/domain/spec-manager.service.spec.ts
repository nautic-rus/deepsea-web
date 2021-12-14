import { TestBed } from '@angular/core/testing';

import { SpecManagerService } from './spec-manager.service';

describe('SpecManagerService', () => {
  let service: SpecManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpecManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
