import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentVideoComponent } from './content-video.component';

describe('ContentVideoComponent', () => {
  let component: ContentVideoComponent;
  let fixture: ComponentFixture<ContentVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
