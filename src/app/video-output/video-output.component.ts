import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-output',
  templateUrl: './video-output.component.html',
  styleUrls: ['./video-output.component.scss']
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
