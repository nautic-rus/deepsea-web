import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HullEspComponent } from './hull-esp.component';

describe('HullEspComponent', () => {
  let component: HullEspComponent;
  let fixture: ComponentFixture<HullEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HullEspComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HullEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
