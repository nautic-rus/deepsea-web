import { TestBed } from '@angular/core/testing';

import { IssueManagerService } from './issue-manager.service';

describe('IssueManagerService', () => {
  let service: IssueManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IssueManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
