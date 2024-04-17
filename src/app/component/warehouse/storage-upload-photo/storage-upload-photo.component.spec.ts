import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageUploadPhotoComponent } from './storage-upload-photo.component';

describe('StorageUploadPhotoComponent', () => {
  let component: StorageUploadPhotoComponent;
  let fixture: ComponentFixture<StorageUploadPhotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StorageUploadPhotoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageUploadPhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
