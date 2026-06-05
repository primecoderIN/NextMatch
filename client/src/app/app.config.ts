import { ApplicationConfig, provideBrowserGlobalErrorListeners,provideZonelessChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from '../core/interceptors/error-interceptor';
import { jwtInterceptor } from '../core/interceptors/jwt-interceptor';
import { loadingInterceptor } from '../core/interceptors/loading-interceptor';
import { AccountService } from '../core/services/account-service';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Use `provideAppInitializer` below to run a pre-bootstrap async initializer.

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),//Enables zoneless change detection for improved performance
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()), //Enables router with view transitions and route input binding
    provideHttpClient(withInterceptors([errorInterceptor, jwtInterceptor, loadingInterceptor])), //Enables HttpClient throughout the app and activats interceptor
    provideAppInitializer(() => {
      const accountService = inject(AccountService);
      // Skip refresh-token call if we know user is logged out
      try {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
          return Promise.resolve(null);
        }
      } catch {}

      return firstValueFrom(accountService.refreshToken().pipe(catchError(() => of(null)))).then((user) => {
        if (user) {
          (accountService as any).setCurrentUser?.(user);
          (accountService as any).startTokenRefreshTimer?.();
        }
      }).catch(() => {
        accountService.logout();
      });
    }),
  ],
};
