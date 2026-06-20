import { Component, inject, OnInit, OnDestroy, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { MessageService } from '../../../core/services/message-service';
import { MemberService } from '../../../core/services/member-service';
import { AccountService } from '../../../core/services/account-service';
import { BusyService } from '../../../core/services/busy-service';
import { TimeAgoPipe } from '../../../core/pipe/time-ago-pipe';
import { Skeleton } from '../../../shared/skeleton/skeleton';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-messages',
  imports: [TimeAgoPipe, Skeleton],
  templateUrl: './member-messages.html',
  styleUrl: './member-messages.css',
})
export class MemberMessages implements OnInit, AfterViewInit, OnDestroy {
  protected messageService = inject(MessageService);
  protected memberService = inject(MemberService);
  private accountService = inject(AccountService);
  protected busyService = inject(BusyService);
  private route = inject(ActivatedRoute);
  protected newMessage = signal<string>('');
  protected currentUserId = signal<string | null>(null);

  @ViewChild('threadScroll') private threadScrollRef?: ElementRef<HTMLDivElement>;
  private scrollListener?: () => void;

  ngOnInit(): void {
    this.currentUserId.set(this.accountService.currentUser()?.id || null);

    const otherUserId = this.route.parent?.snapshot.paramMap.get('id');
    if (otherUserId) {
      this.messageService.createHubConnection(otherUserId);
    }
  }

  ngAfterViewInit(): void {
    // Attach scroll listener after view is rendered
    const el = this.threadScrollRef?.nativeElement;
    if (el) {
      this.scrollListener = () => this.onScroll(el);
      el.addEventListener('scroll', this.scrollListener);
    }

    // Register scroll-restore callback — fires AFTER ReceiveMoreMessages re-renders
    this.messageService.onMoreMessagesReceived = () => {
      const scrollEl = this.threadScrollRef?.nativeElement;
      if (scrollEl && this._prevScrollHeight !== null) {
        scrollEl.scrollTop = scrollEl.scrollHeight - this._prevScrollHeight;
        this._prevScrollHeight = null;
      }
    };

    // Register initial scroll-to-bottom callback — fires AFTER ReceiveMessageThread re-renders
    this.messageService.onMessageThreadReceived = () => {
      this.scrollToBottom();
    };
  }

  private _prevScrollHeight: number | null = null;

  private onScroll(el: HTMLDivElement): void {
    // When user scrolls within 60px of the top, load more (older) messages
    if (el.scrollTop <= 60 && !this.messageService.isLoadingMore() && this.messageService.hasMoreMessages()) {
      // Capture scroll height BEFORE new messages are prepended
      this._prevScrollHeight = el.scrollHeight;
      this.messageService.loadMoreMessages();
    }
  }

  sendMessage() {
    const content = this.newMessage().trim();
    if (!content) return;

    const other = this.memberService.member();
    if (!other) return;

    this.newMessage.set('');

    this.messageService.addMessageToThread(other.id, content)?.then(() => {
      setTimeout(() => this.scrollToBottom(), 30);
    }).catch(err => {
      console.error('Failed to send message:', err);
      this.newMessage.set(content);
    });
  }

  scrollToBottom() {
    const el = this.threadScrollRef?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  ngOnDestroy(): void {
    const el = this.threadScrollRef?.nativeElement;
    if (el && this.scrollListener) {
      el.removeEventListener('scroll', this.scrollListener);
    }
    this.messageService.stopHubConnection();
  }
}
