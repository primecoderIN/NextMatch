import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ToastService } from './toast-service';
import { User } from '../../types/user';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  private hubUrl = environment.hubUrl;
  private toastService = inject(ToastService);
  private hubConnection?: HubConnection;

  createHubConnection(user: User) {
    //first build the connection
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    //Then start the connection
    this.hubConnection.start().catch(error=> console.log(error));

    this.hubConnection.on("UserOnline", email=> {
      this.toastService.success(`User with email ${email} online now.`)
    })

      this.hubConnection.on("UserOffline", email=> {
      this.toastService.success(`User with email ${email} offline now.`)
    })
  }

  stopHubConnection() {
    if(this.hubConnection?.state===HubConnectionState.Connected){
      this.hubConnection.stop().catch(err=> console.log(err))
    }
  }

  get isHubConnectionStateIsConnected() {
    return this.hubConnection?.state===HubConnectionState.Connected
  }
}