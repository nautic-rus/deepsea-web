import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingShowComponent } from './drawing-show.component';

describe('DrawingShowComponent', () => {
  let component: DrawingShowComponent;
  let fixture: ComponentFixture<DrawingShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrawingShowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
