import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoTimelineComponent } from './video-timeline.component';

describe('VideoTimelineComponent', () => {
  let component: VideoTimelineComponent;
  let fixture: ComponentFixture<VideoTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoTimelineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
