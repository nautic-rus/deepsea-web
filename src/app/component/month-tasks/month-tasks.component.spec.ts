import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthTasksComponent } from './month-tasks.component';

describe('MonthTasksComponent', () => {
  let component: MonthTasksComponent;
  let fixture: ComponentFixture<MonthTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthTasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
