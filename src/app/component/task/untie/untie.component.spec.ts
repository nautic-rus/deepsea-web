import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UntieComponent } from './untie.component';

describe('UntieComponent', () => {
  let component: UntieComponent;
  let fixture: ComponentFixture<UntieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UntieComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UntieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
