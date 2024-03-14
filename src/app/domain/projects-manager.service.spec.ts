import { TestBed } from '@angular/core/testing';

import { ProjectsManagerService } from './projects-manager.service';

describe('ProjectsManagerService', () => {
  let service: ProjectsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
