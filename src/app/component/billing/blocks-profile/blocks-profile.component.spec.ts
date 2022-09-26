import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocksProfileComponent } from './blocks-profile.component';

describe('BlocksProfileComponent', () => {
  let component: BlocksProfileComponent;
  let fixture: ComponentFixture<BlocksProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlocksProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlocksProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
