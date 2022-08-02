import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjViewComponent } from './obj-view.component';

describe('ObjViewComponent', () => {
  let component: ObjViewComponent;
  let fixture: ComponentFixture<ObjViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
