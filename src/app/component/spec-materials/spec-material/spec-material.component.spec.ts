import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecMaterialComponent } from './spec-material.component';

describe('SpecMaterialComponent', () => {
  let component: SpecMaterialComponent;
  let fixture: ComponentFixture<SpecMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecMaterialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
