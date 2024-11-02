import { Component } from '@angular/core';
import { FfmpegService } from './services/ffmpeg.service';

@Component({
  selector: 'app-root',
  template: `
    <app-video-input (fileSelected)="onFileSelected($event)"></app-video-input>
    <app-video-timeline
      *ngIf="selectedFile"
      [videoFile]="selectedFile"
      (startAndEndTime)="onTimeUpdate($event)"
    ></app-video-timeline>
    
    <button (click)="trimVideo()" [disabled]="!canTrim">Trim Video</button>
    <app-video-output *ngIf="trimmedVideoUrl" [videoUrl]="trimmedVideoUrl"></app-video-output>
  `
})
export class AppComponent {
  selectedFile!: File;
  videoUrl: string | undefined;
  trimmedVideoUrl: any | undefined;
  startTime: number = 0;
  endTime: number = 0;
  canTrim = false;

  constructor(private ffmpegService: FfmpegService) {}

  onFileSelected(file: File) {
    this.selectedFile = file;
    this.videoUrl = URL.createObjectURL(file);
    this.canTrim = true; // Enable trim button after file is selected
  }

  onTimeUpdate({ startTime, endTime }: { startTime: number; endTime: number }) {
    this.startTime = startTime;
    this.endTime = endTime;
  }

  async trimVideo() {
    if (this.selectedFile && this.endTime > this.startTime) {
      this.canTrim = false; // Disable trim button during processing
      this.trimmedVideoUrl = await this.ffmpegService.trimVideo(this.selectedFile, this.startTime, this.endTime);
      this.canTrim = true; // Re-enable trim button after processing
    }
  }
}
