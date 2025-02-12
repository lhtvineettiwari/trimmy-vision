import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { VideoUploadComponent } from './video-upload/video-upload.component';
import { VideoEditorComponent } from './video-editor/video-editor.component';
import { IndexComponent } from './index/index.component';

@NgModule({
  declarations: [
    IndexComponent,
    VideoUploadComponent,
    VideoEditorComponent
  ],
  imports: [
    BrowserModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [IndexComponent]
})
export class AppModule { } 