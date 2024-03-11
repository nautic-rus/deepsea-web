import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEquipmentFilesComponent } from './add-equipment-files.component';

describe('AddFilesComponent', () => {
  let component: AddEquipmentFilesComponent;
  let fixture: ComponentFixture<AddEquipmentFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEquipmentFilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEquipmentFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
