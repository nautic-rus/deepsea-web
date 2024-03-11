import { TestBed } from '@angular/core/testing';

import { AddFilesDataService } from './add-files-data.service';

describe('AddFilesDataService', () => {
  let service: AddFilesDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddFilesDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
