// import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit} from '@angular/core';
// import { lastValueFrom } from 'rxjs';
import { Nav } from "../layout/nav/nav";
import { AccountService } from '../core/services/account-service';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Nav, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  // private accountService = inject(AccountService);
  protected router = inject(Router);
 
  // protected members = signal<User[]>([]);

  async ngOnInit() {
    // this.setCurrentUserFromLocalStorage(); 
    // set current user from local storage on app initialization
    // this.members.set(await this.getMembers());
  }

  //A getter to access members signal value
  //We should not expose signals directly to templates
  // get membersFromApp(): User[] {
  //   return this.members();
  // }

  // setCurrentUserFromLocalStorage = () => {
  //   const userJson = localStorage.getItem('user');
  //   if (userJson) {
  //     const user = JSON.parse(userJson);
  //     this.accountService.currentUser.set(user);
  //   }
  // };

  // getMembers = async () => {
  //   try {
  //     return lastValueFrom(this.http.get<User[]>('https://localhost:5001/api/members'));
  //   } catch (error) {
  //     throw error;
  //   }
  // };
}

// lastValueFrom(): Returns a promise that resolves with the last value emitted by the observable
//Similar to .toPromise() but more explicit

// Subscribes internally

// Resolves once

// Automatically completes

// This avoids memory leaks without needing:

// unsubscribe()

// takeUntilDestroyed()

//This approach is preferred for one-time HTTP calls using signals
