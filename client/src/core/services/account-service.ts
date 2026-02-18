import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { RegisterCredentials, User } from '../../types/user';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LikesService } from './likes-service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  private likeService = inject(LikesService);
  currentUser = signal<User | null>(null);

  private baseUrl = environment.apiUrl;

  register(requestBody: RegisterCredentials) {
    return this.http.post<User>(this.baseUrl + 'account/register', requestBody).pipe(
      tap((user) => {
        if (user) {
          this.setCurrentUser(user);
        }
      }),
    );
  }

  login(requestBody: any) {
    return this.http.post<User>(this.baseUrl + 'account/login', requestBody).pipe(
      tap((user) => {
        if (user) {
          this.setCurrentUser(user);
        }
      }),
    );
  }

  setCurrentUser(user: User) {
    this.currentUser.set(user);
    localStorage.setItem('user', JSON.stringify(user));
    this.likeService.getLikeIds();
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem("filters");
    this.likeService.clearLikeIds();
  }

  get isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}

//Pipe doesn not moify the original observable, it just lets you chain one or more operators
//tap() is a side-effect operator.

// It allows you to do something with the response without modifying it.
