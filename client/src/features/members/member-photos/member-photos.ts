import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute } from '@angular/router';
import { Photo } from '../../../types/member';
import { ImageUpload } from '../../../shared/image-upload/image-upload';
import { AccountService } from '../../../core/services/account-service';
import { User } from '../../../types/user';

@Component({
  selector: 'app-member-photos',
  imports: [ImageUpload],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos implements OnInit {
  protected memberService = inject(MemberService);
  protected accountService = inject(AccountService);
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
      error: () => {
        this.isLoading.set(false);
        console.log('Error uploading photo');
      },
    });
  }

  setMainPhoto(photo: Photo): void {
    this.memberService.setMainPhoto(photo).subscribe({
      next: () => {
        const currentUser = this.accountService.currentUser();
        if (currentUser) {
          currentUser.imageUrl = photo.url;
          this.accountService.setCurrentUser(currentUser as User);
          this.memberService.member.update((member) => {
            if (member) {
              return { ...member, imageUrl: photo.url };
            }
            return member;
          });
        }
      },
    });
  }

  detelePhoto(photo: Photo): void {
    this.memberService.deletePhoto(photo).subscribe({
      next: () => {
        this.photos.update((currentPhotos) =>
          currentPhotos.filter((p) => p.id !== photo.id)
        );
      },
    }); 
  }
}
