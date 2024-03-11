import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgreeModalComponent } from './agree-modal.component';

describe('AgreeModalComponent', () => {
  let component: AgreeModalComponent;
  let fixture: ComponentFixture<AgreeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgreeModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgreeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
