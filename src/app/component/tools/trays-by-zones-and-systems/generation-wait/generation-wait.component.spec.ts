import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationWaitComponent } from './generation-wait.component';

describe('GenerationWaitComponent', () => {
  let component: GenerationWaitComponent;
  let fixture: ComponentFixture<GenerationWaitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerationWaitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerationWaitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
