import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  private accountService = inject(AccountService);

  initializeApp() {
    const userJson = localStorage.getItem('user');

    if (!userJson) return of(null); // return an observable that emits null if no user found;

    const user = JSON.parse(userJson);
    this.accountService.currentUser.set(user);
    return of(null); // return an observable that emits the user
  }
}

// This service initializes the application by checking for a stored user in local storage
// and setting the current user in the AccountService if found.

// It is provided in the root injector, making it a singleton service accessible throughout the app.

//Initialize app method will return something async such as obsrvable or promise for the app to wait
// before starting up.
