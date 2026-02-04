import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  imports: [],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css',
})
export class ImageUpload {
  protected imageSrc = signal<string | ArrayBuffer | null | undefined>(null);
  protected isDragging: boolean = false;
  private fileToUpload?: File;
  uploadFile = output<File>();
  loading = input<boolean>(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.previewFile(file);
      this.fileToUpload = file;
    }
  }

  onChange (event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.previewFile(file);
      this.fileToUpload = file;
    }
  }

  private previewFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageSrc.set(e.target?.result);
    };
    reader.readAsDataURL(file);
  }

  onCancel(): void {
    this.imageSrc.set(null);
    this.fileToUpload = undefined;
  }

  onUpload(): void {
    if (this.fileToUpload) {
      this.uploadFile.emit(this.fileToUpload);
    }
  }
}
