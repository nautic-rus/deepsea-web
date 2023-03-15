import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrayEspGenerationWaitComponent } from './tray-esp-generation-wait.component';

describe('TrayEspGenerationWaitComponent', () => {
  let component: TrayEspGenerationWaitComponent;
  let fixture: ComponentFixture<TrayEspGenerationWaitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrayEspGenerationWaitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrayEspGenerationWaitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
