import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { User } from '../../types/user';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  private hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
   onlineUsers = signal<string[]>([]);

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(error => console.log(error));

    this.hubConnection.on("UserOnline", userId => {
      this.onlineUsers.update(prevUsers=> [...prevUsers,userId]);
    });

    this.hubConnection.on("UserOffline", userId => {
      this.onlineUsers.update(prevUsers=> prevUsers.filter(uId=> uId!==userId));
    });

    this.hubConnection.on("GetAllOnlineUsers", onlineUserIds=> {
      this.onlineUsers.set(onlineUserIds);
    })
  }

  stopHubConnection() {
    if(this.hubConnection?.state===HubConnectionState.Connected){
      this.hubConnection.stop().catch(err=> console.log(err))
    }
  }

  get isHubConnectionActive() {
    return this.hubConnection?.state === HubConnectionState.Connected
        || this.hubConnection?.state === HubConnectionState.Connecting
        || this.hubConnection?.state === HubConnectionState.Reconnecting;
  }
}