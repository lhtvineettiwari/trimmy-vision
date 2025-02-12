// Replicates the core functionality of VideoUpload.tsx in Angular

import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-video-upload',
  template: `
    <input type="file" 
           accept="video/*" 
           (change)="onFileSelected($event)"
           #fileInput>
  `
})
export class VideoUploadComponent {
  @Output() videoSelected = new EventEmitter<any>();

  isDragging = false;

  // Drag & drop events
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      // Accept only video files
      if (file.type.startsWith('video/')) {
        this.videoSelected.emit(file);
      }
    }
  }

  // Fallback for manual file selection
  onFileSelected(event: any): void {
    this.videoSelected.emit(event);
  }
}
