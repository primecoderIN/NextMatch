import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { RegisterCredentials, User } from '../../types/user';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LikesService } from './likes-service';
import { MemberService } from './member-service';
import { clearHttpCache } from '../interceptors/loading-interceptor';
import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  role?: string | string[];
  roles?: string | string[];
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
};

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  private likeService = inject(LikesService);
  private memberService = inject(MemberService);
  currentUser = signal<User | null>(null);

  private baseUrl = environment.apiUrl;

  register(requestBody: RegisterCredentials) {
    return this.http.post<User>(this.baseUrl + 'account/register', requestBody, {
      withCredentials: true,
    }).pipe(
      tap((user) => {
        if (user) {
          this.setCurrentUser(user);
          this.startTokenRefreshTimer();
        }
      }),
    );
  }

  login(requestBody: any) {
    return this.http.post<User>(this.baseUrl + 'account/login', requestBody, {withCredentials: true}).pipe(
      tap((user) => {
        if (user) {
          this.setCurrentUser(user);
          this.startTokenRefreshTimer();
        }
      }),
    );
  }

  refreshToken() {
    return this.http.post<User>(this.baseUrl + 'account/refresh-token', {}, {withCredentials: true});
  }

  startTokenRefreshTimer() {
    setInterval(() => {
      this.http.post<User>(this.baseUrl + 'account/refresh-token', {}, {withCredentials: true}).subscribe({
      next: (user) => {
        if (user) {
          this.setCurrentUser(user);
        }
      },
      error: () => {
        this.logout();
      },
    });
    }, 5*60*1000); // Refresh token every 5 minutes
  }

  setCurrentUser(user: User) {
    const userWithRoles = {
      ...user,
      roles: this.getRolesFromToken(user.token),
    };

    this.currentUser.set(userWithRoles);
    this.likeService.getLikeIds();
  }

  logout() {
    this.currentUser.set(null);
    this.memberService.clearMemberData();
    this.likeService.clearLikeIds();
    clearHttpCache();
  }

  get isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.roles?.includes(role) ?? false;
  }

  private getRolesFromToken(token: string): string[] {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      const roleClaim =
        decodedToken.role ??
        decodedToken.roles ??
        decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (!roleClaim) return [];

      return Array.isArray(roleClaim) ? roleClaim : [roleClaim];
    } catch {
      return [];
    }
  }
}

//Pipe doesn not moify the original observable, it just lets you chain one or more operators
//tap() is a side-effect operator.

// It allows you to do something with the response without modifying it.
