import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralEspComponent } from './general-esp.component';

describe('GeneralEspComponent', () => {
  let component: GeneralEspComponent;
  let fixture: ComponentFixture<GeneralEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralEspComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
