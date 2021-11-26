import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboriousnessComponent } from './laboriousness.component';

describe('LaboriousnessComponent', () => {
  let component: LaboriousnessComponent;
  let fixture: ComponentFixture<LaboriousnessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaboriousnessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaboriousnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
