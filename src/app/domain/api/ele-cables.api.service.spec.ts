import { TestBed } from '@angular/core/testing';

import { EleCables.ApiService } from './ele-cables.api.service';

describe('EleCables.ApiService', () => {
  let service: EleCables.ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EleCables.ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
