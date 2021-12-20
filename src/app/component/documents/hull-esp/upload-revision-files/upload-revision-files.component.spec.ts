import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadRevisionFilesComponent } from './upload-revision-files.component';

describe('UploadRevisionFilesComponent', () => {
  let component: UploadRevisionFilesComponent;
  let fixture: ComponentFixture<UploadRevisionFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadRevisionFilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadRevisionFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
