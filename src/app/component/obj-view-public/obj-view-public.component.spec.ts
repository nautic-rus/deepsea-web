import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjViewPublicComponent } from './obj-view-public.component';

describe('ObjViewPublicComponent', () => {
  let component: ObjViewPublicComponent;
  let fixture: ComponentFixture<ObjViewPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjViewPublicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjViewPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
