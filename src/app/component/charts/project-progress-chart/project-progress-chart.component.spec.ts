import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectProgressChartComponent } from './project-progress-chart.component';

describe('ProjectProgressChartComponent', () => {
  let component: ProjectProgressChartComponent;
  let fixture: ComponentFixture<ProjectProgressChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectProgressChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectProgressChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
