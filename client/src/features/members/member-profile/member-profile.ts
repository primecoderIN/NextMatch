import { Component, DestroyRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EditableMember, Member } from '../../../types/member';
import { DatePipe } from '@angular/common';
import { MemberService } from '../../../core/services/member-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe, FormsModule],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit, OnDestroy {
  @ViewChild('memberEditForm') memberEditForm: any;
  protected memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  protected member = signal<Member | undefined>(undefined);
  private destroyRef = inject(DestroyRef);
  protected memberEditData: EditableMember = {
    userName: '',
    description: '',
    city: '',
    country: '',
  };



  ngOnInit(): void {
    this.route.parent?.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.member.set(data['member']),
    });

      const member = this.member();

    this.memberEditData = {
      userName: member?.userName || '',
      description: member?.description || '',
      city: member?.city || '',
      country: member?.country || '',
    };
  }

  ngOnDestroy(): void {
    if (this.memberService.isEditModeEnabled()) {
      this.memberService.isEditModeEnabled.set(false);
    }
  }

  updateMemberProfile(): void {
    if (!this.memberEditData) return;

    const updatedMember = {
      ...this.member(),
      ...this.memberEditData,
    } as Member;
    // this.member.set(updatedMember);

    console.log('Updated Member Profile:', updatedMember);
    this.memberService.isEditModeEnabled.set(false);
  }
}
