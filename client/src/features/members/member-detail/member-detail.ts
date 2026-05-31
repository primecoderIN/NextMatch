import { Component, computed, inject, OnInit, signal } from '@angular/core';
// import { MemberService } from '../../../core/services/member-service';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

import { filter } from 'rxjs';
import { Member } from '../../../types/member';
import { AgePipe } from '../../../core/pipe/age-pipe';
import { AccountService } from '../../../core/services/account-service';
import { MemberService } from '../../../core/services/member-service';
import { LikesService } from '../../../core/services/likes-service';
import { BusyService } from '../../../core/services/busy-service';
import { Skeleton } from '../../../shared/skeleton/skeleton';
import { Location } from '@angular/common';

@Component({
  selector: 'app-member-detail',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AgePipe, Skeleton],
  templateUrl: './member-detail.html',
  styleUrl: './member-detail.css',
})
export class MemberDetail implements OnInit {
  protected memberService = inject(MemberService);
  protected busyService = inject(BusyService);
  private accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private likesService = inject(LikesService);
  // protected member$!: Observable<Member>;
  protected title = signal<string | undefined>('Profile'); //Profile will be initial tab


  protected isCurrentUser = computed(()=> {
    return this.accountService?.currentUser()?.id===this.route.snapshot.paramMap.get('id');
  })

  ngOnInit(): void {
    // this.member$ = this.getMemberData(); using route resolver so commented this


    //Fetch the title of the first child when page opens
    this.title.set(this.route.firstChild?.snapshot.title);

    //Update the title on child page change inside member details
    //Events return observables , and we do not want to track all event so filtering using pipe and filter
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe({
      next: () => this.title.set(this.route.firstChild?.snapshot.title),
    });
  }

  toggleEditMode(): void {
    this.memberService.isEditModeEnabled.set(!this.memberService.isEditModeEnabled());
  }

  goBack(): void {
    this.location.back();
  }

  toggleLike(memberId: string): void {
    this.likesService.toggleLike(memberId).subscribe({
      next: () => {
        if (this.hasLiked(memberId)) {
          this.likesService.likeIds.set(this.likesService.likeIds().filter((id) => id !== memberId));
        } else {
          this.likesService.likeIds.set([...this.likesService.likeIds(), memberId]);
        }
      },
    });
  }

  hasLiked(memberId: string): boolean {
    return this.likesService.likeIds().includes(memberId);
  }

  // getMemberData() {
  //   const id = this.route.snapshot.paramMap.get('id');

  //   if (!id) {
  //     throw new Error('Member id is missing');
  //   }

  //   return this.memberService.getMemberById(id);
  // }
}
