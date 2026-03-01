import { Component, computed, inject, input } from '@angular/core';
import { Member } from '../../../types/member';
import { RouterLink } from '@angular/router';
import { AgePipe } from '../../../core/pipe/age-pipe';
import { LikesService } from '../../../core/services/likes-service';

@Component({
  selector: 'app-member-card',
  imports: [RouterLink, AgePipe],
  templateUrl: './member-card.html',
  styleUrl: './member-card.css',
})
export class MemberCard {
  protected likeService = inject(LikesService);
  member = input.required<Member>();

  protected toggleLike($event: Event) {
    $event.stopPropagation();
    this.likeService.toggleLike(this.member().id).subscribe({
      next: () => {
        if (this.hasLiked()) {
          this.likeService.likeIds.set(
            this.likeService.likeIds().filter((id) => id !== this.member().id),
          );
        } else {
          this.likeService.likeIds.set([...this.likeService.likeIds(), this.member().id]);
        }
      },
    });
  }
  protected hasLiked = computed(() => this.likeService.likeIds().includes(this.member().id));
}
