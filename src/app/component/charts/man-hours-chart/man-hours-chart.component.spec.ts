import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManHoursChartComponent } from './man-hours-chart.component';

describe('ManHoursChartComponent', () => {
  let component: ManHoursChartComponent;
  let fixture: ComponentFixture<ManHoursChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManHoursChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManHoursChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
