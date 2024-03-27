import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecMaterialsComponent } from './spec-materials.component';

describe('SpecMaterialsComponent', () => {
  let component: SpecMaterialsComponent;
  let fixture: ComponentFixture<SpecMaterialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecMaterialsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
