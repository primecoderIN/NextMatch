import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { MessageService } from '../../../core/services/message-service';
import { Message } from '../../../types/message';
import { MemberService } from '../../../core/services/member-service';
import { AccountService } from '../../../core/services/account-service';
import { BusyService } from '../../../core/services/busy-service';
import { TimeAgoPipe } from '../../../core/pipe/time-ago-pipe';
import { Skeleton } from '../../../shared/skeleton/skeleton';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-member-messages',
  imports: [TimeAgoPipe, Skeleton],
  templateUrl: './member-messages.html',
  styleUrl: './member-messages.css',
})
export class MemberMessages implements OnInit, OnDestroy {
  protected messageService = inject(MessageService);
  protected memberService = inject(MemberService);
  private accountService = inject(AccountService);
  protected busyService = inject(BusyService);
  private route = inject(ActivatedRoute);
  protected newMessage = signal<string>('');
  protected currentUserId = signal<string | null>(null);
  private routeSub?: Subscription;

  ngOnInit(): void {
    this.currentUserId.set(this.accountService.currentUser()?.id || null);

    // Read the :id param from the parent route (members/:id)
    // Use take(1) equivalent by reading the snapshot directly — the id never
    // changes while this child is active, and using snapshot avoids a leak.
    const otherUserId = this.route.parent?.snapshot.paramMap.get('id');
    if (otherUserId) {
      this.messageService.createHubConnection(otherUserId);
    }
  }

  sendMessage() {
    const content = this.newMessage().trim();
    if (!content) return;

    const user = this.accountService.currentUser();
    const other = this.memberService.member();
    if (!other || !user) return;

    // Optimistic update — show message immediately in the thread
    const optimistic: Message = {
      id: Math.random().toString(36).slice(2),
      senderId: user.id,
      senderUsername: user.userName,
      senderImageUrl: user.imageUrl || null,
      recipientId: other.id,
      recipientUsername: other.userName,
      recipientImageUrl: other.imageUrl || null,
      content: content,
      messageSent: new Date().toISOString(),
      currentUserSender: true,
    };
    this.messageService.mesageThread.update(msgs => [...msgs, optimistic]);
    this.newMessage.set('');

    this.messageService.addMessageToThread(other.id, content)?.then(() => {
      this.scrollToBottom();
    }).catch(err => {
      console.error('Failed to send message:', err);
      // Rollback optimistic message if send fails
      this.messageService.mesageThread.update(msgs =>
        msgs.filter(m => m.id !== optimistic.id)
      );
    });

    setTimeout(() => this.scrollToBottom(), 30);
  }

  private scrollToBottom() {
    try {
      const el = document.getElementById('threadScroll');
      if (el) el.scrollTop = el.scrollHeight;
    } catch (e) {
      // ignore
    }
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.messageService.stopHubConnection();
  }
}
