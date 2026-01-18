import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../../types/user';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);

  baseUrl = 'https://localhost:5001/api/';

  login(requestBody: any) {
    return this.http.post<User>(this.baseUrl + 'account/login', requestBody).pipe(
      tap((user) => {
        if (user) {
          this.currentUser.set(user); // we can assignb type here "user as User" instead of assigning in post<User>
          localStorage.setItem('user', JSON.stringify(user));
        }
      }),
    );
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('user');
  }
}

//Pipe doesn not moify the original observable, it just lets you chain one or more operators
//tap() is a side-effect operator.

// It allows you to do something with the response without modifying it.
