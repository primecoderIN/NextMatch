import { Component, inject, OnInit, signal } from '@angular/core';
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

@Component({
  selector: 'app-member-detail',
  imports: [RouterLink, RouterLinkActive, RouterOutlet,AgePipe],
  templateUrl: './member-detail.html',
  styleUrl: './member-detail.css',
})
export class MemberDetail implements OnInit {
  // private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  // protected member$!: Observable<Member>;
  protected member = signal<Member | undefined>(undefined);
  protected title = signal<string | undefined>('Profile'); //Profile will be initial tab

  ngOnInit(): void {
    // this.member$ = this.getMemberData(); using route resolver so commented this

    this.route.data.subscribe({
      next: (data) => this.member.set(data['member']),
    });

    //Fetch the title of the first child when page opens
    this.title.set(this.route.firstChild?.snapshot.title);

    //Update the title on child page change inside member details
    //Events return observables , and we do not want to track all event so filtering using pipe and filter
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe({
      next: () => this.title.set(this.route.firstChild?.snapshot.title),
    });
  }

  // getMemberData() {
  //   const id = this.route.snapshot.paramMap.get('id');

  //   if (!id) {
  //     throw new Error('Member id is missing');
  //   }

  //   return this.memberService.getMemberById(id);
  // }
}
