import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { AppInitService } from '../core/services/app-init-service';
import { lastValueFrom } from 'rxjs';
import { AccountService } from '../core/services/account-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(), //Enables HttpClient throughout the app
    provideAppInitializer(async () => {
      //From this callback we are supposed to return a promise or observable
      const appInitService = inject(AppInitService);
      const accountService = inject(AccountService);
      const splash = document.getElementById('splash-screen');

      if (!accountService.isLoggedIn) {
        if (splash) {
          splash.remove();
        }
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        try {
          return lastValueFrom(appInitService.initializeApp());
        } finally {
          setTimeout(() => {
            if (splash) {
              splash.remove();
            }
            resolve();
          }, 1000);
        }
      });
    }),
  ],
};
