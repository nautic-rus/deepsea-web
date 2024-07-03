import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoclistNewComponent } from './doclist-new.component';

describe('DoclistNewComponent', () => {
  let component: DoclistNewComponent;
  let fixture: ComponentFixture<DoclistNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoclistNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoclistNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
