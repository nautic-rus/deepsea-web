import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjViewPublicDeviceComponent } from './obj-view-public-device.component';

describe('ObjViewPublicDeviceComponent', () => {
  let component: ObjViewPublicDeviceComponent;
  let fixture: ComponentFixture<ObjViewPublicDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjViewPublicDeviceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjViewPublicDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
