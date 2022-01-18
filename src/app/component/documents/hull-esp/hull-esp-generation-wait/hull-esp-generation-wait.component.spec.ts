import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HullEspGenerationWaitComponent } from './hull-esp-generation-wait.component';

describe('HullEspGenerationWaitComponent', () => {
  let component: HullEspGenerationWaitComponent;
  let fixture: ComponentFixture<HullEspGenerationWaitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HullEspGenerationWaitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HullEspGenerationWaitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
