import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActControlComponent } from './act-control.component';

describe('ActControlComponent', () => {
  let component: ActControlComponent;
  let fixture: ComponentFixture<ActControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
