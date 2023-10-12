import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadAllDocsComponent } from './download-all-docs.component';

describe('DownloadAllDocsComponent', () => {
  let component: DownloadAllDocsComponent;
  let fixture: ComponentFixture<DownloadAllDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadAllDocsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadAllDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
