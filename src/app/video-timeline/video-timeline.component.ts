import { Component, Input, Output, EventEmitter, OnInit, HostListener, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FfmpegService } from '../services/ffmpeg.service';
import WaveSurfer from 'wavesurfer.js';


@Component({
  selector: 'app-video-timeline',
  templateUrl: './video-timeline.component.html',
  styleUrls: ['./video-timeline.component.scss'],
})
export class VideoTimelineComponent implements OnInit, OnDestroy {
  @Input() videoFile!: File;
  @Output() startAndEndTime = new EventEmitter<{ startTime: number; endTime: number }>();

  @ViewChild('framesContainer', { static: true }) framesContainer!: ElementRef;
  @ViewChild('waveformContainer', { static: true }) waveformContainer!: ElementRef;
  @ViewChild('videoPlayer', { static: true }) videoPlayer!: ElementRef<HTMLVideoElement>;

  frames: SafeUrl[] = [];
  startTime: number = 0;
  endTime: number = 0;

  private videoDuration: number = 1;
  private isDragging: 'start' | 'end' | null = null;
  private waveSurfer!: WaveSurfer;
  private waveSurferUpdateInterval: any;
  private isSeeking: boolean = false; // Flag to prevent feedback loop

  constructor(
    private ffmpegService: FfmpegService, 
    private sanitizer: DomSanitizer,
  ) {}

  async ngOnInit() {
    if (this.videoFile) {
      this.frames = await this.extractFrames(5);

      const video = this.videoPlayer.nativeElement;
      video.src = URL.createObjectURL(this.videoFile);
      video.onloadedmetadata = () => {
        this.videoDuration = video.duration;
        this.endTime = this.videoDuration;
        URL.revokeObjectURL(video.src);
      };

      this.initializeWaveform();
      this.startVideoUpdate();
    }
  }

  private async initializeWaveform() {
    const audioUrl = await this.ffmpegService.extractAudio(this.videoFile);
    /*
    this.waveSurfer = WaveSurfer.create({
      container: this.waveformContainer.nativeElement,
      waveColor: 'white',
      progressColor: 'red',
      height: 80,
      barWidth: 2,
      responsive: true,
    });*/

    this.waveSurfer = WaveSurfer.create({
      "container": this.waveformContainer.nativeElement,
      "height": 80,
      "splitChannels": false,
      "normalize": false,
      "waveColor": "#ffffff",
      "progressColor": "#f50571",
      "cursorColor": "blue",
      "cursorWidth": 5,
      "barWidth": 5,
      "barGap": 1,
      "barRadius": 8,
      "minPxPerSec": 1,
      "fillParent": true,
      "mediaControls": true,
      "interact": true,
      "hideScrollbar": true,
      "audioRate": 1,
      "autoCenter": true,
    });

    this.waveSurfer.load(audioUrl);

    // Sync frames timeline and video with waveform playback position
    this.waveSurfer.on('audioprocess', () => {
      if (!this.isSeeking) this.updateTimelineScroll(this.waveSurfer.getCurrentTime());
    });

    // Play/pause video when clicking play/pause in the waveform
    this.waveSurfer.on('play', () => this.videoPlayer.nativeElement.play());
    this.waveSurfer.on('pause', () => this.videoPlayer.nativeElement.pause());

    // Seek video when waveform is clicked
    this.waveSurfer.on('seek', (progress) => {
      const seekTime = progress * this.videoDuration;
      this.isSeeking = true;
      this.videoPlayer.nativeElement.currentTime = seekTime;
      this.updateTimelineScroll(seekTime);
      this.isSeeking = false;
    });
  }

  getNeedlePosition(needleType: 'start' | 'end'): number {
    const time = needleType === 'start' ? this.startTime : this.endTime;
    const visibleWidth = this.getVisibleWidth();
    return (time / this.videoDuration) * visibleWidth;
  }

  onScroll(event: Event) {
    const scrollLeft = (event.target as HTMLElement).scrollLeft;
    this.waveformContainer.nativeElement.scrollLeft = scrollLeft;
  }

  startDrag(type: 'start' | 'end') {
    this.isDragging = type;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      const timelineRect = this.framesContainer.nativeElement.getBoundingClientRect();
      const mouseX = event.clientX - timelineRect.left;
      const visibleWidth = this.getVisibleWidth();
      const newTime = (mouseX / visibleWidth) * this.videoDuration;

      if (this.isDragging === 'start' && newTime >= 0 && newTime <= this.endTime) {
        this.startTime = newTime;
      } else if (this.isDragging === 'end' && newTime >= this.startTime && newTime <= this.videoDuration) {
        this.endTime = newTime;
      }
      this.emitTimes();
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
    return this.framesContainer.nativeElement.offsetWidth;
  }

  startVideoUpdate() {
    const video = this.videoPlayer.nativeElement;
    this.waveSurferUpdateInterval = setInterval(() => {
      if (!video.paused) {
        const currentTime = video.currentTime;
        this.updateTimelineScroll(currentTime);
      }
    }, 100);
  }

  updateTimelineScroll(currentTime: number) {
    const scrollWidth = this.framesContainer.nativeElement.scrollWidth;
    const scrollLeft = (currentTime / this.videoDuration) * scrollWidth;

    this.framesContainer.nativeElement.scrollLeft = scrollLeft;
    this.waveformContainer.nativeElement.scrollLeft = scrollLeft;
  }

  ngOnDestroy() {
    clearInterval(this.waveSurferUpdateInterval);
    this.waveSurfer.destroy();
  }
}
