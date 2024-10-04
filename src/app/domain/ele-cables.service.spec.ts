import { TestBed } from '@angular/core/testing';

import { EleCablesService } from './ele-cables.service';

describe('EleCablesService', () => {
  let service: EleCablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EleCablesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
