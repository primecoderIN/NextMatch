import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EditableMember, Member } from '../../../types/member';
import { DatePipe } from '@angular/common';
import { MemberService } from '../../../core/services/member-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit,OnDestroy {
  @ViewChild('memberEditForm') memberEditForm: any;
  protected memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  protected member = signal<Member | undefined>(undefined);

  protected memberEditData?: EditableMember;

  ngOnInit(): void {
    this.route.parent?.data.pipe(takeUntilDestroyed()).subscribe({
      next: (data) => this.member.set(data['member']),
    });

    const { userName = '', description = '', city = '', country = '' } = this.member() || {};

    this.memberEditData = {
      userName,
      description,
      city,
      country,
    };
  }

  ngOnDestroy(): void {
    if(this.memberService.isEditModeEnabled()){
      this.memberService.isEditModeEnabled.set(false);
    }
  }

  updateMemberProfile(): void {

    if(!this.memberEditData) return;

    const updatedMember = {
      ...this.member(),
      ...this.memberEditData,
    } as Member;
    // this.member.set(updatedMember);

    console.log('Updated Member Profile:', updatedMember);
    this.memberService.isEditModeEnabled.set(false);
  }
}
