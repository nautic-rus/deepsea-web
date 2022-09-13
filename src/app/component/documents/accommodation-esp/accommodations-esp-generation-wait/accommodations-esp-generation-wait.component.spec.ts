import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationsEspGenerationWaitComponent } from './accommodations-esp-generation-wait.component';

describe('AccommodationsEspGenerationWaitComponent', () => {
  let component: AccommodationsEspGenerationWaitComponent;
  let fixture: ComponentFixture<AccommodationsEspGenerationWaitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccommodationsEspGenerationWaitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccommodationsEspGenerationWaitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
