import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGroupDeviceComponent } from './add-group-device.component';

describe('AddGroupDeviceComponent', () => {
  let component: AddGroupDeviceComponent;
  let fixture: ComponentFixture<AddGroupDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddGroupDeviceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGroupDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
