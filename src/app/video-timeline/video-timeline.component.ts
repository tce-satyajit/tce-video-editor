import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-video-timeline',
  template: `
    <div>
      <label>Start Time: </label>
      <input type="number" [(ngModel)]="startTime" (change)="emitTime()">
      <label>End Time: </label>
      <input type="number" [(ngModel)]="endTime" (change)="emitTime()">
    </div>
  `
})
export class VideoTimelineComponent {
  @Input() duration: number = 0;
  @Output() timeChange = new EventEmitter<{ start: number, end: number }>();

  startTime: number = 0;
  endTime: number = 0;

  emitTime() {
    this.timeChange.emit({ start: this.startTime, end: this.endTime });
  }
}
