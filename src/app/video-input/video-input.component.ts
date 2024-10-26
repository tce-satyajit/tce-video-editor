import { Component, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-input',
  templateUrl: './video-input.component.html',
  styleUrls: ['./video-input.component.scss'],

})
export class VideoInputComponent {
  @Output() fileSelected = new EventEmitter<File>();
  safeVideoUrl: any | undefined;

  constructor(private sanitizer: DomSanitizer) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileSelected.emit(file);
      this.safeVideoUrl = URL.createObjectURL(file);

      if (this.safeVideoUrl) {
        URL.revokeObjectURL(this.safeVideoUrl as string);
      }
      const unsafeUrl = URL.createObjectURL(file);
      this.safeVideoUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeUrl);
    }
  }
}
