import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatedResult } from '../../types/pagination';
import { Message } from '../../types/message';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private baseUrl = environment.apiUrl + 'messages';
  private hubUrl = environment.hubUrl + "messages";
  private http = inject(HttpClient);
  private hubConnection?: HubConnection;
  private otherUserId?: string;

  mesageThread = signal<Message[]>([]);
  hasMoreMessages = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  unreadCount = signal<number>(0);
  private currentPage = 1;

  /** Called right after older messages are prepended — use to restore scroll position */
  onMoreMessagesReceived?: () => void;

  /** Called right after initial messages are loaded — use to scroll to bottom */
  onMessageThreadReceived?: () => void;

  async createHubConnection(otherUserId: string, token: string, currentUserId: string) {
    // Await stop so we don't race the old connection closing
    await this.stopHubConnection();

    this.otherUserId = otherUserId;
    this.currentPage = 1;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + `?userId=${otherUserId}`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(err => console.error('SignalR connection error:', err));

    // First page of messages (most recent 20)
    this.hubConnection.on("ReceiveMessageThread", (messages: Message[], hasMore: boolean) => {
      this.mesageThread.set(messages.map(m => ({
        ...m,
        currentUserSender: m.senderId !== otherUserId
      })));
      this.hasMoreMessages.set(hasMore);
      // Reload unread count as messages were just marked as read
      this.loadUnreadCount();
      // Fire scroll to bottom callback after Angular has re-rendered
      if (this.onMessageThreadReceived) {
        requestAnimationFrame(() => this.onMessageThreadReceived!());
      }
    });

    // Older pages prepended at the top
    this.hubConnection.on("ReceiveMoreMessages", (messages: Message[], hasMore: boolean) => {
      const older = messages.map(m => ({
        ...m,
        currentUserSender: m.senderId !== otherUserId
      }));
      this.mesageThread.update(current => [...older, ...current]);
      this.hasMoreMessages.set(hasMore);
      this.isLoadingMore.set(false);
      // Fire scroll-restore callback after Angular has re-rendered (next animation frame)
      if (this.onMoreMessagesReceived) {
        requestAnimationFrame(() => this.onMoreMessagesReceived!());
      }
    });

    // New message sent or received in real-time
    this.hubConnection.on("NewMessage", (message: Message) => {
      this.mesageThread.update(messages => [
        ...messages,
        { ...message, currentUserSender: message.senderId === currentUserId }
      ]);
      // A new incoming message means unread count may have changed
      if (message.senderId !== currentUserId) {
        this.loadUnreadCount();
      }
    });

    // Real-time read receipts — the other user just read messages we sent
    this.hubConnection.on("MessagesRead", (messageIds: string[]) => {
      const readSet = new Set(messageIds);
      this.mesageThread.update(messages =>
        messages.map(m =>
          readSet.has(m.id) && !m.dateRead
            ? { ...m, dateRead: new Date().toISOString() }
            : m
        )
      );
    });
  }

  async loadMoreMessages() {
    if (!this.otherUserId || this.isLoadingMore() || !this.hasMoreMessages()) return;

    this.isLoadingMore.set(true);
    this.currentPage++;

    await this.hubConnection?.invoke("LoadMoreMessages", this.otherUserId, this.currentPage)
      .catch(err => {
        console.error('LoadMoreMessages error:', err);
        this.currentPage--; // rollback page on failure
        this.isLoadingMore.set(false);
      });
  }

  async stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected
      || this.hubConnection?.state === HubConnectionState.Connecting
      || this.hubConnection?.state === HubConnectionState.Reconnecting) {
      await this.hubConnection.stop().catch(err => console.log(err));
    }
    this.mesageThread.set([]);
    this.hasMoreMessages.set(false);
    this.isLoadingMore.set(false);
    this.currentPage = 1;
    this.otherUserId = undefined;
    this.onMoreMessagesReceived = undefined;
    this.onMessageThreadReceived = undefined;
  }

  loadUnreadCount() {
    this.http.get<{ count: number }>(this.baseUrl + '/unread-count').subscribe({
      next: (res) => this.unreadCount.set(res.count),
      error: (err) => console.error('Failed to load unread count:', err),
    });
  }

  getMessages(container: string, pageNumber: number, pageSize: number) {
    const params = new HttpParams()
      .append('pageNumber', pageNumber)
      .append('pageSize', pageSize)
      .append('container', container);
    return this.http.get<PaginatedResult<Message[]>>(this.baseUrl, { params });
  }

  getMessageThread(memberId: string) {
    return this.http.get<Message[]>(this.baseUrl + '/thread/' + memberId);
  }

  addMessageToThread(memberId: string, content: string) {
    return this.hubConnection?.invoke("SendMessage", { recipientId: memberId, content });
  }

  deleteMessageById(id: string) {
    return this.http.delete<void>(this.baseUrl + '/' + id);
  }
}
