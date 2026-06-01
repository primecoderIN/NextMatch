import { Component, inject, OnInit, signal } from '@angular/core';
import { MessageService } from '../../core/services/message-service';
import { Message } from '../../types/message';
import { PaginatedResult } from '../../types/pagination';
import { Paginator } from "../../shared/paginator/paginator";
import { RouterLink } from '@angular/router';
import { TimeAgoPipe } from '../../core/pipe/time-ago-pipe';
import { BusyService } from '../../core/services/busy-service';
import { Skeleton } from '../../shared/skeleton/skeleton';
import { ToastService } from '../../core/services/toast-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-messages',
  imports: [Paginator, RouterLink, TimeAgoPipe, Skeleton],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages implements OnInit {
  private messageService = inject(MessageService); 
  protected Container = 'Inbox';
  protected fetchedContainer = 'Inbox';
  protected pageNumber = 1;
  protected pageSize = 10;
  protected paginatedMessages = signal<PaginatedResult<Message[]>| null>(null);
  protected busyService = inject(BusyService);
  private toastService = inject(ToastService);
  protected deletingMessageIds = signal<ReadonlySet<string>>(new Set());

  tabs = [
    { label: 'Inbox', value: 'Inbox' },
    { label: 'Outbox', value: 'Outbox' }
  ];

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessages(this.Container, this.pageNumber, this.pageSize).subscribe({
      next: (response) => {
        this.paginatedMessages.set(response);
        this.fetchedContainer = this.Container; // Update fetched container after successful load
      },
      error: (error) => {
        console.error('Error fetching messages:', error);
      }
    })
  }

  get isInbox() {
    return this.fetchedContainer === 'Inbox';
  }

  setContainer(container: string) {
    this.Container = container;
    // this.fetchedContainer = container;
    this.pageNumber = 1; // Reset to first page when changing container
    this.loadMessages();
  }

  onPageChange(event: {pageNumber: number,pageSize: number}) {
    this.pageNumber = event.pageNumber;
    this.pageSize = event.pageSize;
    this.loadMessages();
  }

  deleteMessage(event: MouseEvent, messageId: string) {
    event.preventDefault();
    event.stopPropagation();

    this.deletingMessageIds.update((ids) => new Set(ids).add(messageId));
    this.messageService.deleteMessageById(messageId).pipe(
      finalize(() => {
        this.deletingMessageIds.update((ids) => {
          const updatedIds = new Set(ids);
          updatedIds.delete(messageId);
          return updatedIds;
        });
      }),
    ).subscribe({
      next: () => {
        if (this.paginatedMessages()?.items.length === 1 && this.pageNumber > 1) {
          this.pageNumber--;
        }

        this.toastService.success('Message deleted successfully.');
        this.loadMessages();
      },
      error: (error) => {
        console.error('Error deleting message:', error);
      },
    });
  }

  isDeletingMessage(messageId: string) {
    return this.deletingMessageIds().has(messageId);
  }
}
