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




