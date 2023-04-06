import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateEspComponent } from './generate-esp.component';

describe('GenerateEspComponent', () => {
  let component: GenerateEspComponent;
  let fixture: ComponentFixture<GenerateEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateEspComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
