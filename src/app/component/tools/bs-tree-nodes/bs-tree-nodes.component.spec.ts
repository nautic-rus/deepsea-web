import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BsTreeNodesComponent } from './bs-tree-nodes.component';

describe('BsTreeNodesComponent', () => {
  let component: BsTreeNodesComponent;
  let fixture: ComponentFixture<BsTreeNodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BsTreeNodesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BsTreeNodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
