import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GCodeComponent } from './g-code.component';

describe('GCodeComponent', () => {
  let component: GCodeComponent;
  let fixture: ComponentFixture<GCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GCodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
