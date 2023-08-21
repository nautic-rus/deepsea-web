import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskAddPlanComponent } from './task-add-plan.component';

describe('TaskAddPlanComponent', () => {
  let component: TaskAddPlanComponent;
  let fixture: ComponentFixture<TaskAddPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskAddPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskAddPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
