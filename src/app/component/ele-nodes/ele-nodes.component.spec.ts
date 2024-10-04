import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EleNodesComponent } from './ele-nodes.component';

describe('EleNodesComponent', () => {
  let component: EleNodesComponent;
  let fixture: ComponentFixture<EleNodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EleNodesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EleNodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
