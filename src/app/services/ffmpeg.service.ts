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

  async trimVideoNN(file: File, startTime: number, endTime: number): Promise<Blob> {
    await this.loadFFmpeg();

    
    const data = await file.arrayBuffer();
    this.ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(data));

    
    await this.ffmpeg.run('-i', 'input.mp4', '-ss', `${startTime}`, '-to', `${endTime}`, '-c', 'copy', 'output.mp4');

    
    const outputData = this.ffmpeg.FS('readFile', 'output.mp4');
    const outputBlob = new Blob([outputData.buffer], { type: 'video/mp4' });
    
    return outputBlob;
  }


  async trimVideo(file: File, startTime: number, endTime: number): Promise<string> {
    await this.loadFFmpeg();

    // Write the input video file
    const data = await file.arrayBuffer();
    this.ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(data));

    // Run FFmpeg to trim the video
    const duration = endTime - startTime;
    await this.ffmpeg.run(
      '-i', 'input.mp4',
      '-ss', `${startTime}`,
      '-t', `${duration}`,
      '-c', 'copy',
      'output.mp4'
    );

    // Read the result
    const trimmedData = this.ffmpeg.FS('readFile', 'output.mp4');
    const blob = new Blob([trimmedData.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob); // This is a string URL

    // Clean up
    this.ffmpeg.FS('unlink', 'input.mp4');
    this.ffmpeg.FS('unlink', 'output.mp4');

    return url; // Return as a string URL
  }


    async extractFramesOLD(file: File, fps: number): Promise<string[]> {
      await this.loadFFmpeg();

      const data = await file.arrayBuffer();
      this.ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(data));

      // Extract frames at specified FPS
      await this.ffmpeg.run('-i', 'input.mp4', '-vf', `fps=${fps}`, 'frame_%04d.png');

      // Read the frames generated
      const frameFiles = (this.ffmpeg.FS as any)('readdir', '/').filter((f: string) => f.startsWith('frame_'));

      // Convert each frame to a blob URL
      const frameUrls = frameFiles.map((frameFile: any) => {
        const frameData = this.ffmpeg.FS('readFile', frameFile);
        const blob = new Blob([frameData.buffer], { type: 'image/png' });
        return URL.createObjectURL(blob);
      });

      // Clean up
      frameFiles.forEach((file:any) => this.ffmpeg.FS('unlink', file));

      return frameUrls;
  }

  async extractFrames(file: File, intervalInSeconds: number = 1): Promise<string[]> {
    await this.loadFFmpeg();
  
    // Write the input file
    const data = await file.arrayBuffer();
    this.ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(data));
  
    // Set up FFmpeg command to extract frames every `intervalInSeconds` seconds at lower resolution
    await this.ffmpeg.run(
      '-i', 'input.mp4',
      '-vf', `fps=1/${intervalInSeconds},scale=320:-1`, // Extract one frame every `intervalInSeconds` seconds
      'frame_%04d.jpg'
    );
  
    // Read the frames from the FFmpeg filesystem
    const frames: string[] = [];
    const files = ((this.ffmpeg.FS as any)('readdir', '/').filter((f: string) => f.startsWith('frame_')));
    
    for (const file of files) {
      const data = this.ffmpeg.FS('readFile', file);
      const blob = new Blob([data.buffer], { type: 'image/jpeg' });
      frames.push(URL.createObjectURL(blob));
      this.ffmpeg.FS('unlink', file); // Remove frame from FS to save memory
    }
  
    // Clean up
    this.ffmpeg.FS('unlink', 'input.mp4');
    
    return frames;
  }
  
}




/*
import { Injectable } from '@angular/core';
import { createFFmpeg, FFmpeg } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root',
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

  async extractFrames(file: File, fps: number): Promise<string[]> {
    await this.loadFFmpeg();

    const data = await file.arrayBuffer();
    this.ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(data));

    // Extract frames at specified FPS
    await this.ffmpeg.run('-i', 'input.mp4', '-vf', `fps=${fps}`, 'frame_%04d.png');

    // Read the frames generated
    const frameFiles = (this.ffmpeg.FS as any)('readdir', '/').filter((f: string) => f.startsWith('frame_'));

    // Convert each frame to a blob URL
    const frameUrls = frameFiles.map((frameFile: any) => {
      const frameData = this.ffmpeg.FS('readFile', frameFile);
      const blob = new Blob([frameData.buffer], { type: 'image/png' });
      return URL.createObjectURL(blob);
    });

    // Clean up
    frameFiles.forEach((file:any) => this.ffmpeg.FS('unlink', file));

    return frameUrls;
  }
}

*/