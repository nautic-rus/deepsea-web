import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteDailyTaskComponent } from './delete-daily-task.component';

describe('DeleteDailyTaskComponent', () => {
  let component: DeleteDailyTaskComponent;
  let fixture: ComponentFixture<DeleteDailyTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteDailyTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteDailyTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
