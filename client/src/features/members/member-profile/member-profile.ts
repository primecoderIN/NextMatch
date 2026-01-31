import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EditableMember, Member } from '../../../types/member';
import { DatePipe } from '@angular/common';
import { MemberService } from '../../../core/services/member-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../../core/services/toast-service';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe, FormsModule],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit, OnDestroy {
  @ViewChild('editMemberForm') memberEditForm!: NgForm;
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: BeforeUnloadEvent) {
    //this will trigger when user tries to close the tab or browser window
    //for in page navigation, we use canDeactivate guard
    if (this.memberEditForm?.dirty) {
      $event.preventDefault();
    }
  }
  protected toast = inject(ToastService);
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

    this.memberService
      .updateMember(this.memberEditData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('Profile updated successfully');
          this.member.set(updatedMember);
          this.memberEditForm?.reset(updatedMember); //Reset form state after successful update
          this.memberService.isEditModeEnabled.set(false);
        },
      });
  }
}
