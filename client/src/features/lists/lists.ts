import { Component, inject, OnInit, signal } from '@angular/core';
import { LikesService } from '../../core/services/likes-service';
import { Member } from '../../types/member';
import { RouterLink } from '@angular/router';
import { AgePipe } from '../../core/pipe/age-pipe';

@Component({
  selector: 'app-lists',
  imports: [RouterLink, AgePipe],
  templateUrl: './lists.html',
  styleUrl: './lists.css',
})
export class Lists implements OnInit {
  private likeService = inject(LikesService);
  protected members = signal<Member[]>([]);
  protected predicate = 'liked';


  tabs = [
    { label: 'Liked', value: 'liked' },
    { label: 'Liked me', value: 'likedBy' },
    { label: 'Mutual', value: 'mutual' },

  ];

  setPredicate(value: string) {

    if(this.predicate !== value) {
      this.predicate=value;
    }
    this.likeService.getLikes(this.predicate).subscribe({
      next: (members) => {
        this.members.set(members);
      },
    });

  }

  ngOnInit(): void {
    this.likeService.getLikes(this.predicate).subscribe({
      next: (members) => {
        this.members.set(members);
        },
      });
  }

    protected toggleLike($event: Event,Id: string) {
    $event.stopPropagation();
    this.likeService.toggleLike(Id).subscribe({
      next: () => {
        if (this.hasLiked(Id)) {
          this.likeService.likeIds.set(
            this.likeService.likeIds().filter((id) => id !== Id),
          );
        } else {
          this.likeService.likeIds.set([...this.likeService.likeIds(), Id]);
        }
      },
    });
  }

   protected hasLiked = (Id: string) => this.likeService.likeIds().includes(Id);

}
