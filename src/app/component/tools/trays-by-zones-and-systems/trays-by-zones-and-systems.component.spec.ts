import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraysByZonesAndSystemsComponent } from './trays-by-zones-and-systems.component';

describe('TraysByZonesAndSystemsComponent', () => {
  let component: TraysByZonesAndSystemsComponent;
  let fixture: ComponentFixture<TraysByZonesAndSystemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TraysByZonesAndSystemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TraysByZonesAndSystemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
