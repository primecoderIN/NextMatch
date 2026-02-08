import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { EditableMember, Member } from '../../../types/member';
import { DatePipe } from '@angular/common';
import { MemberService } from '../../../core/services/member-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../../core/services/toast-service';
import { AccountService } from '../../../core/services/account-service';
import { TimeAgoPipe } from '../../../core/pipe/time-ago-pipe';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe, FormsModule, TimeAgoPipe],
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
  protected accountService = inject(AccountService);
  protected toast = inject(ToastService);
  protected memberService = inject(MemberService);
  private destroyRef = inject(DestroyRef);
  protected memberEditData: EditableMember = {
    userName: '',
    description: '',
    city: '',
    country: '',
  };

  ngOnInit(): void {
    const member = this.memberService.member();

    console.log('memmber in profile:', member);

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
      ...this.memberService.member(),
      ...this.memberEditData,
    } as Member;
    // this.member.set(updatedMember);

    this.memberService
      .updateMember(this.memberEditData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('Profile updated successfully');
          this.memberEditForm?.reset(updatedMember); //Reset form state after successful update
          this.memberService.member.set(updatedMember); //Update the member signal with new data
          this.memberService.isEditModeEnabled.set(false);

          //Update user info in local storage also and account service also

          const currentUser = this.accountService.currentUser();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              city: updatedMember.city,
              country: updatedMember.country,
              description: updatedMember.description,
              userName: updatedMember.userName,
            };
            this.accountService.setCurrentUser(updatedUser);
          }
        },
      });
  }
}
