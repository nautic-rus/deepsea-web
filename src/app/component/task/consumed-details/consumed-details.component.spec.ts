import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumedDetailsComponent } from './consumed-details.component';

describe('ConsumedDetailsComponent', () => {
  let component: ConsumedDetailsComponent;
  let fixture: ComponentFixture<ConsumedDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumedDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumedDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
