// Replicates the core functionality of VideoEditor.tsx in Angular
// Implementation approach:
// 1. We'll store content of the videoFile in a local variable using an Input property
// 2. We'll replicate the rotation, trimming, cropping states
// 3. We'll generate thumbnail images by programmatically seeking the video
// 4. We'll provide at least one EventEmitter, e.g. "backClicked" to navigate back

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

@Component({
  selector: 'app-video-editor',
  templateUrl: './video-editor.component.html',
  styleUrls: ['./video-editor.component.css']
})
export class VideoEditorComponent implements AfterViewInit, OnDestroy {
  @Input() videoFile!: File;
  @Output() backClicked = new EventEmitter<void>();

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  videoUrl: string = '';
  rotation = 0;
  currentTime = 0;
  duration = 0;
  trimStart = 0;
  trimEnd = 100;
  thumbnails: string[] = [];
  isCropping = false;
  cropDimensions = { x: 0, y: 0, width: 100, height: 100 };

  ngAfterViewInit() {
    // Create URL & load the video
    const url = URL.createObjectURL(this.videoFile);
    this.videoUrl = url;
    this.generateThumbnails(url);

    const videoEl = this.videoElement.nativeElement;
    videoEl.addEventListener('loadedmetadata', this.handleLoadedMetadata);
    videoEl.addEventListener('timeupdate', this.handleTimeUpdate);
  }

  ngOnDestroy(): void {
    // Revoke URL to free up memory
    URL.revokeObjectURL(this.videoUrl);

    const videoEl = this.videoElement?.nativeElement;
    if (videoEl) {
      videoEl.removeEventListener('loadedmetadata', this.handleLoadedMetadata);
      videoEl.removeEventListener('timeupdate', this.handleTimeUpdate);
    }
  }

  // Generate base set of thumbnails
  async generateThumbnails(videoUrl: string) {
    const video = document.createElement('video');
    video.src = videoUrl;
    await video.load();

    const thumbnailCount = 8;
    const thumbs: string[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.addEventListener('loadedmetadata', () => {
      canvas.width = 120;
      canvas.height = (120 * 9) / 16;

      for (let i = 0; i < thumbnailCount; i++) {
        // set time for each thumbnail
        video.currentTime = (video.duration / thumbnailCount) * i;
        video.addEventListener(
          'seeked',
          () => {
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              thumbs.push(canvas.toDataURL('image/png'));
              if (thumbs.length === thumbnailCount) {
                this.thumbnails = thumbs;
              }
            }
          },
          { once: true }
        );
      }
    });
  }

  // Generate thumbnail previews for the trimmed portion
  async generateTrimmedThumbnails(url: string, start: number, end: number) {
    const video = document.createElement('video');
    video.src = url;
    await video.load();

    const thumbnailCount = 8;
    const thumbs: string[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.addEventListener('loadedmetadata', () => {
      canvas.width = 120;
      canvas.height = (120 * 9) / 16;

      const duration = video.duration;
      const startTime = (start / 100) * duration;
      const endTime = (end / 100) * duration;
      const range = endTime - startTime;

      for (let i = 0; i < thumbnailCount; i++) {
        const currentTime = startTime + (range / thumbnailCount) * i;
        video.currentTime = currentTime;
        video.addEventListener(
          'seeked',
          () => {
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              thumbs.push(canvas.toDataURL('image/png'));
              if (thumbs.length === thumbnailCount) {
                this.thumbnails = thumbs;
              }
            }
          },
          { once: true }
        );
      }
    });
  }

  // Called when the video loads metadata
  handleLoadedMetadata = () => {
    const videoEl = this.videoElement.nativeElement;
    this.duration = videoEl.duration;
  };

  // Called when the video time updates
  handleTimeUpdate = () => {
    const videoEl = this.videoElement.nativeElement;
    const currentTime = videoEl.currentTime;

    const start = (this.trimStart / 100) * this.duration;
    const end = (this.trimEnd / 100) * this.duration;

    if (currentTime < start) {
      videoEl.currentTime = start;
    } else if (currentTime > end) {
      // loop back
      videoEl.currentTime = start;
    }

    this.currentTime = videoEl.currentTime;
  };

  // Rotate 90 degrees at a time
  handleRotate() {
    this.rotation += 90;
    if (this.rotation >= 360) {
      this.rotation = 0;
    }
  }

  // Crop toggling
  handleCropToggle() {
    this.isCropping = !this.isCropping;
    if (this.isCropping) {
      alert('Click and drag on the video to crop (demo-only in this sample).');
    }
  }

  // Crop (mousedown) start placeholder
  handleCropStart(event: MouseEvent) {
    if (!this.isCropping) return;
    const el = event.currentTarget as HTMLDivElement;
    const rect = el.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.cropDimensions = { x, y, width: 0, height: 0 };
  }

  // Crop (mousemove) placeholder
  handleCropMove(event: MouseEvent) {
    if (!this.isCropping) return;
    const el = event.currentTarget as HTMLDivElement;
    const rect = el.getBoundingClientRect();

    const currentX = ((event.clientX - rect.left) / rect.width) * 100;
    const currentY = ((event.clientY - rect.top) / rect.height) * 100;

    this.cropDimensions.width = currentX - this.cropDimensions.x;
    this.cropDimensions.height = currentY - this.cropDimensions.y;
  }

  // Trim slider update
  handleTrimChange(values: number[]) {
    this.trimStart = values[0];
    this.trimEnd = values[1];

    const videoEl = this.videoElement.nativeElement;
    const currentStart = (this.trimStart / 100) * this.duration;
    const currentEnd = (this.trimEnd / 100) * this.duration;

    // Adjust the video currentTime so we can see the changes reflected
    const oldTime = videoEl.currentTime;
    if (Math.abs(oldTime - currentStart) < Math.abs(oldTime - currentEnd)) {
      videoEl.currentTime = currentStart;
    } else {
      videoEl.currentTime = currentEnd;
    }

    this.generateTrimmedThumbnails(this.videoUrl, this.trimStart, this.trimEnd);
  }

  backButtonClick() {
    this.backClicked.emit();
  }

  // Helper method to format mm:ss from seconds
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  nextButtonClick() {
    // In a real app, proceed to the next step
    alert('Next button clicked!');
  }

  handleInputChange(event: Event, isStartTrim: boolean) {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;
    if (isStartTrim) {
      this.handleTrimChange([value, this.trimEnd]);
    } else {
      this.handleTrimChange([this.trimStart, value]);
    }
  }
}
