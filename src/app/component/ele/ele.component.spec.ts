import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EleComponent } from './ele.component';

describe('EleComponent', () => {
  let component: EleComponent;
  let fixture: ComponentFixture<EleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
