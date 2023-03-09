import { TestBed } from '@angular/core/testing';

import { TrayService } from './tray.service';

describe('TrayService', () => {
  let service: TrayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
