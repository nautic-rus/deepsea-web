import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipeEspGenerationWaitComponent } from './pipe-esp-generation-wait.component';

describe('PipeEspGenerationWaitComponent', () => {
  let component: PipeEspGenerationWaitComponent;
  let fixture: ComponentFixture<PipeEspGenerationWaitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipeEspGenerationWaitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipeEspGenerationWaitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
