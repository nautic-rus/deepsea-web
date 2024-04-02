import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjViewUrlCreateDeviceComponent } from './obj-view-url-create-device.component';

describe('ObjViewUrlCreateDeviceComponent', () => {
  let component: ObjViewUrlCreateDeviceComponent;
  let fixture: ComponentFixture<ObjViewUrlCreateDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjViewUrlCreateDeviceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjViewUrlCreateDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
