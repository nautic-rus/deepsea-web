import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceEspComponent } from './device-esp.component';

describe('DeviceEspComponent', () => {
  let component: DeviceEspComponent;
  let fixture: ComponentFixture<DeviceEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeviceEspComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
