import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute } from '@angular/router';
import { Photo } from '../../../types/member';
import { ImageUpload } from '../../../shared/image-upload/image-upload';

@Component({
  selector: 'app-member-photos',
  imports: [ImageUpload],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos implements OnInit {
  protected memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  protected photos = signal<Photo[]>([]);
  protected isLoading = signal<boolean>(false);

  ngOnInit(): void {
    const memberId = this.route.parent?.snapshot.paramMap.get('id');

    if (memberId) {
      this.memberService.getMemberPhotos(memberId).subscribe({
        next: (photos) => {
          this.photos.set(photos);
        },
      });
    }
  }

  onImageUpload(file: File): void {
    this.isLoading.set(true);
    this.memberService.uploadPhoto(file).subscribe({
      next: (photo) => {
        this.photos.update((currentPhotos) => [...currentPhotos, photo]);
        this.isLoading.set(false);
        this.memberService.isEditModeEnabled.set(false);
      },
      error: ()=> {
        this.isLoading.set(false);
        console.log('Error uploading photo');
      }
    });
  }

}
