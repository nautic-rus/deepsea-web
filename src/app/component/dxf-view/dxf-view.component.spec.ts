import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DxfViewComponent } from './dxf-view.component';

describe('DxfViewComponent', () => {
  let component: DxfViewComponent;
  let fixture: ComponentFixture<DxfViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DxfViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DxfViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
