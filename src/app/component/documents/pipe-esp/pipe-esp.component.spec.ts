import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipeEspComponent } from './pipe-esp.component';

describe('PipeEspComponent', () => {
  let component: PipeEspComponent;
  let fixture: ComponentFixture<PipeEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipeEspComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipeEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
