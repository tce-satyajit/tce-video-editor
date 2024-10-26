import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-output',
  template: `
    <div *ngIf="safeVideoUrl">
      <video controls [src]="safeVideoUrl" width="400"></video>
    </div>
  `
})
export class VideoOutputComponent implements OnChanges {
  @Input() videoUrl: string | undefined;
  safeVideoUrl: SafeUrl | undefined;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    // Sanitize the video URL if it exists
    if (this.videoUrl) {
      this.safeVideoUrl = this.sanitizer.bypassSecurityTrustUrl(this.videoUrl);
    }
  }
}
