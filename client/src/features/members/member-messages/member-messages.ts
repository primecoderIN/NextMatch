import { Component, inject, OnInit, signal } from '@angular/core';
import { MessageService } from '../../../core/services/message-service';
import { Message } from '../../../types/message';
import { MemberService } from '../../../core/services/member-service';
import { AccountService } from '../../../core/services/account-service';
import { BusyService } from '../../../core/services/busy-service';
import { TimeAgoPipe } from '../../../core/pipe/time-ago-pipe';
import { Skeleton } from '../../../shared/skeleton/skeleton';

@Component({
  selector: 'app-member-messages',
  imports: [TimeAgoPipe, Skeleton],
  templateUrl: './member-messages.html',
  styleUrl: './member-messages.css',
})
export class MemberMessages implements OnInit {
   private messageService = inject(MessageService);
  protected memberService = inject(MemberService);
  private accountService = inject(AccountService);
  protected busyService = inject(BusyService);

   protected messageThread = signal<Message[]>([]);
  protected newMessage = signal<string>('');

  protected currentUserId = signal<string | null>(null);

   loadMessages() {
    const memberId = this.memberService.member()?.id;
    if (!memberId) {
      return;
    }

    this.messageService.getMessageThread(memberId).subscribe({
        next: (messages) => {
          this.messageThread.set(messages);
          setTimeout(() => this.scrollToBottom(), 50);
        },
      error: (error) => console.error('Error fetching message thread:', error)
    });
   }

   sendMessage() {
    const content = this.newMessage();
    if (!content || !content.trim()) return;
    // For now just append locally for UI responsiveness. Backend send endpoint not implemented here.
    const user = this.accountService.currentUser();
    const other = this.memberService.member();
    const temp: Message = {
      id: Math.random().toString(36).slice(2),
      senderId: user?.id || 'me',
      senderUsername: user?.userName || 'You',
      senderImageUrl: user?.imageUrl || null,
      recipientId: other?.id || '',
      recipientUsername: other?.userName || '',
      recipientImageUrl: other?.imageUrl || null,
      content: content,
      messageSent: new Date().toISOString(),
    };

    this.messageThread.update((m) => [...m, temp]);
    this.newMessage.set('');
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

    ngOnInit(): void {
      this.loadMessages();
      this.currentUserId.set(this.accountService.currentUser()?.id || null);
    }
   
}
