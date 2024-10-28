import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';  // <-- Import FormsModule here
import { AppComponent } from './app.component';
import { VideoInputComponent } from './video-input/video-input.component';
import { VideoOutputComponent } from './video-output/video-output.component';
import { VideoTimelineComponent } from './video-timeline/video-timeline.component';


@NgModule({
  declarations: [
    AppComponent,
    VideoInputComponent,
    VideoOutputComponent,
    VideoTimelineComponent
  ],
  imports: [
    BrowserModule, FormsModule, 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
