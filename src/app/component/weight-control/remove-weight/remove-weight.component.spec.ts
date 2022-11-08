import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveWeightComponent } from './remove-weight.component';

describe('RemoveWeightComponent', () => {
  let component: RemoveWeightComponent;
  let fixture: ComponentFixture<RemoveWeightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoveWeightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveWeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
