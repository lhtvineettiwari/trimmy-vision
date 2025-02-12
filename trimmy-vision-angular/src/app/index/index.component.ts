import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent {
  videoFile: File | null = null;

  onVideoSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      this.videoFile = file;
    }
  }

  onBack() {
    this.videoFile = null;
  }
}
