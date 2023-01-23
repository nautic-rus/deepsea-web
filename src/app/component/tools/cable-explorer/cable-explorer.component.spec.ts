import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CableExplorerComponent } from './cable-explorer.component';

describe('CableExplorerComponent', () => {
  let component: CableExplorerComponent;
  let fixture: ComponentFixture<CableExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CableExplorerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CableExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
