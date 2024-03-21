import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EleEspGenerationWaitComponent } from './ele-esp-generation-wait.component';

describe('EleEspGenerationWaitComponent', () => {
  let component: EleEspGenerationWaitComponent;
  let fixture: ComponentFixture<EleEspGenerationWaitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EleEspGenerationWaitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EleEspGenerationWaitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
