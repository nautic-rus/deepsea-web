import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceEspGenerationWaitComponent } from './device-esp-generation-wait.component';

describe('DeviceEspGenerationWaitComponent', () => {
  let component: DeviceEspGenerationWaitComponent;
  let fixture: ComponentFixture<DeviceEspGenerationWaitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeviceEspGenerationWaitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceEspGenerationWaitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
