import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplectManagerComponent } from './complect-manager.component';

describe('ComplectManagerComponent', () => {
  let component: ComplectManagerComponent;
  let fixture: ComponentFixture<ComplectManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplectManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplectManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
