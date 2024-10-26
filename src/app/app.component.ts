import { Component } from '@angular/core';
import { FfmpegService } from './services/ffmpeg.service';

@Component({
  selector: 'app-root',
  template: `
    <app-video-input (fileSelected)="onFileSelected($event)"></app-video-input>
    <app-video-timeline *ngIf="videoDuration" [duration]="videoDuration" (timeChange)="onTimeChange($event)"></app-video-timeline>
    <button (click)="trimVideo()" [disabled]="!canTrim">Trim Video</button>
    <app-video-output *ngIf="trimmedVideoUrl" [videoUrl]="trimmedVideoUrl"></app-video-output>
  `
})
export class AppComponent {
  selectedFile!: File;
  videoDuration: number = 0;
  startTime: number = 0;
  endTime: number = 0;
  trimmedVideoUrl: string | undefined;

  constructor(private ffmpegService: FfmpegService) {}

  onFileSelected(file: File) {
    this.selectedFile = file;
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      this.videoDuration = video.duration;
      this.endTime = video.duration;
    };
  }

  onTimeChange(times: { start: number, end: number }) {
    this.startTime = times.start;
    this.endTime = times.end;
  }

  async trimVideo() {
    const trimmedBlob = await this.ffmpegService.trimVideo(this.selectedFile, this.startTime, this.endTime);
    this.trimmedVideoUrl = URL.createObjectURL(trimmedBlob);
  }

  get canTrim() {
    return this.startTime >= 0 && this.endTime > this.startTime;
  }
}
