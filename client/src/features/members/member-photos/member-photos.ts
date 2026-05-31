import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Photo } from '../../../types/member';
import { ImageUpload } from '../../../shared/image-upload/image-upload';
import { AccountService } from '../../../core/services/account-service';
import { BusyService } from '../../../core/services/busy-service';
import { Skeleton } from '../../../shared/skeleton/skeleton';
import { User } from '../../../types/user';

@Component({
  selector: 'app-member-photos',
  imports: [ImageUpload, Skeleton],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos implements OnInit {
  protected memberService = inject(MemberService);
  protected accountService = inject(AccountService);
  protected busyService = inject(BusyService);
  protected photos = signal<Photo[]>([]);
  protected isLoading = signal<boolean>(false);

  @Input() id?: string;

  private memberId = computed(() => this.id ?? this.memberService.member()?.id);

  protected isCurrentUserPhotos = computed(() => {
    const currentUserId = this.accountService.currentUser()?.id;
    const id = this.memberId();
    return currentUserId !== undefined && id !== undefined && currentUserId === id;
  });

  ngOnInit(): void {
    const id = this.memberId();
    if (id) {
      this.memberService.getMemberPhotos(id).subscribe({
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
        if(!this.accountService.currentUser()?.imageUrl) {
          this.setMainPhotoLocal(photo);
        }
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  setMainPhoto(photo: Photo): void {
    this.memberService.setMainPhoto(photo).subscribe({
      next: () => {
        this.setMainPhotoLocal(photo);
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

  private setMainPhotoLocal(photo: Photo): void {
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
}
