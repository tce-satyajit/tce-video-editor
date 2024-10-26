import { Injectable } from '@angular/core';
import { createFFmpeg, FFmpeg } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {
  private ffmpeg: FFmpeg;
  isReady = false;

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true });
  }

  async loadFFmpeg() {
    if (!this.isReady) {
      await this.ffmpeg.load();
      this.isReady = true;
    }
  }

  async trimVideo(file: File, startTime: number, endTime: number): Promise<Blob> {
    await this.loadFFmpeg();

    
    const data = await file.arrayBuffer();
    this.ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(data));

    
    await this.ffmpeg.run('-i', 'input.mp4', '-ss', `${startTime}`, '-to', `${endTime}`, '-c', 'copy', 'output.mp4');

    
    const outputData = this.ffmpeg.FS('readFile', 'output.mp4');
    const outputBlob = new Blob([outputData.buffer], { type: 'video/mp4' });
    
    return outputBlob;
  }
}




