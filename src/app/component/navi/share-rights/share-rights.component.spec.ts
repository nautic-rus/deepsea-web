import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareRightsComponent } from './share-rights.component';

describe('ShareRightsComponent', () => {
  let component: ShareRightsComponent;
  let fixture: ComponentFixture<ShareRightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareRightsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareRightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
