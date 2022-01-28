import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearFilesComponent } from './clear-files.component';

describe('ClearFilesComponent', () => {
  let component: ClearFilesComponent;
  let fixture: ComponentFixture<ClearFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClearFilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClearFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
