import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignEspComponent } from './design-esp.component';

describe('DesignEspComponent', () => {
  let component: DesignEspComponent;
  let fixture: ComponentFixture<DesignEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesignEspComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
