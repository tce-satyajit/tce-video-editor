import { Injectable } from '@angular/core';
import { createFFmpeg, FFmpeg } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {
  private ffmpeg: FFmpeg;
  public audioBlob: any;
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

  async trimVideo(file: File, startTime: number, endTime: number): Promise<string> {
    await this.loadFFmpeg();
    const data = await file.arrayBuffer();
    this.ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(data));

    const duration = endTime - startTime;
    await this.ffmpeg.run(
      '-i', 'input.mp4',
      '-ss', `${startTime}`,
      '-t', `${duration}`,
      '-c', 'copy',
      'output.mp4'
    );

    const trimmedData = this.ffmpeg.FS('readFile', 'output.mp4');
    const blob = new Blob([trimmedData.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);

    this.ffmpeg.FS('unlink', 'input.mp4');
    this.ffmpeg.FS('unlink', 'output.mp4');

    return url;
  }

  async extractFrames(file: File, intervalInSeconds: number = 1): Promise<string[]> {
    await this.loadFFmpeg();
    const data = await file.arrayBuffer();
    this.ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(data));

    await this.ffmpeg.run(
      '-i', 'input.mp4',
      '-vf', `fps=1/${intervalInSeconds},scale=320:-1`,
      'frame_%04d.jpg'
    );

    const frames: string[] = [];
    const files = ((this.ffmpeg.FS as any)('readdir', '/').filter((f: string) => f.startsWith('frame_')));
    
    for (const file of files) {
      const data = this.ffmpeg.FS('readFile', file);
      const blob = new Blob([data.buffer], { type: 'image/jpeg' });
      frames.push(URL.createObjectURL(blob));
      this.ffmpeg.FS('unlink', file);
    }
  
    this.ffmpeg.FS('unlink', 'input.mp4');
    
    return frames;
  }

  async extractAudio(file: File): Promise<string> {
    await this.loadFFmpeg();
    const data = await file.arrayBuffer();
    this.ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(data));

    await this.ffmpeg.run(
      '-i', 'input.mp4',
      '-q:a', '0',
      '-map', 'a',
      '-ar', '16000',
      'audio.mp3'
    );

    const audioData = this.ffmpeg.FS('readFile', 'audio.mp3');
    const audioBlob = new Blob([audioData.buffer], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(audioBlob);
    this.audioBlob = audioBlob;

    this.ffmpeg.FS('unlink', 'input.mp4');
    this.ffmpeg.FS('unlink', 'audio.mp3');

    return audioUrl;
  }

  async generateWaveform(file: File, barCount: number): Promise<number[]> {
    await this.loadFFmpeg();
    const audioUrl = await this.extractAudio(file);

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioData = await fetch(audioUrl).then(res => res.arrayBuffer());
    const audioBuffer = await audioContext.decodeAudioData(audioData);

    const samples = audioBuffer.getChannelData(0);
    const barWidth = Math.floor(samples.length / barCount);
    const waveform: number[] = [];

    for (let i = 0; i < barCount; i++) {
      const barStart = i * barWidth;
      const barEnd = barStart + barWidth;
      let sum = 0;
      for (let j = barStart; j < barEnd; j++) {
        sum += Math.abs(samples[j]);
      }
      const average = sum / barWidth;
      waveform.push(average);
    }

    return waveform.map(value => value * 100); // Scale for rendering
  }

  

}
