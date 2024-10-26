import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FfmpegService } from '../services/ffmpeg.service';

@Component({
  selector: 'app-video-timeline',
  templateUrl: './video-timeline.component.html',
  styleUrls: ['./video-timeline.component.scss'],
})
export class VideoTimelineComponent implements OnInit {
  @Input() videoFile!: File;
  @Output() startAndEndTime = new EventEmitter<{ startTime: number; endTime: number }>();

  frames: SafeUrl[] = [];
  startTime: number = 0;
  endTime: number = 0;

  private videoDuration: number = 1;
  private isDragging: 'start' | 'end' | null = null;

  constructor(private ffmpegService: FfmpegService, private sanitizer: DomSanitizer) {}

  async ngOnInit() {
    if (this.videoFile) {
      this.frames = await this.extractFrames(5);

      const video = document.createElement('video');
      video.src = URL.createObjectURL(this.videoFile);
      video.onloadedmetadata = () => {
        this.videoDuration = video.duration;
        this.endTime = this.videoDuration;
        URL.revokeObjectURL(video.src);
      };
    }
  }

  getNeedlePosition(needleType: 'start' | 'end'): number {
    const time = needleType === 'start' ? this.startTime : this.endTime;
    const visibleWidth = this.getVisibleWidth();
    return (time / this.videoDuration) * visibleWidth;
  }

  onScroll(event: Event) {
    // No update to startTime or endTime on scroll
  }

  startDrag(type: 'start' | 'end') {
    this.isDragging = type;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      const timelineRect = (event.target as HTMLElement).closest('.timeline-container')?.getBoundingClientRect();
      if (timelineRect) {
        const mouseX = event.clientX - timelineRect.left;
        const visibleWidth = this.getVisibleWidth();
        const durationPerPixel = this.videoDuration / visibleWidth;

        // Calculate the new time based on the mouse position and scroll
        const newTime = (mouseX / visibleWidth) * this.videoDuration;

        // Update the respective time based on the needle being dragged
        if (this.isDragging === 'start' && newTime >= 0 && newTime <= this.endTime) {
          this.startTime = newTime;
        } else if (this.isDragging === 'end' && newTime >= this.startTime && newTime <= this.videoDuration) {
          this.endTime = newTime;
        }

        this.emitTimes();
      }
    }
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.isDragging = null;
  }

  emitTimes() {
    this.startAndEndTime.emit({ startTime: this.startTime, endTime: this.endTime });
  }

  async extractFrames(intervalInSeconds: number = 5): Promise<SafeUrl[]> {
    const frameUrls = await this.ffmpegService.extractFrames(this.videoFile, intervalInSeconds);
    return frameUrls.map(url => this.sanitizer.bypassSecurityTrustUrl(url));
  }

  private getVisibleWidth(): number {
    const container = document.querySelector('.frames-container') as HTMLElement;
    return container ? container.offsetWidth : 0;
  }

  trimVideo() {
    this.startAndEndTime.emit({ startTime: this.startTime, endTime: this.endTime });
  }
}
