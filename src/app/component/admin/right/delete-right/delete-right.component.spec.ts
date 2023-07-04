import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteRightComponent } from './delete-right.component';

describe('DeleteRightComponent', () => {
  let component: DeleteRightComponent;
  let fixture: ComponentFixture<DeleteRightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteRightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
