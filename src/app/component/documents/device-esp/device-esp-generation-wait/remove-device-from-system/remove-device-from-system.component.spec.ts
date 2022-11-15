import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveDeviceFromSystemComponent } from './remove-device-from-system.component';

describe('RemoveDeviceFromSystemComponent', () => {
  let component: RemoveDeviceFromSystemComponent;
  let fixture: ComponentFixture<RemoveDeviceFromSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoveDeviceFromSystemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveDeviceFromSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
