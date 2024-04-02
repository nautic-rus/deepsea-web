import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjViewUrlCreateComponent } from './obj-view-url-create.component';

describe('ObjViewUrlCreateComponent', () => {
  let component: ObjViewUrlCreateComponent;
  let fixture: ComponentFixture<ObjViewUrlCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjViewUrlCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjViewUrlCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
