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

    const other = this.memberService.member();
    if (!other) return;

    // Clear the input immediately for responsiveness
    this.newMessage.set('');

    // Let the server confirm via NewMessage SignalR event — no optimistic update needed
    // since Clients.Group() on the server sends back to the sender too
    this.messageService.addMessageToThread(other.id, content)?.then(() => {
      setTimeout(() => this.scrollToBottom(), 30);
    }).catch(err => {
      console.error('Failed to send message:', err);
      // Restore message text if send fails
      this.newMessage.set(content);
    });
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
