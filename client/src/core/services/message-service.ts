import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatedResult } from '../../types/pagination';
import { Message } from '../../types/message';
import { AccountService } from './account-service';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private baseUrl = environment.apiUrl + 'messages';
  private hubUrl = environment.hubUrl + "messages";
  private http = inject(HttpClient);
  private accountService = inject(AccountService);
  private hubConnection? : HubConnection;
  mesageThread = signal<Message[]>([]);


  async createHubConnection(otherUserId: string) {
    // Await stop so we don't race the old connection closing
    await this.stopHubConnection();

    const currentUser = this.accountService.currentUser();
    if(!currentUser) return;

    this.hubConnection = new HubConnectionBuilder().withUrl(this.hubUrl + `?userId=${otherUserId}`, {
      accessTokenFactory: ()=> currentUser.token
    }).withAutomaticReconnect().build();

    this.hubConnection.start().catch(err=> console.error('SignalR connection error:', err));

    this.hubConnection.on("ReceiveMessageThread", (messages: Message[])=> {
      this.mesageThread.set(messages.map(message=> {
        return {
          ...message,
          currentUserSender : message.senderId!==otherUserId
        }
      }));
    })

    this.hubConnection.on("NewMessage", (message: Message) => {
      this.mesageThread.update(messages => [
        ...messages,
        { ...message, currentUserSender: message.senderId === currentUser.id }
      ]);
    });
  }

  async stopHubConnection() {
    if(this.hubConnection?.state === HubConnectionState.Connected
      || this.hubConnection?.state === HubConnectionState.Connecting
      || this.hubConnection?.state === HubConnectionState.Reconnecting) {
      await this.hubConnection.stop().catch(err=> console.log(err));
    }
    this.mesageThread.set([]);
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
